import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { CatalogueCard, ShelfCard } from "@/components/BookCard";
import { ContinueReading } from "@/components/ContinueReading";
import { BookFilters } from "@/components/BookFilters";
import { useCatalogue } from "@/hooks/useCatalogue";
import { useAllProgress } from "@/hooks/useReadingProgress";
import { useFavorites } from "@/hooks/useFavorites";
import { progressPercent } from "@/lib/reading-progress";
import {
  buildSuggestions,
  defaultFilters,
  filterAndSortBooks,
  isFiltered,
  type Filters,
} from "@/lib/catalogue-filters";

export const Route = createFileRoute("/books/")({
  head: () => ({
    meta: [
      { title: "Books — The JoshBooks Catalogue" },
      {
        name: "description",
        content:
          "Search and filter the JoshBooks catalogue of public-domain volumes by title, author, category, year or reading status, then read them online.",
      },
      { property: "og:title", content: "Books — The JoshBooks Catalogue" },
      {
        property: "og:description",
        content: "Search, filter and sort the shelf, then start reading.",
      },
    ],
  }),
  component: BooksPage,
});

const PAGE_SIZE = 12;

function BooksPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { records } = useAllProgress();
  const { ids: favorites, toggle } = useFavorites();
  const { books, featuredBooks, loading: catalogueLoading, error: catalogueError, retry } = useCatalogue();
  const [visible, setVisible] = useState(PAGE_SIZE);

  const patch = (next: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setVisible(PAGE_SIZE);
  };
  const clear = () => {
    setFilters(defaultFilters);
    setShowSuggestions(false);
  };

  const results = useMemo(
    () => filterAndSortBooks(books, filters, records, favorites),
    [books, filters, records, favorites],
  );
  const suggestions = useMemo(() => buildSuggestions(books, filters.query), [books, filters.query]);
  const filtered = isFiltered(filters);

  return (
    <SiteLayout>
      <main className="mx-auto max-w-[420px] px-5 pb-16 md:max-w-6xl">
        <section className="animate-rise pb-6 pt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">
            (a) the catalogue
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight tracking-tight text-parchment md:text-5xl">
            Browse the shelf
          </h1>
          <p className="mt-3 max-w-[46ch] text-pretty font-sans text-sm leading-relaxed text-parchment/70">
            Search by title, author, category or keyword — then narrow the shelf with filters.
          </p>

          <div className="relative mt-6">
            <input
              type="search"
              value={filters.query}
              onChange={(event) => {
                patch({ query: event.target.value });
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
              placeholder="Search by title, author, category or keyword…"
              aria-label="Search books"
              className="w-full rounded-full border border-parchment/15 bg-glass/30 px-5 py-3.5 font-sans text-sm text-parchment placeholder:text-parchment/40 backdrop-blur-sm outline-none focus:border-sand/50"
            />

            {showSuggestions && suggestions.length > 0 ? (
              <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-parchment/15 bg-ink/95 backdrop-blur-md">
                {suggestions.map((suggestion) => (
                  <li key={`${suggestion.kind}-${suggestion.label}`}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setShowSuggestions(false);
                        if (suggestion.kind === "book" && suggestion.bookId) {
                          navigate({
                            to: "/books/$bookId",
                            params: { bookId: suggestion.bookId },
                          });
                        } else if (suggestion.kind === "author") {
                          patch({ query: "", author: suggestion.label });
                        } else {
                          patch({ query: "", category: suggestion.label });
                        }
                      }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left font-sans text-sm text-parchment/85 transition-colors hover:bg-parchment/10"
                    >
                      <span>{suggestion.label}</span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-sand/60">
                        {suggestion.kind}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/45">
              {results.length} {results.length === 1 ? "book" : "books"} found
            </p>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rounded-full border border-parchment/20 px-4 py-2 font-sans text-xs font-medium text-parchment/85 transition-colors hover:border-sand/50 md:hidden"
            >
              Filter &amp; Sort
            </button>
          </div>
        </section>

        <div className="md:flex md:gap-8">
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="sticky top-6 rounded-2xl border border-parchment/10 bg-glass/25 p-4 backdrop-blur-md">
              <h2 className="mb-4 font-serif text-lg font-semibold text-parchment">
                Filter &amp; sort
              </h2>
              <BookFilters
                filters={filters}
                onChange={patch}
                onClear={clear}
                showClear={filtered}
              />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {!filtered ? (
              <>
                <section className="animate-rise pb-2">
                  <div className="mb-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">
                      (b) picked for you
                    </p>
                    <h2 className="font-serif text-2xl font-semibold tracking-tight text-parchment">
                      Featured books
                    </h2>
                  </div>
                  <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
                    {featuredBooks.map((book) => (
                      <ShelfCard key={book.id} book={book} />
                    ))}
                  </div>
                </section>

                <ContinueReading eyebrow="(c) recently opened" heading="Recently opened" />
              </>
            ) : null}

            <div className="mt-2 flex items-end justify-between gap-3">
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-parchment">
                All books
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/40">
                {results.length} {results.length === 1 ? "book" : "books"} found
              </p>
            </div>

            {results.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-parchment/10 bg-glass/25 p-6 backdrop-blur-md">
                <h3 className="font-serif text-xl font-semibold text-parchment">No books found.</h3>
                <p className="mt-2 font-sans text-sm text-parchment/65">
                  Try changing your search or filters.
                </p>
                <button
                  type="button"
                  onClick={clear}
                  className="mt-4 rounded-full border border-sand/40 px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-sand transition-colors hover:bg-sand/10"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((book) => {
                  const record = records[book.id];
                  return (
                    <CatalogueCard
                      key={book.id}
                      book={book}
                      isFavorite={favorites.includes(book.id)}
                      onToggleFavorite={toggle}
                      progress={
                        record
                          ? {
                              percent: progressPercent(record.page, record.totalPages),
                              page: record.page,
                              totalPages: record.totalPages,
                            }
                          : null
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="Filter and sort">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setDrawerOpen(false)}
            className="flex-1 bg-ink/70 backdrop-blur-sm"
          />
          <div className="w-[86%] max-w-sm overflow-y-auto border-l border-parchment/15 bg-ink px-5 py-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-parchment">Filter &amp; sort</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-full border border-parchment/20 px-3 py-1.5 font-sans text-xs text-parchment/80"
              >
                Done
              </button>
            </div>
            <BookFilters filters={filters} onChange={patch} onClear={clear} showClear={filtered} />
          </div>
        </div>
      ) : null}
    </SiteLayout>
  );
}
