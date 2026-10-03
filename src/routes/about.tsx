import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useCatalogue } from "@/hooks/useCatalogue";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About JoshBooks — A Small Digital Reading Room" },
      {
        name: "description",
        content:
          "JoshBooks is a demo digital library for public-domain works: no accounts, no borrowing, no payments — just a well-kept shelf and an in-browser reader.",
      },
      { property: "og:title", content: "About JoshBooks" },
      {
        property: "og:description",
        content: "A demo digital library for public-domain works, built for quiet reading.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { books } = useCatalogue();
  return (
    <SiteLayout>
      <main className="mx-auto max-w-[420px] px-5 pb-16 md:max-w-3xl">
        <section className="animate-rise pb-6 pt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">
            (a) about
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight tracking-tight text-parchment md:text-5xl">
            About <em className="italic text-sand">JoshBooks</em>
          </h1>
          <p className="mt-4 text-pretty font-sans text-[15px] leading-relaxed text-parchment/70">
            JoshBooks is a small digital reading room built around a simple idea: a shelf worth
            browsing, and a page worth reading. The catalogue holds {books.length} public-domain
            volumes, each with a cover, a short note, and a readable excerpt you can open straight
            away.
          </p>
        </section>

        <section className="animate-rise rounded-2xl border border-parchment/10 bg-glass/25 p-6 backdrop-blur-md [animation-delay:80ms]">
          <h2 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-parchment">
            What this demo is
          </h2>
          <ul className="mt-4 space-y-3 font-sans text-sm leading-relaxed text-parchment/70">
            <li>A browsable catalogue with instant search and category filtering.</li>
            <li>A details page for every volume, with publication information.</li>
            <li>An in-browser reader with page navigation, zoom, and full screen.</li>
            <li>Public-domain works only — nothing copyrighted, nothing borrowed.</li>
          </ul>
        </section>

        <section className="animate-rise mt-6 rounded-2xl border border-parchment/10 bg-glass/25 p-6 backdrop-blur-md [animation-delay:160ms]">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">
            (b) still to come
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight tracking-tight text-parchment">
            Growing the room
          </h2>
          <p className="mt-3 text-pretty font-sans text-sm leading-relaxed text-parchment/70">
            Later versions may add reader accounts, saved bookmarks and reading history, favourites,
            and a place for librarians to add new volumes. For now the shelf is fixed and every page
            is open to everyone.
          </p>
          <Link
            to="/books"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-oxblood px-6 py-3.5 font-sans text-sm font-semibold text-parchment transition-colors hover:bg-oxblood/90"
          >
            Browse the catalogue
            <span>→</span>
          </Link>
        </section>
      </main>
    </SiteLayout>
  );
}
