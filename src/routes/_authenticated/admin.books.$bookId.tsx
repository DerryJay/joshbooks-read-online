import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
      const { doc, getDoc } = await import("firebase/firestore");
      const { db } = await import("@/integrations/firebase/client");
      const snap = await getDoc(doc(db, "books", bookId));
      if (!snap.exists()) return null;
      const b = snap.data();
      return {
        id: (b["id"] as string) || bookId,
        title: (b["title"] as string) || "",
        author: (b["author"] as string) || "",
        description: (b["description"] as string) || null,
        category_id: (b["categoryId"] as string) || null,
        publication_year: b["publicationYear"] ? Number(b["publicationYear"]) : null,
        isbn: (b["isbn"] as string) || null,
        page_count: (b["pageCount"] as number) || 0,
        cover_url: (b["cover"] as string) || (b["coverUrl"] as string) || null,
        pdf_url: (b["documentUrl"] as string) || (b["pdfUrl"] as string) || null,
        created_at: new Date((b["createdAt"] as number) || Date.now()).toISOString(),
        categories: { name: (b["category"] as string) || "Classics" },
        coverSigned: (b["cover"] as string) || (b["coverUrl"] as string) || null,
        readers: 0,
        favorites: 0,
      } as AdminBookRow;
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
