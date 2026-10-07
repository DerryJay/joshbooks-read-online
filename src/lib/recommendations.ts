/**
 * Metadata + activity recommendation engine (pure functions, no I/O).
 * Inputs are the public catalogue, aggregated public stats and the signed-in
 * reader's own signals. Swap `scorePersonalized` for an ML model later without
 * touching the UI — every section consumes `Recommendation[]`.
 */
import type { Book } from "@/lib/catalogue";

export type BookStats = {
  readers: number;
  completed: number;
  favorites: number;
  views: number;
  ratingAvg: number | null;
  ratingCount: number;
};

export type UserSignals = {
  progress: { bookId: string; completed: boolean; lastReadAt: number; percent: number }[];
  favorites: string[];
  bookmarks: string[];
  ratings: { bookId: string; rating: number }[];
  views: { bookId: string; at: number }[];
};

export type Recommendation = { book: Book; score: number; reason: string };

export const EMPTY_SIGNALS: UserSignals = { progress: [], favorites: [], bookmarks: [], ratings: [], views: [] };

const DAY = 86_400_000;
const STOP = new Set(
  "the and for with that this from into over under about their there they them were what when which while your have has had been being also than then such very more most some only other into upon after before between through where these those while shall would could should story novel book books classic tale tales public domain edition".split(
    " ",
  ),
);

const tokenCache = new WeakMap<Book, Set<string>>();
export function keywords(book: Book): Set<string> {
  const hit = tokenCache.get(book);
  if (hit) return hit;
  const words = `${book.title} ${book.shortDescription} ${book.description}`
    .toLowerCase()
    .match(/[a-z]{4,}/g) ?? [];
  const set = new Set(words.filter((w) => !STOP.has(w)));
  tokenCache.set(book, set);
  return set;
}

/** 0..1 similarity from category, author and description keywords. */
export function similarity(a: Book, b: Book): number {
  if (a.id === b.id) return 0;
  const ka = keywords(a);
  const kb = keywords(b);
  let shared = 0;
  for (const w of ka) if (kb.has(w)) shared++;
  const union = ka.size + kb.size - shared;
  const text = union ? shared / union : 0;
  const cat = a.category === b.category ? 0.45 : 0;
  const author = a.author === b.author ? 0.35 : 0;
  return Math.min(1, cat + author + Math.min(0.4, text * 2));
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10_000) / 10_000;
}

/** Small deterministic nudge so "Refresh" surfaces other valid candidates. */
function jitter(score: number, id: string, seed: number) {
  return seed === 0 ? score : score * (1 + (hash(`${seed}:${id}`) - 0.5) * 0.35);
}

function popularity(s: BookStats | undefined) {
  if (!s) return 0;
  const rating = s.ratingAvg && s.ratingCount ? (s.ratingAvg - 2.5) * Math.min(s.ratingCount, 10) : 0;
  return s.readers * 3 + s.favorites * 3 + s.completed * 2 + s.views + rating;
}

/** Greedy pick with category/author repetition penalties for diversity. */
function diversify(items: Recommendation[], limit: number): Recommendation[] {
  const pool = [...items].sort((a, b) => b.score - a.score);
  const out: Recommendation[] = [];
  const catCount = new Map<string, number>();
  const authCount = new Map<string, number>();
  while (out.length < limit && pool.length) {
    let bestIdx = 0;
    let best = -Infinity;
    pool.forEach((r, i) => {
      const adj =
        r.score *
        0.72 ** (catCount.get(r.book.category) ?? 0) *
        0.6 ** (authCount.get(r.book.author) ?? 0);
      if (adj > best) {
        best = adj;
        bestIdx = i;
      }
    });
    const [pick] = pool.splice(bestIdx, 1);
    if (!pick) break;
    out.push(pick);
    catCount.set(pick.book.category, (catCount.get(pick.book.category) ?? 0) + 1);
    authCount.set(pick.book.author, (authCount.get(pick.book.author) ?? 0) + 1);
  }
  return out;
}

export type ReadingProfile = {
  categoryWeights: Map<string, number>;
  authorWeights: Map<string, number>;
  interactions: number;
  completedIds: Set<string>;
  readingIds: Set<string>;
  lowRated: Set<string>;
  anchors: Book[];
  recent: Book[];
  bookmarkCategories: Set<string>;
};

