-- Categories (public catalogue)
CREATE TABLE public.categories (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT TO anon, authenticated USING (true);

-- Books (public catalogue). id is a stable slug so existing saved data keeps working.
CREATE TABLE public.books (
  id text PRIMARY KEY,
  title text NOT NULL,
  author text NOT NULL,
  description text,
  short_description text,
  category_id text REFERENCES public.categories(id) ON DELETE SET NULL,
  publication_year integer,
  isbn text,
  cover_url text,
  pdf_url text,
  page_count integer NOT NULL DEFAULT 0,
  publisher text,
  language text,
  pages_label text,
  featured boolean NOT NULL DEFAULT false,
  is_public_domain boolean NOT NULL DEFAULT true,
  content jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON COLUMN public.books.content IS 'Demo text excerpt pages (array of arrays of paragraphs). Full files live in Storage via pdf_url.';
GRANT SELECT ON public.books TO anon, authenticated;
GRANT ALL ON public.books TO service_role;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Books are publicly readable" ON public.books FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX books_category_idx ON public.books (category_id);
CREATE INDEX books_author_idx ON public.books (author);
CREATE INDEX books_year_idx ON public.books (publication_year);
CREATE INDEX books_title_lower_idx ON public.books (lower(title));
CREATE INDEX books_featured_idx ON public.books (featured) WHERE featured;
CREATE TRIGGER books_set_updated_at BEFORE UPDATE ON public.books
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Profiles: explicit user_id + avatar
ALTER TABLE public.profiles ADD COLUMN user_id uuid;
ALTER TABLE public.profiles ADD COLUMN avatar_url text;
UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;
ALTER TABLE public.profiles ALTER COLUMN user_id SET DEFAULT auth.uid();
CREATE UNIQUE INDEX profiles_user_id_key ON public.profiles (user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, full_name, email)
  VALUES (NEW.id, NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Favorites: surrogate id; (user_id, book_id) PK already prevents duplicates
ALTER TABLE public.favorites ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX favorites_id_key ON public.favorites (id);
ALTER TABLE public.favorites ADD CONSTRAINT favorites_book_id_fkey
  FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE NOT VALID;

-- Bookmarks: page_number alias + updated_at
ALTER TABLE public.bookmarks ADD COLUMN page_number integer GENERATED ALWAYS AS (page) STORED;
ALTER TABLE public.bookmarks ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX bookmarks_user_book_idx ON public.bookmarks (user_id, book_id);
ALTER TABLE public.bookmarks ADD CONSTRAINT bookmarks_book_id_fkey
  FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE NOT VALID;
CREATE TRIGGER bookmarks_set_updated_at BEFORE UPDATE ON public.bookmarks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Reading progress: one row per (user, book) already enforced by PK
ALTER TABLE public.reading_progress ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.reading_progress ADD COLUMN current_page integer GENERATED ALWAYS AS (page) STORED;
ALTER TABLE public.reading_progress ADD COLUMN progress_percentage integer NOT NULL DEFAULT 0;
ALTER TABLE public.reading_progress ADD COLUMN last_read_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.reading_progress ADD COLUMN completed boolean NOT NULL DEFAULT false;
UPDATE public.reading_progress SET
  last_read_at = updated_at,
  progress_percentage = CASE WHEN total_pages > 0 THEN LEAST(100, ROUND(((page + 1)::numeric / total_pages) * 100))::int ELSE 0 END,
  completed = (total_pages > 0 AND page >= total_pages - 1);
CREATE UNIQUE INDEX reading_progress_id_key ON public.reading_progress (id);
CREATE INDEX reading_progress_recent_idx ON public.reading_progress (user_id, last_read_at DESC);
ALTER TABLE public.reading_progress ADD CONSTRAINT reading_progress_book_id_fkey
  FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE NOT VALID;