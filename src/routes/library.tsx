import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { CatalogueCard } from "@/components/BookCard";
import { ProgressBar } from "@/components/ContinueReading";
import { useAuth, displayName } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useAllProgress } from "@/hooks/useReadingProgress";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useCatalogue } from "@/hooks/useCatalogue";
import { progressPercent } from "@/lib/reading-progress";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "My Library — JoshBooks" },
      {
        name: "description",
        content:
          "Your personal JoshBooks shelf: favourite volumes, saved bookmarks and everything you are part-way through reading.",
      },
      { property: "og:title", content: "My Library — JoshBooks" },
      {
        property: "og:description",
        content: "Favourites, bookmarks and books you're part-way through.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <SiteLayout>
        <main className="mx-auto max-w-[420px] px-5 pb-16 pt-10 md:max-w-5xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-52 rounded-full bg-parchment/10" />
            <div className="h-4 w-72 rounded-full bg-parchment/10" />
            <div className="h-40 w-full rounded-2xl bg-parchment/5" />
          </div>
        </main>
      </SiteLayout>
    );
  }

  if (!user) {
    return (
      <SiteLayout>
        <main className="mx-auto max-w-[420px] px-5 pb-16 pt-10 md:max-w-2xl">
          <section className="animate-rise rounded-2xl border border-parchment/10 bg-glass/25 p-6 backdrop-blur-md">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">
              (a) private shelf
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight tracking-tight text-parchment">
              Sign in to access your personal library.
            </h1>
            <p className="mt-3 max-w-[52ch] font-sans text-sm leading-relaxed text-parchment/65">
              Your favourites, bookmarks and reading progress are kept privately in your own
              account.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="rounded-full bg-oxblood px-6 py-3.5 font-sans text-sm font-semibold text-parchment transition-colors hover:bg-oxblood/90"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full border border-parchment/25 px-6 py-3.5 font-sans text-sm font-medium text-parchment/85 transition-colors hover:border-sand/50"
              >
                Create Account
              </Link>
            </div>
          </section>
        </main>
      </SiteLayout>
    );
  }

  return <LibraryContent name={displayName(user, profile)} />;
}

