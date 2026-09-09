/**
 * Frontend-only favourites store (localStorage, no account required).
 * Kept isolated so it can later be swapped for a server-backed store.
 */
const KEY = "joshbooks:favorites:v1";
export const FAVORITES_EVENT = "joshbooks:favorites";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readFavorites(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(bookId: string): string[] {
  const current = readFavorites();
  const next = current.includes(bookId)
    ? current.filter((id) => id !== bookId)
    : [...current, bookId];
  if (isBrowser()) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(FAVORITES_EVENT));
    } catch {
      /* storage unavailable — the rest of the app still works */
    }
  }
  return next;
}
