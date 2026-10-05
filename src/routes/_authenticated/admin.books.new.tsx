import { createFileRoute } from "@tanstack/react-router";
import { BookForm } from "@/components/admin/BookForm";
import { PageHeader } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/books/new")({
  component: () => (
    <>
      <PageHeader eyebrow="Catalogue" title="Add Book" />
      <BookForm />
    </>
  ),
});
