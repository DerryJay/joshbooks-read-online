import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { dashboardQuery } from "@/lib/admin";
import { BarList, DayChart, ErrorNote, PageHeader, Panel, StatCard, formatDate } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/activity")({
  component: Activity,
});

function Activity() {
  const { data, error, refetch } = useQuery(dashboardQuery());
  const t = data?.totals;
  return (
    <>
      <PageHeader eyebrow="Aggregated, no personal reading data" title="Reading Activity" />
      {error ? <ErrorNote message={error.message} onRetry={() => void refetch()} /> : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Reading sessions" value={t?.reading} />
        <StatCard label="Books completed" value={t?.completed} />
        <StatCard label="Bookmarks" value={t?.bookmarks} />
        <StatCard label="Favorites" value={t?.favorites} />
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Panel title="Most-read books">
          <BarList items={(data?.popular ?? []).map((b) => ({ label: b.title, value: Number(b.count) }))} />
        </Panel>
        <Panel title="Most-favorited books">
          <BarList items={(data?.favorited ?? []).map((b) => ({ label: b.title, value: Number(b.count) }))} />
        </Panel>
        <Panel title="Recently active books">
          {(data?.recently_active ?? []).length === 0 ? (
            <p className="text-sm text-parchment/50">No reading activity yet.</p>
          ) : (
            <ul className="divide-y divide-parchment/10 text-sm">
              {data!.recently_active.map((b) => (
                <li key={b.id} className="flex justify-between gap-3 py-2">
                  <span className="truncate">{b.title}</span>
                  <span className="shrink-0 font-mono text-xs text-parchment/50">{formatDate(b.last_read_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Reading activity by date">
          {data ? <DayChart days={data.reading_by_day} /> : <div className="h-32 animate-pulse rounded bg-parchment/5" />}
        </Panel>
      </div>
    </>
  );
}
