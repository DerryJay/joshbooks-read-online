import { Link } from "@tanstack/react-router";
import { useRecentlyOpened } from "@/hooks/useReadingProgress";
import { getBook } from "@/data/books";
import { progressPercent } from "@/lib/reading-progress";

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-parchment/15"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full rounded-full bg-sand transition-[width] duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

/**
 * Reads recently-opened books from localStorage (no account needed) and lets the
 * visitor jump back to the page they left off on.
 */
export function ContinueReading({
  limit = 4,
  heading = "Continue reading",
  eyebrow,
}: {
  limit?: number;
  heading?: string;
  eyebrow?: string;
}) {
  const { records, ready } = useRecentlyOpened(limit);

  const items = records
    .map((record) => ({ record, book: getBook(record.bookId) }))
    .filter((item): item is { record: typeof records[number]; book: NonNullable<ReturnType<typeof getBook>> } =>
      Boolean(item.book),
    );

  if (!ready || items.length === 0) return null;

  return (
    <section className="animate-rise py-7">
      <div className="mb-4">
        {eyebrow ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-parchment">
          {heading}
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(({ record, book }) => {
          const percent = progressPercent(record.page, record.totalPages || book.pages.length);
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
                    {percent}% · page {record.page + 1} of {record.totalPages || book.pages.length}
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
    </section>
  );
}
