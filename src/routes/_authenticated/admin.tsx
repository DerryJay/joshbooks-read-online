import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { checkIsAdmin } from "@/lib/admin";
import { Atmosphere } from "@/components/Atmosphere";

export const Route = createFileRoute("/_authenticated/admin")({
  // UX gate only — every admin read/write is also enforced by database security rules.
  beforeLoad: async () => {
    if (!(await checkIsAdmin())) throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Admin — JoshBooks" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/books", label: "Books", exact: true },
  { to: "/admin/books/new", label: "Add Book", exact: true },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/activity", label: "Reading Activity" },
  { to: "/admin/audit", label: "Audit Log" },
  { to: "/admin/settings", label: "Settings" },
] as const;

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function logout() {
    await qc.cancelQueries();
    qc.clear();
    const { signOut } = await import("firebase/auth");
    const { auth } = await import("@/integrations/firebase/client");
    await signOut(auth);
    navigate({ to: "/login", replace: true });
  }

  const links = (
    <nav className="flex flex-col gap-1 font-sans text-sm">
      {nav.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          activeOptions={{ exact: "exact" in n ? n.exact : false }}
          onClick={() => setOpen(false)}
          className="rounded-xl px-3 py-2.5 text-parchment/70 transition-colors hover:bg-parchment/5 hover:text-parchment"
          activeProps={{ className: "bg-parchment/10 text-parchment" }}
        >
          {n.label}
        </Link>
      ))}
      <div className="my-2 border-t border-parchment/10" />
      <Link to="/" className="rounded-xl px-3 py-2.5 text-parchment/70 hover:bg-parchment/5 hover:text-parchment">
        ← Back to JoshBooks
      </Link>
      <button onClick={() => void logout()} className="rounded-xl px-3 py-2.5 text-left text-parchment/70 hover:bg-parchment/5 hover:text-parchment">
        Logout
      </button>
    </nav>
  );

  return (
    <div className="relative min-h-screen bg-water-deep font-sans text-parchment">
      <Atmosphere />
      <div className="relative lg:flex">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-parchment/10 bg-water-deep/80 p-5 backdrop-blur-md lg:block">
          <p className="font-serif text-2xl font-semibold">JoshBooks</p>
          <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-sand/70">Library admin</p>
          {links}
        </aside>
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-parchment/10 bg-water-deep/90 px-5 py-3 backdrop-blur-md lg:hidden">
          <span className="font-serif text-xl font-semibold">JoshBooks <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sand/70">admin</span></span>
          <button
            aria-label="Toggle admin menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex size-10 items-center justify-center rounded-full border border-parchment/20"
          >
            {open ? "✕" : "☰"}
          </button>
        </header>
        {open ? <div className="border-b border-parchment/10 bg-water-deep/95 p-4 lg:hidden">{links}</div> : null}
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-10">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
