import type { ReactNode } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const field =
  "w-full rounded-xl border border-parchment/15 bg-water-deep/60 px-3.5 py-2.5 font-sans text-sm text-parchment placeholder:text-parchment/35 outline-none focus:border-sand/60";
export const label = "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-parchment/55";
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-oxblood px-5 py-2.5 font-sans text-sm font-semibold text-parchment transition-colors hover:bg-oxblood/90 disabled:opacity-50";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-parchment/20 px-4 py-2 font-sans text-sm text-parchment/85 transition-colors hover:border-sand/50 disabled:opacity-50";

export function PageHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">{eyebrow}</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-parchment md:text-4xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-parchment/10 bg-glass/25 p-5 backdrop-blur-md ${className}`}>
      {title ? <h2 className="mb-4 font-serif text-xl font-semibold text-parchment">{title}</h2> : null}
      {children}
    </section>
  );
}

export function StatCard({ label: l, value }: { label: string; value: number | string | undefined }) {
  return (
    <div className="rounded-2xl border border-parchment/10 bg-glass/25 p-4 backdrop-blur-md">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-parchment/50">{l}</p>
      {value === undefined ? (
        <div className="mt-2 h-8 w-16 animate-pulse rounded bg-parchment/10" />
      ) : (
        <p className="mt-1 font-serif text-3xl font-semibold text-parchment">{value}</p>
      )}
    </div>
  );
}

export function BarList({ items, empty = "No data yet." }: { items: { label: string; value: number }[]; empty?: string }) {
  if (items.length === 0) return <p className="font-sans text-sm text-parchment/50">{empty}</p>;
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-2.5">
      {items.map((i) => (
        <li key={i.label}>
          <div className="mb-1 flex justify-between gap-3 font-sans text-xs text-parchment/75">
            <span className="truncate">{i.label}</span>
            <span className="font-mono">{i.value}</span>
          </div>
          <div className="h-2 rounded-full bg-parchment/10">
            <div className="h-2 rounded-full bg-sand/70" style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DayChart({ days }: { days: { day: string; count: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div>
      <div className="flex h-32 items-end gap-1">
        {days.map((d) => (
          <div key={d.day} className="group relative flex-1" title={`${d.day}: ${d.count}`}>
            <div className="w-full rounded-t bg-oxblood/80" style={{ height: `${Math.max(3, (d.count / max) * 128)}px` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-parchment/40">
        <span>{days[0]?.day}</span>
        <span>{days[days.length - 1]?.day}</span>
      </div>
    </div>
  );
}

export function Pager({ page, total, size, onPage }: { page: number; total: number; size: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="mt-4 flex items-center justify-between gap-3 font-sans text-xs text-parchment/60">
      <span>{total} total · page {page} of {pages}</span>
      <div className="flex gap-2">
        <button className={btnGhost} disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
        <button className={btnGhost} disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-oxblood/40 bg-oxblood/10 p-4 font-sans text-sm text-parchment/85">
      {message}
      {onRetry ? <button className="ml-3 underline" onClick={onRetry}>Try again</button> : null}
    </div>
  );
}

export function Skeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-xl bg-parchment/5" />
      ))}
    </div>
  );
}

export function Confirm({
  open, onOpenChange, title, description, confirmLabel = "Confirm", onConfirm,
}: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description: ReactNode;
  confirmLabel?: string; onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
