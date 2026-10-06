import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { USERS_PAGE_SIZE, adminUsersQuery, type AdminUser } from "@/lib/admin";
import { setUserDisabled } from "@/lib/admin.functions";
import { Confirm, ErrorNote, PageHeader, Pager, Skeleton, btnGhost, field, formatDate } from "@/components/admin/AdminUI";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: Users,
});

function Users() {
  const qc = useQueryClient();
  const toggle = useServerFn(setUserDisabled);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<AdminUser | null>(null);
  const [confirm, setConfirm] = useState<AdminUser | null>(null);

  useEffect(() => { const t = setTimeout(() => { setQ(search); setPage(1); }, 300); return () => clearTimeout(t); }, [search]);
  const { data, error, isLoading, refetch } = useQuery(adminUsersQuery(q, page));

  async function doToggle(u: AdminUser) {
    try {
      await toggle({ data: { userId: u.id, disabled: !u.disabled } });
      toast.success(u.disabled ? "Account enabled." : "Account disabled.");
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "We couldn't update this account.");
    }
  }

  return (
    <>
      <PageHeader eyebrow="Readers" title="Users" />
      <input className={`${field} mb-4`} placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search users" />
      {error ? <ErrorNote message={error.message} onRetry={() => void refetch()} /> : isLoading ? <Skeleton /> : (
        <div className="overflow-hidden rounded-2xl border border-parchment/10 bg-glass/20">
          <table className="w-full text-left text-sm">
            <thead className="hidden bg-parchment/5 font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/50 md:table-header-group">
              <tr><th className="p-3">User</th><th className="p-3">Registered</th><th className="p-3">Status</th><th className="p-3">Favorites</th><th className="p-3">Books read</th><th className="p-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-parchment/10">
              {data?.rows.length === 0 ? <tr><td className="p-6 text-center text-parchment/50" colSpan={6}>No users found.</td></tr> : data?.rows.map((u) => (
                <tr key={u.id} className="flex flex-col gap-1 p-3 md:table-row md:p-0">
                  <td className="md:p-3"><p className="font-medium">{u.full_name || "—"} {u.is_admin ? <span className="ml-1 rounded-full bg-sand/20 px-2 py-0.5 font-mono text-[10px] uppercase text-sand">admin</span> : null}</p><p className="text-xs text-parchment/55">{u.email}</p></td>
                  <td className="text-xs text-parchment/70 md:p-3">{formatDate(u.created_at)}</td>
                  <td className="md:p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${u.disabled ? "bg-oxblood/30 text-parchment" : "bg-parchment/10 text-parchment/80"}`}>{u.disabled ? "Disabled" : "Active"}</span></td>
                  <td className="text-xs text-parchment/70 md:p-3">{u.favorites}</td>
                  <td className="text-xs text-parchment/70 md:p-3">{u.books_started} started · {u.books_completed} finished</td>
                  <td className="md:p-3"><div className="flex gap-2 md:justify-end">
                    <button className={btnGhost} onClick={() => setView(u)}>View</button>
                    {!u.is_admin ? <button className={btnGhost} onClick={() => setConfirm(u)}>{u.disabled ? "Enable" : "Disable"}</button> : null}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data ? <Pager page={page} total={data.total} size={USERS_PAGE_SIZE} onPage={setPage} /> : null}

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{view?.full_name || view?.email}</DialogTitle></DialogHeader>
          {view ? (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <dt className="text-muted-foreground">Email</dt><dd className="break-all">{view.email}</dd>
              <dt className="text-muted-foreground">Registered</dt><dd>{formatDate(view.created_at)}</dd>
              <dt className="text-muted-foreground">Status</dt><dd>{view.disabled ? "Disabled" : "Active"}</dd>
              <dt className="text-muted-foreground">Favorites</dt><dd>{view.favorites}</dd>
              <dt className="text-muted-foreground">Bookmarks</dt><dd>{view.bookmarks}</dd>
              <dt className="text-muted-foreground">Books started</dt><dd>{view.books_started}</dd>
              <dt className="text-muted-foreground">Books finished</dt><dd>{view.books_completed}</dd>
              <dt className="text-muted-foreground">Last active</dt><dd>{formatDate(view.last_active)}</dd>
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>

      <Confirm
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.disabled ? "Enable this account?" : "Disable this account?"}
        description={confirm?.disabled ? "This reader will be able to sign in again." : "This reader won't be able to sign in until the account is enabled again. Their data is kept."}
        confirmLabel={confirm?.disabled ? "Enable" : "Disable"}
        onConfirm={() => { if (confirm) void doToggle(confirm); setConfirm(null); }}
      />
    </>
  );
}