export function buildProfile(books: Book[], signals: UserSignals, now = Date.now()): ReadingProfile {
  const byId = new Map(books.map((b) => [b.id, b]));
  const cat = new Map<string, number>();
  const auth = new Map<string, number>();
  const touched = new Set<string>();
  const add = (id: string, w: number) => {
    const b = byId.get(id);
    if (!b) return;
    touched.add(id);
    cat.set(b.category, (cat.get(b.category) ?? 0) + w);
    auth.set(b.author, (auth.get(b.author) ?? 0) + w);
  };
  const completedIds = new Set<string>();
  const readingIds = new Set<string>();
  for (const p of signals.progress) {
    const recent = now - p.lastReadAt < 14 * DAY ? 1 : 0;
    add(p.bookId, (p.completed ? 3 : 2) + recent);
    (p.completed ? completedIds : readingIds).add(p.bookId);
  }
  for (const id of signals.favorites) add(id, 3);
  for (const id of signals.bookmarks) add(id, 1.5);
  const lowRated = new Set<string>();
  for (const r of signals.ratings) {
    // Strong ratings move the needle more than lukewarm ones.
    add(r.bookId, (r.rating - 3) * 2);
    if (r.rating <= 2) lowRated.add(r.bookId);
  }
  for (const v of signals.views) add(v.bookId, 0.5);

  const highRated = signals.ratings.filter((r) => r.rating >= 4).map((r) => r.bookId);
  const anchors = Array.from(new Set([...signals.favorites, ...highRated]))
    .map((id) => byId.get(id))
    .filter((b): b is Book => Boolean(b));
  const recent = [...signals.progress]
    .sort((a, b) => b.lastReadAt - a.lastReadAt)
    .slice(0, 3)
    .map((p) => byId.get(p.bookId))
    .filter((b): b is Book => Boolean(b));
  const bookmarkCategories = new Set(
    signals.bookmarks.map((id) => byId.get(id)?.category).filter((c): c is string => Boolean(c)),
  );
  return {
    categoryWeights: cat,
    authorWeights: auth,
    interactions: touched.size,
    completedIds,
    readingIds,
    lowRated,
    anchors,
    recent,
    bookmarkCategories,
  };
}

/** Readers need activity on at least two books before we personalise. */
export const MIN_INTERACTIONS = 2;
export function isPersonalizable(p: ReadingProfile) {
  return p.interactions >= MIN_INTERACTIONS;
}

function maxSim(book: Book, anchors: Book[]) {
  let best = 0;
  let from: Book | null = null;
  for (const a of anchors) {
    const s = similarity(book, a);
    if (s > best) {
      best = s;
      from = a;
    }
  }
  return { best, from };
}

export function scorePersonalized(
  book: Book,
  profile: ReadingProfile,
  stats: Map<string, BookStats>,
  favorites: Set<string>,
  now = Date.now(),
): Recommendation | null {
  if (profile.lowRated.has(book.id)) return null;
  const maxCat = Math.max(1, ...profile.categoryWeights.values());
  const maxAuth = Math.max(1, ...profile.authorWeights.values());
  const parts: [number, string][] = [];

  const catW = Math.max(0, profile.categoryWeights.get(book.category) ?? 0);
  if (catW > 0) parts.push([5 * (catW / maxCat), `Because you read ${book.category} books`]);
  const authW = Math.max(0, profile.authorWeights.get(book.author) ?? 0);
  if (authW > 0) parts.push([4 * (authW / maxAuth), `More from ${book.author}`]);
  const fav = maxSim(book, profile.anchors);
  if (fav.best > 0.2) parts.push([5 * fav.best, "Similar to books you favorited or rated highly"]);
  const rec = maxSim(book, profile.recent);
  if (rec.best > 0.2 && rec.from) parts.push([3 * rec.best, `Similar to ${rec.from.title}`]);
  if (profile.bookmarkCategories.has(book.category)) parts.push([2, `Like books you bookmarked`]);
  const s = stats.get(book.id);
  if (s?.ratingAvg && s.ratingCount > 0 && s.ratingAvg >= 4) parts.push([2 * ((s.ratingAvg - 3) / 2), "Highly rated by readers"]);
  if (book.createdAt && now - book.createdAt < 30 * DAY) parts.push([1, "Recently added"]);

  let score = parts.reduce((sum, [v]) => sum + v, 0);
  if (score <= 0) return null;

  // Already finished or favourited: only keep when very strongly relevant.
  if (profile.completedIds.has(book.id) || favorites.has(book.id)) {
    if (score < 14) return null;
    score *= 0.5;
  }
  const top = parts.sort((a, b) => b[0] - a[0])[0];
  return { book, score, reason: top?.[1] ?? "Picked for you" };
}

export function recommendForYou(
  books: Book[],
  signals: UserSignals,
  stats: Map<string, BookStats>,
  opts: { limit?: number; seed?: number; exclude?: Set<string>; now?: number } = {},
): Recommendation[] {
  const { limit = 12, seed = 0, exclude = new Set(), now = Date.now() } = opts;
  const profile = buildProfile(books, signals, now);
  const favorites = new Set(signals.favorites);
  const scored: Recommendation[] = [];
  for (const b of books) {
    if (exclude.has(b.id)) continue;
    const r = scorePersonalized(b, profile, stats, favorites, now);
    if (r) scored.push({ ...r, score: jitter(r.score, b.id, seed) });
  }
  // Discovery: a few well-liked books from categories the reader hasn't explored.
  const explored = new Set(scored.map((r) => r.book.category));
  for (const b of books) {
    if (exclude.has(b.id) || explored.has(b.category) || profile.completedIds.has(b.id)) continue;
    const pop = popularity(stats.get(b.id));
    scored.push({ book: b, score: jitter(1 + Math.min(2, pop / 10), b.id, seed), reason: `Discover ${b.category}` });
  }
  return diversify(scored, limit);
}

