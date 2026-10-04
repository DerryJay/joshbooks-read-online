CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Account status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS disabled boolean NOT NULL DEFAULT false;

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin catalogue management
GRANT INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
CREATE POLICY "Admins insert books" ON public.books FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update books" ON public.books FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete books" ON public.books FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update categories" ON public.categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete categories" ON public.categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS books_created_at_idx ON public.books (created_at DESC);
CREATE INDEX IF NOT EXISTS books_category_idx ON public.books (category_id);
CREATE INDEX IF NOT EXISTS books_year_idx ON public.books (publication_year);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles (created_at DESC);

-- Admin storage management
CREATE POLICY "Admins upload catalogue files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('book-covers','book-files') AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update catalogue files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('book-covers','book-files') AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete catalogue files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('book-covers','book-files') AND public.has_role(auth.uid(), 'admin'));

-- Audit log
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  target_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit log" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX audit_log_created_idx ON public.audit_log (created_at DESC);

CREATE OR REPLACE FUNCTION public.log_catalogue_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  rec record;
  kind text := CASE TG_TABLE_NAME WHEN 'books' THEN 'book' ELSE 'category' END;
  verb text := CASE TG_OP WHEN 'INSERT' THEN 'created' WHEN 'UPDATE' THEN 'edited' ELSE 'deleted' END;
BEGIN
  IF TG_OP = 'DELETE' THEN rec := OLD; ELSE rec := NEW; END IF;
  INSERT INTO public.audit_log (admin_id, action, target_type, target_id, target_label)
  VALUES (auth.uid(), kind || '.' || verb, kind, rec.id,
          CASE WHEN kind = 'book' THEN to_jsonb(rec)->>'title' ELSE to_jsonb(rec)->>'name' END);
  RETURN NULL;
END $$;

CREATE TRIGGER books_audit AFTER INSERT OR UPDATE OR DELETE ON public.books FOR EACH ROW EXECUTE FUNCTION public.log_catalogue_change();
CREATE TRIGGER categories_audit AFTER INSERT OR UPDATE OR DELETE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.log_catalogue_change();

-- Aggregated admin statistics (admin-only, no private rows exposed)
CREATE OR REPLACE FUNCTION public.admin_dashboard_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501'; END IF;
  RETURN jsonb_build_object(
    'totals', jsonb_build_object(
      'books', (SELECT count(*) FROM books),
      'users', (SELECT count(*) FROM profiles),
      'categories', (SELECT count(*) FROM categories),
      'favorites', (SELECT count(*) FROM favorites),
      'reading', (SELECT count(*) FROM reading_progress),
      'bookmarks', (SELECT count(*) FROM bookmarks),
      'completed', (SELECT count(*) FROM reading_progress WHERE completed)),
    'by_category', COALESCE((SELECT jsonb_agg(x ORDER BY x.count DESC) FROM (
        SELECT c.id, c.name, count(b.id) AS count FROM categories c LEFT JOIN books b ON b.category_id = c.id GROUP BY c.id, c.name) x), '[]'),
    'popular', COALESCE((SELECT jsonb_agg(x) FROM (
        SELECT b.id, b.title, count(r.id) AS count FROM books b JOIN reading_progress r ON r.book_id = b.id
        GROUP BY b.id, b.title ORDER BY count(r.id) DESC LIMIT 6) x), '[]'),
    'favorited', COALESCE((SELECT jsonb_agg(x) FROM (
        SELECT b.id, b.title, count(f.id) AS count FROM books b JOIN favorites f ON f.book_id = b.id
        GROUP BY b.id, b.title ORDER BY count(f.id) DESC LIMIT 6) x), '[]'),
    'recently_active', COALESCE((SELECT jsonb_agg(x) FROM (
        SELECT b.id, b.title, max(r.last_read_at) AS last_read_at, count(r.id) AS count FROM books b JOIN reading_progress r ON r.book_id = b.id
        GROUP BY b.id, b.title ORDER BY max(r.last_read_at) DESC LIMIT 8) x), '[]'),
    'new_users', COALESCE((SELECT jsonb_agg(x ORDER BY x.day) FROM (
        SELECT d::date AS day, (SELECT count(*) FROM profiles p WHERE p.created_at::date = d::date) AS count
        FROM generate_series(current_date - 29, current_date, interval '1 day') d) x), '[]'),
    'reading_by_day', COALESCE((SELECT jsonb_agg(x ORDER BY x.day) FROM (
        SELECT d::date AS day, (SELECT count(*) FROM reading_progress r WHERE r.last_read_at::date = d::date) AS count
        FROM generate_series(current_date - 13, current_date, interval '1 day') d) x), '[]')
  );
END $$;

CREATE OR REPLACE FUNCTION public.admin_book_activity(_ids text[])
RETURNS TABLE (book_id text, readers bigint, favorites bigint) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501'; END IF;
  RETURN QUERY SELECT b.id,
    (SELECT count(*) FROM reading_progress r WHERE r.book_id = b.id),
    (SELECT count(*) FROM favorites f WHERE f.book_id = b.id)
  FROM books b WHERE b.id = ANY(_ids);
END $$;

CREATE OR REPLACE FUNCTION public.admin_list_users(_search text DEFAULT '', _limit int DEFAULT 20, _offset int DEFAULT 0)
RETURNS TABLE (id uuid, full_name text, email text, created_at timestamptz, disabled boolean, is_admin boolean,
               favorites bigint, books_started bigint, books_completed bigint, bookmarks bigint, last_active timestamptz, total bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501'; END IF;
  RETURN QUERY
  WITH filtered AS (
    SELECT p.* FROM profiles p
    WHERE _search = '' OR p.full_name ILIKE '%' || _search || '%' OR p.email ILIKE '%' || _search || '%'
  )
  SELECT p.id, p.full_name, p.email, p.created_at, p.disabled,
    public.has_role(p.id, 'admin'),
    (SELECT count(*) FROM favorites f WHERE f.user_id = p.id),
    (SELECT count(*) FROM reading_progress r WHERE r.user_id = p.id),
    (SELECT count(*) FROM reading_progress r WHERE r.user_id = p.id AND r.completed),
    (SELECT count(*) FROM bookmarks k WHERE k.user_id = p.id),
    (SELECT max(r.last_read_at) FROM reading_progress r WHERE r.user_id = p.id),
    (SELECT count(*) FROM filtered)
  FROM filtered p ORDER BY p.created_at DESC
  LIMIT LEAST(GREATEST(_limit, 1), 100) OFFSET GREATEST(_offset, 0);
END $$;

REVOKE EXECUTE ON FUNCTION public.admin_dashboard_stats() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_book_activity(text[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_users(text, int, int) FROM anon;