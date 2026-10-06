import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  adminCategoriesQuery, friendly, removeFile, slugify, uploadWithProgress, validateCover, validatePdf,
  type AdminBookRow,
} from "@/lib/admin";
import { Confirm, ErrorNote, btnGhost, btnPrimary, field, label } from "./AdminUI";

type Errors = Partial<Record<"title" | "author" | "description" | "category" | "year" | "isbn" | "pages" | "cover" | "pdf", string>>;

export function BookForm({ book }: { book?: AdminBookRow }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: cats } = useQuery(adminCategoriesQuery());
  const [v, setV] = useState({
    title: book?.title ?? "",
    author: book?.author ?? "",
    description: book?.description ?? "",
    category: book?.category_id ?? "",
    year: book?.publication_year ? String(book.publication_year) : "",
    isbn: book?.isbn ?? "",
    pages: book?.page_count ? String(book.page_count) : "",
  });
  const [cover, setCover] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [progress, setProgress] = useState<{ cover?: number; pdf?: number }>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);

  function validate(): Errors {
    const e: Errors = {};
    if (!v.title.trim()) e.title = "Title is required.";
    else if (v.title.length > 200) e.title = "Title must be under 200 characters.";
    if (!v.author.trim()) e.author = "Author is required.";
    if (!v.description.trim()) e.description = "Description is required.";
    else if (v.description.length > 5000) e.description = "Description must be under 5000 characters.";
    if (!v.category) e.category = "Choose a category.";
    if (v.year && (!/^\d{1,4}$/.test(v.year) || Number(v.year) > new Date().getFullYear())) e.year = "Enter a valid year.";
    if (v.isbn && !/^[0-9Xx-]{10,17}$/.test(v.isbn)) e.isbn = "ISBN should be 10–13 digits (dashes allowed).";
    if (v.pages && (!/^\d+$/.test(v.pages) || Number(v.pages) > 100000)) e.pages = "Enter a whole number of pages.";
    if (cover) { const c = validateCover(cover); if (c) e.cover = c; }
    if (pdf) { const p = validatePdf(pdf); if (p) e.pdf = p; }
    if (!pdf && !book?.pdf_url) e.pdf = "A PDF file is required.";
    return e;
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    if (book && ((cover && book.cover_url) || (pdf && book.pdf_url))) setConfirmReplace(true);
    else void save();
  }

  async function save() {
    setBusy(true);
    setFormError(null);
    const id = book?.id ?? `${slugify(v.title) || "book"}-${Math.random().toString(36).slice(2, 7)}`;
    const stamp = Date.now();
    let coverPath = book?.cover_url ?? null;
    let pdfPath = book?.pdf_url ?? null;
    const uploaded: { bucket: "book-covers" | "book-files"; path: string }[] = [];
    try {
      if (cover) {
        const ext = cover.name.split(".").pop()?.toLowerCase() ?? "jpg";
        coverPath = await uploadWithProgress("book-covers", `${id}-${stamp}.${ext}`, cover, (p) => setProgress((s) => ({ ...s, cover: p })));
        uploaded.push({ bucket: "book-covers", path: coverPath });
      }
      if (pdf) {
        pdfPath = await uploadWithProgress("book-files", `${id}-${stamp}.pdf`, pdf, (p) => setProgress((s) => ({ ...s, pdf: p })));
        uploaded.push({ bucket: "book-files", path: pdfPath });
      }
      const row = {
        title: v.title.trim(),
        author: v.author.trim(),
        description: v.description.trim(),
        short_description: v.description.trim().slice(0, 180),
        category_id: v.category,
        publication_year: v.year ? Number(v.year) : null,
        isbn: v.isbn.trim() || null,
        page_count: v.pages ? Number(v.pages) : 0,
        pages_label: v.pages ? `${v.pages} pages` : null,
        cover_url: coverPath,
        pdf_url: pdfPath,
      };
      const { error } = book
        ? await supabase.from("books").update(row).eq("id", book.id)
        : await supabase.from("books").insert({ id, ...row, is_public_domain: true });
      if (error) throw friendly(error, "We couldn't save this book.");
      // Clean up files that were replaced so unused files don't pile up.
      if (book && cover && book.cover_url !== coverPath) await removeFile("book-covers", book.cover_url);
      if (book && pdf && book.pdf_url !== pdfPath) await removeFile("book-files", book.pdf_url);
      toast.success(book ? "Book updated." : "Book added to the catalogue.");
      void qc.invalidateQueries({ queryKey: ["admin"] });
      void qc.invalidateQueries({ queryKey: ["catalogue"] });
      void qc.invalidateQueries({ queryKey: ["book", id] });
      navigate({ to: "/admin/books" });
    } catch (err) {
      for (const u of uploaded) await removeFile(u.bucket, u.path);
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setV({ ...v, [k]: e.target.value });
  const Err = ({ k }: { k: keyof Errors }) => (errors[k] ? <p className="mt-1 text-xs text-sand">{errors[k]}</p> : null);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-2xl border border-parchment/10 bg-glass/25 p-5 backdrop-blur-md md:p-7">
      {formError ? <ErrorNote message={formError} /> : null}
      <div className="grid gap-5 md:grid-cols-2">
        <div><label className={label} htmlFor="t">Book title *</label><input id="t" className={field} value={v.title} onChange={set("title")} /><Err k="title" /></div>
        <div><label className={label} htmlFor="a">Author *</label><input id="a" className={field} value={v.author} onChange={set("author")} /><Err k="author" /></div>
      </div>
      <div><label className={label} htmlFor="d">Description *</label><textarea id="d" rows={5} className={field} value={v.description} onChange={set("description")} /><Err k="description" /></div>
      <div className="grid gap-5 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className={label} htmlFor="c">Category *</label>
          <select id="c" className={field} value={v.category} onChange={set("category")}>
            <option value="">Choose…</option>
            {(cats ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select><Err k="category" />
        </div>
        <div><label className={label} htmlFor="y">Publication year</label><input id="y" inputMode="numeric" className={field} value={v.year} onChange={set("year")} /><Err k="year" /></div>
        <div><label className={label} htmlFor="p">Page count</label><input id="p" inputMode="numeric" className={field} value={v.pages} onChange={set("pages")} /><Err k="pages" /></div>
      </div>
      <div className="md:w-1/2"><label className={label} htmlFor="i">ISBN</label><input id="i" className={field} value={v.isbn} onChange={set("isbn")} /><Err k="isbn" /></div>
      <div className="grid gap-5 md:grid-cols-2">
        <FilePick id="cover" title="Book cover (JPG, PNG, WebP · max 5 MB)" accept="image/jpeg,image/png,image/webp" file={cover} current={book?.cover_url} onFile={setCover} progress={progress.cover} error={errors.cover} />
        <FilePick id="pdf" title="PDF file * (max 100 MB)" accept="application/pdf" file={pdf} current={book?.pdf_url} onFile={setPdf} progress={progress.pdf} error={errors.pdf} />
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="submit" className={btnPrimary} disabled={busy}>{busy ? "Saving…" : book ? "Save changes" : "Add book"}</button>
        <button type="button" className={btnGhost} onClick={() => navigate({ to: "/admin/books" })} disabled={busy}>Cancel</button>
      </div>
      <Confirm
        open={confirmReplace}
        onOpenChange={setConfirmReplace}
        title="Replace existing files?"
        description="The current cover and/or PDF will be permanently replaced by the new upload, and the old file will be deleted."
        confirmLabel="Replace and save"
        onConfirm={() => { setConfirmReplace(false); void save(); }}
      />
    </form>
  );
}

function FilePick({ id, title, accept, file, current, onFile, progress, error }: {
  id: string; title: string; accept: string; file: File | null; current?: string | null | undefined;
  onFile: (f: File | null) => void; progress?: number | undefined; error?: string | undefined;
}) {
  return (
    <div>
      <label className={label} htmlFor={id}>{title}</label>
      <input id={id} type="file" accept={accept} onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-parchment/70 file:mr-3 file:rounded-full file:border-0 file:bg-parchment/10 file:px-4 file:py-2 file:text-parchment" />
      <p className="mt-1 text-xs text-parchment/50">
        {file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB` : current ? `Current file: ${current}` : "No file selected"}
      </p>
      {progress !== undefined ? (
        <div className="mt-2">
          <div className="h-1.5 rounded-full bg-parchment/10"><div className="h-1.5 rounded-full bg-sand" style={{ width: `${progress}%` }} /></div>
          <p className="mt-1 text-xs text-parchment/60">{progress < 100 ? `Uploading… ${progress}%` : "Upload complete ✓"}</p>
        </div>
      ) : null}
      {error ? <p className="mt-1 text-xs text-sand">{error}</p> : null}
    </div>
  );
}
