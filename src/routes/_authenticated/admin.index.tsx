import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { dashboardQuery } from "@/lib/admin";
import { BarList, DayChart, ErrorNote, PageHeader, Panel, StatCard } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data, error, refetch } = useQuery(dashboardQuery());
  const t = data?.totals;
  return (
    <>
      <PageHeader eyebrow="Overview" title="Dashboard" />
      {error ? <ErrorNote message={error.message} onRetry={() => void refetch()} /> : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Total books" value={t?.books} />
        <StatCard label="Total users" value={t?.users} />
        <StatCard label="Categories" value={t?.categories} />
        <StatCard label="Favorites" value={t?.favorites} />
        <StatCard label="Reading activity" value={t?.reading} />
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Panel title="Books by category">
          <BarList items={(data?.by_category ?? []).map((c) => ({ label: c.name, value: Number(c.count) }))} />
        </Panel>
        <Panel title="Popular books">
          <BarList items={(data?.popular ?? []).map((c) => ({ label: c.title, value: Number(c.count) }))} empty="No one has started reading yet." />
        </Panel>
        <Panel title="Most favorited">
          <BarList items={(data?.favorited ?? []).map((c) => ({ label: c.title, value: Number(c.count) }))} empty="No favorites yet." />
        </Panel>
        <Panel title="New users · last 30 days">
          {data ? <DayChart days={data.new_users} /> : <div className="h-32 animate-pulse rounded bg-parchment/5" />}
        </Panel>
        <Panel title="Reading activity · last 14 days" className="md:col-span-2">
          {data ? <DayChart days={data.reading_by_day} /> : <div className="h-32 animate-pulse rounded bg-parchment/5" />}
        </Panel>
      </div>
    </>
  );
}
