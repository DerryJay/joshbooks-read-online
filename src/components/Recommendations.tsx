import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useCatalogue } from "@/hooks/useCatalogue";
import { useFavorites } from "@/hooks/useFavorites";
import type { Book } from "@/lib/catalogue";
import { bookStatsQuery, logImpressions, signalsQuery, trackEvent } from "@/lib/recommendation-data";
import {
  basedOnFavorites,
  buildProfile,
  EMPTY_SIGNALS,
  isPersonalizable,
  popularBooks,
  recommendForYou,
  similarBooks,
  topCategory,
  type BookStats,
  type Recommendation,
} from "@/lib/recommendations";

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="text-sand" aria-hidden="true">
      {"★".repeat(full)}
      <span className="text-parchment/25">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export function RecommendationCard({
  rec,
  stats,
  status,
  isFavorite,
  onToggleFavorite,
  tracked,
}: {
  rec: Recommendation;
  stats?: BookStats | undefined;
  status?: string | null;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  tracked: boolean;
}) {
  const { book, reason } = rec;
  const click = () => {
    if (tracked) void trackEvent(book.id, "recommendation_clicked");
  };
  return (
    <article className="flex w-56 shrink-0 snap-start flex-col rounded-xl border border-parchment/10 bg-glass/30 p-3 backdrop-blur-sm md:w-auto">
      <div className="relative">
        <Link to="/books/$bookId" params={{ bookId: book.id }} onClick={click}>
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            width={512}
            height={768}
            loading="lazy"
            className="aspect-[2/3] w-full rounded-md object-cover"
          />
        </Link>
        <button
          type="button"
          onClick={() => onToggleFavorite(book.id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Remove ${book.title} from favourites` : `Add ${book.title} to favourites`}
          className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full border border-parchment/20 bg-ink/70 backdrop-blur-sm"
        >
          <span aria-hidden="true" className={isFavorite ? "text-oxblood" : "text-parchment/70"}>
            {isFavorite ? "♥" : "♡"}
          </span>
        </button>
        {status ? (
          <span className="absolute bottom-2 left-2 rounded-full bg-ink/80 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-sand">
            {status}
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 font-serif text-lg font-semibold leading-tight text-parchment">{book.title}</h3>
      <p className="font-sans text-xs text-parchment/55">{book.author}</p>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-sand/70">{book.category}</p>
      {stats?.ratingAvg && stats.ratingCount > 0 ? (
        <p className="mt-1 font-sans text-xs text-parchment/60">
          <Stars value={stats.ratingAvg} /> {stats.ratingAvg.toFixed(1)} ({stats.ratingCount})
        </p>
      ) : (
        <p className="mt-1 font-sans text-[11px] text-parchment/35">Not rated yet</p>
      )}
      <p className="mt-2 line-clamp-3 font-sans text-xs leading-relaxed text-parchment/60">{book.shortDescription}</p>
      <p className="mt-2 font-sans text-[11px] italic text-sand/80">{reason}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-3">
        <Link
          to="/books/$bookId"
          params={{ bookId: book.id }}
          onClick={click}
          className="rounded-full border border-parchment/20 px-4 py-2.5 font-sans text-xs font-medium text-parchment/80 hover:border-parchment/40"
        >
          View Details
        </Link>
        <Link
          to="/read/$bookId"
          params={{ bookId: book.id }}
          onClick={click}
          className="rounded-full bg-oxblood px-4 py-2.5 font-sans text-xs font-semibold text-parchment hover:bg-oxblood/90"
        >
          Read Book
        </Link>
      </div>
    </article>
  );
}

function Row({
  eyebrow,
  title,
  recs,
  action,
  tracked = false,
}: {
  eyebrow: string;
  title: string;
  recs: Recommendation[];
  action?: React.ReactNode;
  tracked?: boolean;
}) {
  const { data: stats } = useQuery(bookStatsQuery());
  const { user } = useAuth();
  const { data: signals } = useQuery({ ...signalsQuery(user?.uid), enabled: Boolean(user) });
  const { isFavorite, toggle } = useFavorites();
  const statusOf = (id: string) => {
    const p = signals?.progress.find((x) => x.bookId === id);
    if (!p) return null;
    return p.completed ? "Completed" : `Reading · ${p.percent}%`;
  };
  const ids = recs.map((r) => r.book.id).join(",");
  useEffect(() => {
    if (tracked && user && ids) void logImpressions(ids.split(","));
  }, [tracked, user, ids]);
  return (
    <section className="animate-rise py-7">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">{eyebrow}</p>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-parchment">{title}</h2>
        </div>
        {action}
      </div>
      <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
        {recs.map((r) => (
          <RecommendationCard
            key={r.book.id}
            rec={r}
            stats={stats?.get(r.book.id)}
            status={statusOf(r.book.id)}
            isFavorite={isFavorite(r.book.id)}
            onToggleFavorite={toggle}
            tracked={tracked}
          />
        ))}
      </div>
    </section>
  );
}

/** Homepage recommendation sections — personalised when there's enough activity. */
export function HomeRecommendations() {
  const { user, loading } = useAuth();
  const { books } = useCatalogue();
  const { data: stats = new Map<string, BookStats>() } = useQuery(bookStatsQuery());
  const { data: signals = EMPTY_SIGNALS } = useQuery({ ...signalsQuery(user?.uid), enabled: Boolean(user) });
  const [seed, setSeed] = useState(0);

  const sections = useMemo(() => {
    if (!books.length) return null;
    const profile = buildProfile(books, signals);
    const personal = Boolean(user) && isPersonalizable(profile);
    if (!personal) return { personal: false as const, popular: popularBooks(books, stats, { limit: 8, seed }) };
    const used = new Set<string>();
    const mark = (recs: Recommendation[]) => (recs.forEach((r) => used.add(r.book.id)), recs);
    const forYou = mark(recommendForYou(books, signals, stats, { limit: 8, seed }));
    const last = [...signals.progress].sort((a, b) => b.lastReadAt - a.lastReadAt)[0];
    const lastBook = last ? books.find((b) => b.id === last.bookId) : undefined;
    const because = lastBook ? mark(similarBooks(lastBook, books, stats, { limit: 4, exclude: used })) : [];
    const favs = mark(basedOnFavorites(books, signals, stats, { limit: 4, exclude: used }));
    const cat = topCategory(books, signals);
    const inCat = cat
      ? mark(
          books
            .filter((b) => b.category === cat && !used.has(b.id) && !profile.completedIds.has(b.id))
            .map((b) => ({ book: b, score: 1, reason: `More in ${cat}` }))
            .slice(0, 4),
        )
      : [];
    const popular = popularBooks(books, stats, { limit: 4, exclude: used });
    return { personal: true as const, forYou, because, lastBook, favs, cat, inCat, popular };
  }, [books, stats, signals, user, seed]);

  if (loading || !sections) return null;

  const refresh = (
    <button
      type="button"
      onClick={() => setSeed((s) => s + 1)}
      className="min-h-10 shrink-0 rounded-full border border-parchment/15 px-3 font-sans text-xs text-parchment/60 hover:border-parchment/35 hover:text-parchment"
    >
      ↻ Refresh recommendations
    </button>
  );

  if (!sections.personal) {
    return (
      <>
        {user ? (
          <div className="mt-7 rounded-2xl border border-parchment/10 bg-glass/25 p-5 backdrop-blur-md">
            <h2 className="font-serif text-xl font-semibold text-parchment">We're still learning what you like.</h2>
            <p className="mt-1 font-sans text-sm text-parchment/65">
              Read, favourite, bookmark or rate a couple of books and your recommendations will appear here.
            </p>
            <Link to="/books" className="mt-3 inline-block font-sans text-xs font-semibold text-sand">
              Explore Popular Books →
            </Link>
          </div>
        ) : null}
        <Row eyebrow="(r) loved by readers" title="Popular on JoshBooks" recs={sections.popular} action={refresh} />
      </>
    );
  }

  return (
    <>
      <Row eyebrow="(r) picked for you" title="Recommended For You" recs={sections.forYou} action={refresh} tracked />
      {sections.because.length >= 2 && sections.lastBook ? (
        <Row eyebrow="(r) keep the thread" title={`Because you read "${sections.lastBook.title}"`} recs={sections.because} tracked />
      ) : null}
      {sections.favs.length >= 2 ? (
        <Row eyebrow="(r) your favourites" title="Based on Your Favorites" recs={sections.favs} tracked />
      ) : null}
      {sections.inCat.length >= 2 && sections.cat ? (
        <Row eyebrow="(r) your shelves" title={`More in ${sections.cat}`} recs={sections.inCat} tracked />
      ) : null}
      {sections.popular.length >= 2 ? (
        <Row eyebrow="(r) loved by readers" title="Popular on JoshBooks" recs={sections.popular} />
      ) : null}
    </>
  );
}

export function YouMayAlsoLike({ book }: { book: Book }) {
  const { books } = useCatalogue();
  const { data: stats = new Map<string, BookStats>() } = useQuery(bookStatsQuery());
  const recs = useMemo(() => similarBooks(book, books, stats, { limit: 8 }), [book, books, stats]);
  if (recs.length === 0) return null;
  return <Row eyebrow="(c) related volumes" title="You May Also Like" recs={recs} tracked />;
}
