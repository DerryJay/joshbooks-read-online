import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AUDIT_PAGE_SIZE, auditQuery } from "@/lib/admin";
import { ErrorNote, PageHeader, Pager, Skeleton } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  component: Audit,
});

const labels: Record<string, string> = {
  "book.created": "Book added", "book.edited": "Book edited", "book.deleted": "Book deleted",
  "category.created": "Category created", "category.edited": "Category edited", "category.deleted": "Category deleted",
  "user.disabled": "Account disabled", "user.enabled": "Account enabled",
};

function Audit() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading, refetch } = useQuery(auditQuery(page));
  return (
    <>
      <PageHeader eyebrow="Accountability" title="Audit Log" />
      {error ? <ErrorNote message={error.message} onRetry={() => void refetch()} /> : isLoading ? <Skeleton rows={8} /> : (
        <ul className="divide-y divide-parchment/10 rounded-2xl border border-parchment/10 bg-glass/20">
          {data?.rows.length === 0 ? <li className="p-6 text-center text-sm text-parchment/50">No admin actions recorded yet.</li> : data?.rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
              <div className="min-w-0">
                <p className="font-medium">{labels[r.action] ?? r.action}</p>
                <p className="truncate text-xs text-parchment/55">{r.target_label ?? r.target_id} · by admin {r.admin_id?.slice(0, 8) ?? "system"}</p>
              </div>
              <span className="font-mono text-xs text-parchment/50">{new Date(r.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
      {data ? <Pager page={page} total={data.total} size={AUDIT_PAGE_SIZE} onPage={setPage} /> : null}
    </>
  );
}
