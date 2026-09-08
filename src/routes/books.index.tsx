import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { CatalogueCard, ShelfCard } from "@/components/BookCard";
import { ContinueReading } from "@/components/ContinueReading";
import { books, categories, featuredBooks } from "@/data/books";


export const Route = createFileRoute("/books/")({
  head: () => ({
    meta: [
      { title: "Books — The JoshBooks Catalogue" },
      {
        name: "description",
        content:
          "Search and filter the JoshBooks catalogue of public-domain volumes by title, author, or category, then read them online.",
      },
      { property: "og:title", content: "Books — The JoshBooks Catalogue" },
      {
        property: "og:description",
        content: "Search the shelf by title, author, or category and start reading.",
      },
    ],
  }),
  component: BooksPage,
});

function BooksPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter((book) => {
      const matchesCategory = category === "All" || book.category === category;
      const matchesQuery =
        q.length === 0 ||
        [book.title, book.author, book.category, book.shortDescription]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <SiteLayout>
      <main className="mx-auto max-w-[420px] px-5 pb-16 md:max-w-5xl">
        <section className="animate-rise pb-6 pt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">
            (a) the catalogue
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight tracking-tight text-parchment md:text-5xl">
            Browse the shelf
          </h1>
          <p className="mt-3 max-w-[46ch] text-pretty font-sans text-sm leading-relaxed text-parchment/70">
            {books.length} public-domain volumes. Search filters as you type.
          </p>

          <div className="mt-6">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, author, or category…"
              aria-label="Search books"
              className="w-full rounded-full border border-parchment/15 bg-glass/30 px-5 py-3.5 font-sans text-sm text-parchment placeholder:text-parchment/40 backdrop-blur-sm outline-none focus:border-sand/50"
            />
          </div>

          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => {
              const active = item === category;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                    active
                      ? "border-oxblood bg-oxblood text-parchment"
                      : "border-parchment/15 bg-parchment/5 text-parchment/70 hover:border-parchment/35"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/40">
          {results.length} {results.length === 1 ? "volume" : "volumes"} shown
        </p>

        {results.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-parchment/10 bg-glass/25 p-6 backdrop-blur-md">
            <h2 className="font-serif text-xl font-semibold text-parchment">Nothing on this shelf</h2>
            <p className="mt-2 font-sans text-sm text-parchment/65">
              Try a different word, or clear the category filter.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((book) => (
              <CatalogueCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </main>
    </SiteLayout>
  );
}
