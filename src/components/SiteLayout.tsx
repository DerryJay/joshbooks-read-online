import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Atmosphere } from "./Atmosphere";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/books", label: "Books" },
  { to: "/about", label: "About" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-water-deep font-sans text-parchment">
      <Atmosphere />
      <div className="relative">
        <header className="sticky top-0 z-20 border-b border-parchment/10 bg-water-deep/70 backdrop-blur-md">
          <div className="mx-auto grid max-w-[420px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 md:max-w-5xl">
            <Link to="/" className="flex min-w-0 items-baseline gap-2">
              <span className="truncate font-serif text-2xl font-semibold tracking-tight text-parchment">
                JoshBooks
              </span>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40 sm:inline">
                est. MMXXV
              </span>
            </Link>
            <nav className="flex shrink-0 items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-parchment/60">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="rounded-full px-3 py-2 transition-colors hover:text-parchment"
                  activeProps={{ className: "text-parchment" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {children}

        <footer className="border-t border-parchment/10 bg-water-deep/60">
          <div className="mx-auto flex max-w-[420px] flex-col items-start gap-4 px-5 py-8 md:max-w-5xl">
            <span className="font-serif text-xl font-semibold tracking-tight text-parchment">
              JoshBooks
            </span>
            <p className="max-w-[52ch] font-sans text-xs leading-relaxed text-parchment/50">
              A demo digital library. Public-domain works only — no accounts, borrowing, or
              payments.
            </p>
            <div className="flex gap-5 font-mono text-[11px] uppercase tracking-[0.14em] text-parchment/40">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} className="hover:text-parchment/70">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