export function popularBooks(
  books: Book[],
  stats: Map<string, BookStats>,
  opts: { limit?: number; seed?: number; exclude?: Set<string>; now?: number } = {},
): Recommendation[] {
  const { limit = 12, seed = 0, exclude = new Set(), now = Date.now() } = opts;
  const items = books
    .filter((b) => !exclude.has(b.id))
    .map((b) => {
      const s = stats.get(b.id);
      const pop = popularity(s);
      const fresh = b.createdAt && now - b.createdAt < 30 * DAY ? 1 : 0;
      const reason =
        s && s.ratingAvg && s.ratingAvg >= 4 && s.ratingCount > 0
          ? "Highly rated by readers"
          : pop > 0
            ? `Popular in ${b.category}`
            : b.featured
              ? "Featured by the library"
              : "New on the shelf";
      return { book: b, score: jitter(pop + fresh + (b.featured ? 0.5 : 0) + 0.01, b.id, seed), reason };
    });
  return diversify(items, limit);
}

/** Books most like `target` — used for "You May Also Like" and "Because you read". */
export function similarBooks(
  target: Book,
  books: Book[],
  stats: Map<string, BookStats>,
  opts: { limit?: number; exclude?: Set<string> } = {},
): Recommendation[] {
  const { limit = 6, exclude = new Set() } = opts;
  const items: Recommendation[] = [];
  for (const b of books) {
    if (b.id === target.id || exclude.has(b.id)) continue;
    const sim = similarity(target, b);
    if (sim < 0.15) continue;
    const s = stats.get(b.id);
    const ratingBonus = s?.ratingAvg && s.ratingCount ? (s.ratingAvg - 3) * 0.05 : 0;
    const reason =
      b.author === target.author
        ? `Also by ${b.author}`
        : b.category === target.category
          ? `More ${b.category}`
          : "Similar themes";
    items.push({ book: b, score: sim + ratingBonus, reason });
  }
  return items.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function basedOnFavorites(
  books: Book[],
  signals: UserSignals,
  stats: Map<string, BookStats>,
  opts: { limit?: number; exclude?: Set<string> } = {},
): Recommendation[] {
  const { limit = 6, exclude = new Set() } = opts;
  const byId = new Map(books.map((b) => [b.id, b]));
  const favs = signals.favorites.map((id) => byId.get(id)).filter((b): b is Book => Boolean(b));
  if (!favs.length) return [];
  const skip = new Set([...exclude, ...signals.favorites]);
  const items: Recommendation[] = [];
  for (const b of books) {
    if (skip.has(b.id)) continue;
    const { best, from } = maxSim(b, favs);
    if (best < 0.2 || !from) continue;
    items.push({ book: b, score: best + popularity(stats.get(b.id)) * 0.001, reason: `Similar to ${from.title}` });
  }
  return diversify(items, limit);
}

export function topCategory(books: Book[], signals: UserSignals): string | null {
  const p = buildProfile(books, signals);
  let best: string | null = null;
  let w = 0;
  for (const [c, v] of p.categoryWeights) if (v > w) [best, w] = [c, v];
  return best;
}

export type ReadingInterests = {
  favoriteCategories: string[];
  mostReadCategory: string | null;
  favoriteAuthors: string[];
  completed: number;
  reading: number;
};

export function readingInterests(books: Book[], signals: UserSignals): ReadingInterests {
  const byId = new Map(books.map((b) => [b.id, b]));
  const rank = (ids: string[], key: "category" | "author") => {
    const m = new Map<string, number>();
    for (const id of ids) {
      const b = byId.get(id);
      if (b) m.set(b[key], (m.get(b[key]) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  };
  const highRated = signals.ratings.filter((r) => r.rating >= 4).map((r) => r.bookId);
  const readIds = signals.progress.map((p) => p.bookId);
  return {
    favoriteCategories: rank([...signals.favorites, ...highRated], "category").slice(0, 3),
    mostReadCategory: rank(readIds, "category")[0] ?? null,
    favoriteAuthors: rank([...signals.favorites, ...highRated, ...readIds], "author").slice(0, 3),
    completed: signals.progress.filter((p) => p.completed && byId.has(p.bookId)).length,
    reading: signals.progress.filter((p) => !p.completed && byId.has(p.bookId)).length,
  };
}
