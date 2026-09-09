import { Link } from "@tanstack/react-router";
import type { Book } from "@/data/books";

export function ShelfCard({ book }: { book: Book }) {
  return (
    <Link
      to="/books/$bookId"
      params={{ bookId: book.id }}
      className="group w-40 shrink-0 rounded-xl border border-parchment/10 bg-glass/30 p-3 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
    >
      <img
        src={book.cover}
        alt={`Cover of ${book.title}`}
        width={512}
        height={768}
        loading="lazy"
        className="aspect-[2/3] w-full rounded-md object-cover outline-1 -outline-offset-1 outline-black/5"
      />
      <h3 className="mt-3 font-serif text-lg font-semibold leading-tight text-parchment">
        {book.title}
      </h3>
      <p className="font-sans text-xs text-parchment/55">{book.author}</p>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-sand/70">
        {book.category} · {book.year}
      </p>
    </Link>
  );
}

export function CatalogueCard({
  book,
  isFavorite = false,
  onToggleFavorite,
  progress,
}: {
  book: Book;
  isFavorite?: boolean;
  onToggleFavorite?: (bookId: string) => void;
  progress?: { percent: number; page: number; totalPages: number } | null;
}) {
  return (
    <article className="flex flex-col rounded-xl border border-parchment/10 bg-glass/30 p-3 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
      <div className="relative">
        <Link to="/books/$bookId" params={{ bookId: book.id }}>
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            width={512}
            height={768}
            loading="lazy"
            className="aspect-[2/3] w-full rounded-md object-cover outline-1 -outline-offset-1 outline-black/5"
          />
        </Link>
        {onToggleFavorite ? (
          <button
            type="button"
            onClick={() => onToggleFavorite(book.id)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remove ${book.title} from favourites` : `Add ${book.title} to favourites`}
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-parchment/20 bg-ink/70 text-base backdrop-blur-sm transition-colors hover:border-sand/50"
          >
            <span aria-hidden="true" className={isFavorite ? "text-oxblood" : "text-parchment/70"}>
              {isFavorite ? "♥" : "♡"}
            </span>
          </button>
        ) : null}
      </div>
      <h3 className="mt-3 font-serif text-lg font-semibold leading-tight text-parchment">
        {book.title}
      </h3>
      <p className="font-sans text-xs text-parchment/55">{book.author}</p>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-sand/70">
        {book.category} · {book.year}
      </p>
      <p className="mt-2 font-sans text-xs leading-relaxed text-parchment/60">
        {book.shortDescription}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          to="/books/$bookId"
          params={{ bookId: book.id }}
          className="rounded-full border border-parchment/20 px-4 py-2 font-sans text-xs font-medium text-parchment/80 transition-colors hover:border-parchment/40"
        >
          View Details
        </Link>
        <Link
          to="/read/$bookId"
          params={{ bookId: book.id }}
          className="rounded-full bg-oxblood px-4 py-2 font-sans text-xs font-semibold text-parchment transition-colors hover:bg-oxblood/90"
        >
          Read Book
        </Link>
      </div>
    </article>
  );
}
