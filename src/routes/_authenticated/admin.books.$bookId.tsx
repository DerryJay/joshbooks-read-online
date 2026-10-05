import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { friendly, type AdminBookRow } from "@/lib/admin";
import { BookForm } from "@/components/admin/BookForm";
import { ErrorNote, PageHeader, Skeleton, btnGhost } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/books/$bookId")({
  component: EditBook,
});

function EditBook() {
  const { bookId } = Route.useParams();
  const { data, error, isLoading } = useQuery({
    queryKey: ["admin", "book", bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("id, title, author, description, category_id, publication_year, isbn, page_count, cover_url, pdf_url, created_at, categories(name)")
        .eq("id", bookId)
        .maybeSingle();
      if (error) throw friendly(error, "We couldn't load this book.");
      return data as unknown as AdminBookRow | null;
    },
  });
  return (
    <>
      <PageHeader eyebrow="Catalogue" title="Edit Book" action={<Link to="/admin/books" className={btnGhost}>← All books</Link>} />
      {error ? <ErrorNote message={error.message} /> : isLoading ? <Skeleton rows={6} /> : !data ? (
        <ErrorNote message="This book no longer exists." />
      ) : <BookForm book={data} />}
    </>
  );
}
