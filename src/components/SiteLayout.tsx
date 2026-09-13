import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Atmosphere } from "./Atmosphere";
import { useAuth, displayName } from "@/hooks/useAuth";

const publicNav = [
  { to: "/", label: "Home" },
  { to: "/books", label: "Books" },
  { to: "/about", label: "About" },
] as const;

const signedInNav = [
  { to: "/", label: "Home" },
  { to: "/books", label: "Books" },
  { to: "/library", label: "My Library" },
  { to: "/about", label: "About" },
  { to: "/profile", label: "Profile" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const items = user ? signedInNav : publicNav;

  const linkClass =
    "rounded-full px-3 py-2 transition-colors hover:text-parchment";

  return (
    <div className="relative min-h-screen bg-water-deep font-sans text-parchment">
      <Atmosphere />
      <div className="relative">
        <header className="sticky top-0 z-30 border-b border-parchment/10 bg-water-deep/70 backdrop-blur-md">
          <div className="mx-auto flex max-w-[420px] items-center justify-between gap-3 px-5 py-3.5 md:max-w-6xl">
            <Link to="/" className="flex min-w-0 items-baseline gap-2">
              <span className="truncate font-serif text-2xl font-semibold tracking-tight text-parchment">
                JoshBooks
              </span>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40 lg:inline">
                est. MMXXV
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden shrink-0 items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-parchment/60 md:flex">
              {items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className={linkClass}
                  activeProps={{ className: "text-parchment" }}
                >
                  {item.label}
                </Link>
              ))}
              {loading ? (
                <span className="ml-2 h-8 w-24 animate-pulse rounded-full bg-parchment/10" />
              ) : user ? (
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="ml-2 rounded-full border border-parchment/20 px-4 py-2 text-parchment/80 transition-colors hover:border-sand/50"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className={linkClass} activeProps={{ className: "text-parchment" }}>
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="ml-1 rounded-full bg-oxblood px-4 py-2 text-parchment transition-colors hover:bg-oxblood/90"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-parchment/20 text-parchment/80 md:hidden"
            >
              <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
            </button>
          </div>

          {menuOpen ? (
            <nav className="border-t border-parchment/10 bg-water-deep/95 px-5 py-4 md:hidden">
              <ul className="flex flex-col gap-1 font-mono text-xs uppercase tracking-[0.14em] text-parchment/70">
                {items.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      activeOptions={{ exact: item.to === "/" }}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-3 py-3 transition-colors hover:bg-parchment/5 hover:text-parchment"
                      activeProps={{ className: "text-parchment" }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-col gap-2">
                {loading ? (
                  <span className="h-11 w-full animate-pulse rounded-full bg-parchment/10" />
                ) : user ? (
                  <>
                    <p className="px-3 font-sans text-xs text-parchment/45">
                      Signed in as {displayName(user, profile)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        void signOut();
                      }}
                      className="rounded-full border border-parchment/20 px-5 py-3 font-sans text-sm font-medium text-parchment/85"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-full border border-parchment/20 px-5 py-3 text-center font-sans text-sm font-medium text-parchment/85"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-full bg-oxblood px-5 py-3 text-center font-sans text-sm font-semibold text-parchment"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          ) : null}
        </header>

        {children}

        <footer className="border-t border-parchment/10 bg-water-deep/60">
          <div className="mx-auto flex max-w-[420px] flex-col items-start gap-4 px-5 py-8 md:max-w-5xl">
            <span className="font-serif text-xl font-semibold tracking-tight text-parchment">
              JoshBooks
            </span>
            <p className="max-w-[52ch] font-sans text-xs leading-relaxed text-parchment/50">
              A demo digital library of public-domain works. Create a free account to keep your
              favourites, bookmarks and reading progress.
            </p>
            <div className="flex flex-wrap gap-5 font-mono text-[11px] uppercase tracking-[0.14em] text-parchment/40">
              {publicNav.map((item) => (
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