function LibraryContent({ name }: { name: string }) {
  const { ids: favorites, toggle } = useFavorites();
  const { records } = useAllProgress();
  const { bookmarks, remove: removeBookmark } = useBookmarks();
  const { getBook, books } = useCatalogue();

  const favoriteBooks = favorites
    .map((id) => getBook(id))
    .filter((book): book is NonNullable<ReturnType<typeof getBook>> => Boolean(book));

  const reading = Object.values(records)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((record) => ({ record, book: getBook(record.bookId) }))
    .filter((item) => Boolean(item.book));

  const bookmarkGroups = Object.values(
    bookmarks.reduce<Record<string, { bookId: string; marks: typeof bookmarks }>>((acc, mark) => {
      const entry = acc[mark.bookId] ?? { bookId: mark.bookId, marks: [] };
      entry.marks.push(mark);
      acc[mark.bookId] = entry;
      return acc;
    }, {}),
  );

  return (
    <SiteLayout>
      <main className="mx-auto max-w-[420px] px-5 pb-16 md:max-w-6xl">
        <section className="animate-rise pb-6 pt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">
            (a) your shelf
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight tracking-tight text-parchment md:text-5xl">
            My Library
          </h1>
          <p className="mt-3 max-w-[52ch] font-sans text-sm leading-relaxed text-parchment/70">
            Welcome back, {name}. Everything here is private to your account.
          </p>
        </section>

        <section className="pb-8">
          <h2 className="mb-4 font-serif text-2xl font-semibold tracking-tight text-parchment">
            Currently reading
          </h2>
          {reading.length === 0 ? (
            <EmptyState
              text="Nothing on the go yet."
              action="Browse the catalogue"
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {reading.map(({ record, book }) => {
                if (!book) return null;
                const percent = progressPercent(record.page, record.totalPages || book.pageCount);
                return (
                  <article
                    key={book.id}
                    className="flex gap-4 rounded-2xl border border-parchment/10 bg-glass/30 p-3 backdrop-blur-sm"
                  >
                    <Link to="/books/$bookId" params={{ bookId: book.id }} className="shrink-0">
                      <img
                        src={book.cover}
                        alt={`Cover of ${book.title}`}
                        width={512}
                        height={768}
                        loading="lazy"
                        className="aspect-[2/3] w-16 rounded-md object-cover"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <h3 className="truncate font-serif text-lg font-semibold leading-tight text-parchment">
                        {book.title}
                      </h3>
                      <p className="truncate font-sans text-xs text-parchment/55">{book.author}</p>
                      <div className="mt-2">
                        <ProgressBar percent={percent} />
                        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-sand/80">
                          {percent}% · page {record.page + 1} of{" "}
                          {record.totalPages || book.pageCount}
                        </p>
                      </div>
                      <Link
                        to="/read/$bookId"
                        params={{ bookId: book.id }}
                        className="mt-3 self-start rounded-full bg-oxblood px-4 py-2 font-sans text-xs font-semibold text-parchment transition-colors hover:bg-oxblood/90"
                      >
                        Continue Reading
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="pb-8">
          <h2 className="mb-4 font-serif text-2xl font-semibold tracking-tight text-parchment">
            Favourites
          </h2>
          {favoriteBooks.length === 0 ? (
            <EmptyState text="No favourites yet — tap the heart on any book." action="Find a book" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {favoriteBooks.map((book) => {
                const record = records[book.id];
                return (
                  <CatalogueCard
                    key={book.id}
                    book={book}
                    isFavorite
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
        </section>

        <section className="pb-8">
          <h2 className="mb-4 font-serif text-2xl font-semibold tracking-tight text-parchment">
            Bookmarks
          </h2>
          {bookmarkGroups.length === 0 ? (
            <EmptyState
              text="No saved pages yet — use the bookmark button while reading."
              action="Open a book"
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {bookmarkGroups.map((group) => {
                const book = getBook(group.bookId);
                if (!book) return null;
                return (
                  <li
                    key={group.bookId}
                    className="rounded-2xl border border-parchment/10 bg-glass/30 p-4 backdrop-blur-sm"
                  >
                    <h3 className="font-serif text-lg font-semibold leading-tight text-parchment">
                      {book.title}
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {group.marks
                        .sort((a, b) => a.page - b.page)
                        .map((mark) => (
                          <li
                            key={mark.id}
                            className="flex items-center justify-between gap-2 border-t border-parchment/10 pt-2"
                          >
                            <div className="min-w-0">
                              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-sand/80">
                                Page {mark.page + 1} · {new Date(mark.createdAt).toLocaleDateString()}
                              </p>
                              {mark.note ? (
                                <p className="truncate font-sans text-xs text-parchment/60">{mark.note}</p>
                              ) : null}
                            </div>
                            <div className="flex shrink-0 gap-2">
                              <Link
                                to="/read/$bookId"
                                params={{ bookId: book.id }}
                                search={{ page: mark.page + 1 }}
                                className="rounded-full border border-parchment/20 px-3 py-1.5 font-sans text-xs text-parchment/80 transition-colors hover:border-sand/50"
                              >
                                Open
                              </Link>
                              <button
                                type="button"
                                onClick={() => void removeBookmark(mark.page, mark.bookId)}
                                aria-label={`Delete bookmark on page ${mark.page + 1}`}
                                className="rounded-full border border-parchment/20 px-3 py-1.5 font-sans text-xs text-parchment/60 transition-colors hover:border-alert/50 hover:text-alert"
                              >
                                Delete
                              </button>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/35">
          {books.length} volumes in the catalogue
        </p>
      </main>
    </SiteLayout>
  );
}

function EmptyState({ text, action }: { text: string; action: string }) {
  return (
    <div className="rounded-2xl border border-parchment/10 bg-glass/25 p-5 backdrop-blur-md">
      <p className="font-sans text-sm text-parchment/65">{text}</p>
      <Link
        to="/books"
        className="mt-3 inline-flex rounded-full border border-sand/40 px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-sand transition-colors hover:bg-sand/10"
      >
        {action}
      </Link>
    </div>
  );
}
