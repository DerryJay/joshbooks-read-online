import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  ADMIN_PAGE_SIZE, adminBooksQuery, adminCategoriesQuery, friendly, removeFile,
  type AdminBookFilters, type AdminBookRow,
} from "@/lib/admin";
import { Confirm, ErrorNote, PageHeader, Pager, Skeleton, btnGhost, btnPrimary, field, formatDate } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/books/")({
  component: AdminBooks,
});

function AdminBooks() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [f, setF] = useState<Omit<AdminBookFilters, "search">>({ category: "", year: "", sort: "newest", page: 1 });
  const [toDelete, setToDelete] = useState<AdminBookRow | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setF((p) => ({ ...p, page: 1 })); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, error, isLoading, refetch } = useQuery(adminBooksQuery({ ...f, search: debounced }));
  const { data: cats } = useQuery(adminCategoriesQuery());

  async function doDelete(book: AdminBookRow) {
    const { error: err } = await supabase.from("books").delete().eq("id", book.id);
    if (err) { toast.error(friendly(err, "We couldn't delete this book.").message); return; }
    await Promise.all([removeFile("book-covers", book.cover_url), removeFile("book-files", book.pdf_url)]);
    toast.success(`"${book.title}" was deleted.`);
    void qc.invalidateQueries({ queryKey: ["admin"] });
    void qc.invalidateQueries({ queryKey: ["catalogue"] });
  }

  return (
    <>
      <PageHeader eyebrow="Catalogue" title="Books" action={<Link to="/admin/books/new" className={btnPrimary}>+ Add New Book</Link>} />
      <div className="mb-4 grid gap-2 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <input className={field} placeholder="Search title or author…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search books" />
        <select className={field} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value, page: 1 })} aria-label="Category">
          <option value="">All categories</option>
          {(cats ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className={field} placeholder="Year" inputMode="numeric" value={f.year} onChange={(e) => setF({ ...f, year: e.target.value.replace(/\D/g, "").slice(0, 4), page: 1 })} aria-label="Publication year" />
        <select className={field} value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value as AdminBookFilters["sort"], page: 1 })} aria-label="Sort">
          <option value="newest">Newest added</option>
          <option value="oldest">Oldest added</option>
          <option value="az">Title A–Z</option>
          <option value="za">Title Z–A</option>
        </select>
      </div>

      {error ? <ErrorNote message={error.message} onRetry={() => void refetch()} /> : isLoading ? <Skeleton rows={6} /> : data && data.rows.length === 0 ? (
        <p className="rounded-xl border border-parchment/10 p-8 text-center text-sm text-parchment/60">No books match these filters.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-parchment/10 bg-glass/20">
          <table className="w-full text-left text-sm">
            <thead className="hidden bg-parchment/5 font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/50 md:table-header-group">
              <tr>
                <th className="p-3">Book</th><th className="p-3">Category</th><th className="p-3">Year</th>
                <th className="p-3">Added</th><th className="p-3">Activity</th><th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment/10">
              {data?.rows.map((b) => (
                <tr key={b.id} className="flex flex-col gap-2 p-3 md:table-row md:p-0">
                  <td className="md:p-3">
                    <div className="flex items-center gap-3">
                      {b.coverSigned ? (
                        <img src={b.coverSigned} alt="" loading="lazy" className="h-14 w-10 rounded object-cover" />
                      ) : <div className="h-14 w-10 rounded bg-parchment/10" />}
                      <div className="min-w-0">
                        <p className="truncate font-serif text-base font-semibold">{b.title}</p>
                        <p className="truncate text-xs text-parchment/60">{b.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-xs text-parchment/70 md:p-3 md:text-sm">{b.categories?.name ?? "—"}</td>
                  <td className="text-xs text-parchment/70 md:p-3 md:text-sm">{b.publication_year ?? "—"}</td>
                  <td className="text-xs text-parchment/70 md:p-3 md:text-sm">{formatDate(b.created_at)}</td>
                  <td className="text-xs text-parchment/70 md:p-3">{b.readers} readers · {b.favorites} ♥</td>
                  <td className="md:p-3">
                    <div className="flex gap-2 md:justify-end">
                      <Link to="/books/$bookId" params={{ bookId: b.id }} className={btnGhost}>View</Link>
                      <Link to="/admin/books/$bookId" params={{ bookId: b.id }} className={btnGhost}>Edit</Link>
                      <button className={btnGhost} onClick={() => setToDelete(b)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data ? <Pager page={f.page} total={data.total} size={ADMIN_PAGE_SIZE} onPage={(page) => setF({ ...f, page })} /> : null}

      <Confirm
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Are you sure you want to delete this book?"
        description={<>“{toDelete?.title}” will be removed from the catalogue together with its cover and PDF file. Readers' favorites, bookmarks and progress for this book will also be removed. This can't be undone.</>}
        confirmLabel="Delete book"
        onConfirm={() => { if (toDelete) void doDelete(toDelete); setToDelete(null); }}
      />
    </>
  );
}
