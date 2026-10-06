import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminCategoriesQuery, friendly, slugify } from "@/lib/admin";
import { Confirm, ErrorNote, PageHeader, Panel, Skeleton, btnGhost, btnPrimary, field, label } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: Categories,
});

type Cat = { id: string; name: string; description: string | null; books: number };

function Categories() {
  const qc = useQueryClient();
  const { data, error, isLoading, refetch } = useQuery(adminCategoriesQuery());
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Cat | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<Cat | null>(null);
  const [moveTo, setMoveTo] = useState("");

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["admin"] });
    void qc.invalidateQueries({ queryKey: ["categories"] });
    void qc.invalidateQueries({ queryKey: ["catalogue"] });
  };

  function startEdit(c: Cat | null) {
    setEditing(c); setName(c?.name ?? ""); setDesc(c?.description ?? ""); setErr(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return setErr("Category name is required.");
    if (n.length > 80) return setErr("Name must be under 80 characters.");
    setBusy(true);
    const res = editing
      ? await supabase.from("categories").update({ name: n, description: desc.trim() || null }).eq("id", editing.id)
      : await supabase.from("categories").insert({ id: slugify(n) || `cat-${Date.now()}`, name: n, description: desc.trim() || null });
    setBusy(false);
    if (res.error) return setErr(friendly(res.error, "We couldn't save this category.").message);
    toast.success(editing ? "Category updated." : "Category created.");
    startEdit(null);
    refresh();
  }

  async function remove(c: Cat) {
    if (c.books > 0) {
      if (!moveTo) { toast.error("Choose a category to move its books to first."); return; }
      const { error: mErr } = await supabase.from("books").update({ category_id: moveTo }).eq("category_id", c.id);
      if (mErr) { toast.error(friendly(mErr, "We couldn't reassign the books.").message); return; }
    }
    const { error: dErr } = await supabase.from("categories").delete().eq("id", c.id);
    if (dErr) { toast.error(friendly(dErr, "We couldn't delete this category.").message); return; }
    toast.success("Category deleted.");
    setMoveTo("");
    refresh();
  }

  const list = (data ?? []).filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageHeader eyebrow="Catalogue" title="Categories" />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div>
          <input className={`${field} mb-3`} placeholder="Search categories…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search categories" />
          {error ? <ErrorNote message={error.message} onRetry={() => void refetch()} /> : isLoading ? <Skeleton /> : (
            <ul className="divide-y divide-parchment/10 rounded-2xl border border-parchment/10 bg-glass/20">
              {list.length === 0 ? <li className="p-6 text-center text-sm text-parchment/50">No categories found.</li> : list.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-serif text-lg font-semibold">{c.name}</p>
                    <p className="text-xs text-parchment/55">{c.books} book{c.books === 1 ? "" : "s"}{c.description ? ` · ${c.description}` : ""}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className={btnGhost} onClick={() => startEdit(c)}>Edit</button>
                    <button className={btnGhost} onClick={() => { setMoveTo(""); setToDelete(c); }}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Panel title={editing ? "Edit category" : "Add category"}>
          <form onSubmit={save} className="space-y-4" noValidate>
            <div><label className={label} htmlFor="cn">Name *</label><input id="cn" className={field} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label className={label} htmlFor="cd">Description</label><textarea id="cd" rows={3} className={field} value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
            {err ? <p className="text-xs text-sand">{err}</p> : null}
            <div className="flex gap-2">
              <button className={btnPrimary} disabled={busy}>{busy ? "Saving…" : editing ? "Save" : "Add category"}</button>
              {editing ? <button type="button" className={btnGhost} onClick={() => startEdit(null)}>Cancel</button> : null}
            </div>
          </form>
        </Panel>
      </div>
      <Confirm
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete this category?"
        description={toDelete && toDelete.books > 0 ? (
          <span className="block space-y-2">
            <span className="block">“{toDelete.name}” still has {toDelete.books} book(s). Move them to another category before deleting:</span>
            <select className={field} value={moveTo} onChange={(e) => setMoveTo(e.target.value)} aria-label="Move books to">
              <option value="">Choose a category…</option>
              {(data ?? []).filter((c) => c.id !== toDelete.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </span>
        ) : <>“{toDelete?.name}” has no books and will be removed.</>}
        confirmLabel="Delete category"
        onConfirm={() => { if (toDelete) void remove(toDelete); setToDelete(null); }}
      />
    </>
  );
}
