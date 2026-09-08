import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ShelfCard } from "@/components/BookCard";
import { ContinueReading } from "@/components/ContinueReading";
import { books, featuredBooks } from "@/data/books";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JoshBooks — Read Public-Domain Classics Online" },
      {
        name: "description",
        content:
          "JoshBooks is a small digital reading room. Browse the shelf, search instantly, and read public-domain classics in your browser.",
      },
      { property: "og:title", content: "JoshBooks — Read Public-Domain Classics Online" },
      {
        property: "og:description",
        content: "Discover, explore, and read books online in a quiet digital reading room.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = featuredBooks.slice(0, 4);


  return (
    <SiteLayout>
      <main className="mx-auto max-w-[420px] px-5 pb-16 md:max-w-5xl">
        <section className="animate-rise pb-5 pt-8">
          <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-parchment/50">
            <span className="h-1.5 w-1.5 rounded-full bg-oxblood" />
            The public reading room
          </p>
          <h1 className="text-balance font-serif text-[44px] font-semibold leading-[1.02] tracking-tight text-parchment md:text-6xl">
            Welcome to <em className="italic text-sand">JoshBooks</em>
          </h1>
          <p className="mt-4 max-w-[34ch] text-pretty font-sans text-[15px] leading-relaxed text-parchment/70">
            Discover, explore, and read books online — warm light, quiet pages, and a shelf of
            timeless public-domain works.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              to="/books"
              className="group inline-flex items-center gap-2 rounded-full bg-oxblood px-6 py-3.5 font-sans text-sm font-semibold text-parchment transition-colors duration-200 hover:bg-oxblood/90"
            >
              Explore Books
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <Link
              to="/about"
              className="rounded-full border border-parchment/20 px-5 py-3.5 font-sans text-sm font-medium text-parchment/80 transition-colors duration-200 hover:border-parchment/40"
            >
              About
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-parchment/10" />

        <ContinueReading eyebrow="(a) where you left off" heading="Continue reading" />

        <section className="animate-rise py-7 [animation-delay:80ms]">

          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">
                (b) on the shelf
              </p>

              <h2 className="font-serif text-2xl font-semibold tracking-tight text-parchment">
                Featured volumes
              </h2>
            </div>
            <Link to="/books" className="font-sans text-xs font-medium text-sand">
              View all →
            </Link>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {featured.map((book) => (
              <ShelfCard key={book.id} book={book} />
            ))}
          </div>
        </section>

        <section className="animate-rise rounded-2xl border border-parchment/10 bg-glass/25 p-6 backdrop-blur-md [animation-delay:160ms]">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">
            (b) the room
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight tracking-tight text-parchment">
            A quiet place to read
          </h2>
          <p className="mt-3 max-w-[60ch] text-pretty font-sans text-sm leading-relaxed text-parchment/70">
            No accounts, no noise — just a well-kept shelf. Search the catalogue, open a volume, and
            settle in under the reading-room light.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[`${books.length} volumes`, "Live search", "In-browser reader"].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-parchment/15 bg-parchment/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-parchment/70"
              >
                {chip}
              </span>
            ))}
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
