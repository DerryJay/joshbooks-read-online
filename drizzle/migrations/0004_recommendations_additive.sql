CREATE TABLE public.book_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id text NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_ratings TO authenticated;
GRANT ALL ON public.book_ratings TO service_role;
ALTER TABLE public.book_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own ratings" ON public.book_ratings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX book_ratings_book_idx ON public.book_ratings(book_id);
CREATE TRIGGER book_ratings_set_updated_at BEFORE UPDATE ON public.book_ratings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.recommendation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id text NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('viewed','started_reading','completed','favorited','unfavorited','bookmarked','rated','recommendation_clicked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id, event_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommendation_events TO authenticated;
GRANT ALL ON public.recommendation_events TO service_role;
ALTER TABLE public.recommendation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own recommendation events" ON public.recommendation_events FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX recommendation_events_type_book_idx ON public.recommendation_events(event_type, book_id);
CREATE INDEX recommendation_events_user_time_idx ON public.recommendation_events(user_id, created_at DESC);

CREATE TABLE public.recommendation_impressions (
  book_id text NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT current_date,
  impressions integer NOT NULL DEFAULT 0,
  PRIMARY KEY (book_id, day)
);
GRANT ALL ON public.recommendation_impressions TO service_role;
ALTER TABLE public.recommendation_impressions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.book_stats (
  book_id text PRIMARY KEY REFERENCES public.books(id) ON DELETE CASCADE,
  readers integer NOT NULL DEFAULT 0,
  completed integer NOT NULL DEFAULT 0,
  favorites integer NOT NULL DEFAULT 0,
  views integer NOT NULL DEFAULT 0,
  rating_avg numeric(3,2),
  rating_count integer NOT NULL DEFAULT 0,
  refreshed_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.book_stats TO service_role;
ALTER TABLE public.book_stats ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS favorites_book_idx ON public.favorites(book_id);
CREATE INDEX IF NOT EXISTS reading_progress_book_idx ON public.reading_progress(book_id);

CREATE OR REPLACE FUNCTION public.public_book_stats()
RETURNS TABLE(book_id text, readers integer, completed integer, favorites integer, views integer, rating_avg numeric, rating_count integer)
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF (SELECT coalesce(min(s.refreshed_at), 'epoch') FROM book_stats s) < now() - interval '10 minutes'
     OR (SELECT count(*) FROM book_stats) <> (SELECT count(*) FROM books) THEN
    IF pg_try_advisory_xact_lock(42042) THEN
      INSERT INTO book_stats AS t (book_id, readers, completed, favorites, views, rating_avg, rating_count, refreshed_at)
      SELECT b.id,
        (SELECT count(*) FROM reading_progress r WHERE r.book_id = b.id),
        (SELECT count(*) FROM reading_progress r WHERE r.book_id = b.id AND r.completed),
        (SELECT count(*) FROM favorites f WHERE f.book_id = b.id),
        (SELECT count(*) FROM recommendation_events e WHERE e.book_id = b.id AND e.event_type = 'viewed'),
        (SELECT round(avg(x.rating)::numeric, 2) FROM book_ratings x WHERE x.book_id = b.id),
        (SELECT count(*) FROM book_ratings x WHERE x.book_id = b.id),
        now()
      FROM books b
      ON CONFLICT (book_id) DO UPDATE SET readers = EXCLUDED.readers, completed = EXCLUDED.completed,
        favorites = EXCLUDED.favorites, views = EXCLUDED.views, rating_avg = EXCLUDED.rating_avg,
        rating_count = EXCLUDED.rating_count, refreshed_at = EXCLUDED.refreshed_at;
    END IF;
  END IF;
  RETURN QUERY SELECT s.book_id, s.readers, s.completed, s.favorites, s.views, s.rating_avg, s.rating_count FROM book_stats s;
END $$;
REVOKE ALL ON FUNCTION public.public_book_stats() FROM public;
GRANT EXECUTE ON FUNCTION public.public_book_stats() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.log_recommendation_impressions(_ids text[])
RETURNS void LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  INSERT INTO recommendation_impressions (book_id, day, impressions)
  SELECT DISTINCT b.id, current_date, 1 FROM books b WHERE b.id = ANY(_ids[1:24])
  ON CONFLICT (book_id, day) DO UPDATE SET impressions = recommendation_impressions.impressions + 1;
END $$;
REVOKE ALL ON FUNCTION public.log_recommendation_impressions(text[]) FROM public;
GRANT EXECUTE ON FUNCTION public.log_recommendation_impressions(text[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_recommendation_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501'; END IF;
  RETURN jsonb_build_object(
    'impressions', (SELECT coalesce(sum(impressions),0) FROM recommendation_impressions),
    'clicks', (SELECT count(*) FROM recommendation_events WHERE event_type = 'recommendation_clicked'),
    'most_recommended', COALESCE((SELECT jsonb_agg(x) FROM (
      SELECT b.id, b.title, sum(i.impressions) AS count FROM recommendation_impressions i JOIN books b ON b.id = i.book_id
      GROUP BY b.id, b.title ORDER BY sum(i.impressions) DESC LIMIT 6) x), '[]'),
    'most_viewed', COALESCE((SELECT jsonb_agg(x) FROM (
      SELECT b.id, b.title, count(*) AS count FROM recommendation_events e JOIN books b ON b.id = e.book_id
      WHERE e.event_type = 'viewed' GROUP BY b.id, b.title ORDER BY count(*) DESC LIMIT 6) x), '[]'),
    'most_completed', COALESCE((SELECT jsonb_agg(x) FROM (
      SELECT b.id, b.title, count(*) AS count FROM reading_progress r JOIN books b ON b.id = r.book_id
      WHERE r.completed GROUP BY b.id, b.title ORDER BY count(*) DESC LIMIT 6) x), '[]'),
    'popular_categories', COALESCE((SELECT jsonb_agg(x) FROM (
      SELECT c.id, c.name, count(e.id) AS count FROM recommendation_events e JOIN books b ON b.id = e.book_id
      JOIN categories c ON c.id = b.category_id WHERE e.event_type <> 'unfavorited'
      GROUP BY c.id, c.name ORDER BY count(e.id) DESC LIMIT 8) x), '[]')
  );
END $$;
REVOKE ALL ON FUNCTION public.admin_recommendation_stats() FROM public;
GRANT EXECUTE ON FUNCTION public.admin_recommendation_stats() TO authenticated;