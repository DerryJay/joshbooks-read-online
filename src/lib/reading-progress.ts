/**
 * Frontend-only reading progress store.
 * Uses localStorage so returning visitors can continue reading without an account.
 * Isolated here so it could later be swapped for a server-backed store.
 */
export type ReadingRecord = {
  bookId: string;
  page: number;
  totalPages: number;
  updatedAt: number;
};

const KEY = "joshbooks:reading-progress:v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readAllProgress(): Record<string, ReadingRecord> {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ReadingRecord>;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

export function readProgress(bookId: string): ReadingRecord | null {
  return readAllProgress()[bookId] ?? null;
}

export function saveProgress(bookId: string, page: number, totalPages: number) {
  if (!isBrowser()) return;
  try {
    const all = readAllProgress();
    all[bookId] = { bookId, page, totalPages, updatedAt: Date.now() };
    window.localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("joshbooks:progress"));
  } catch {
    /* storage unavailable — the reader still works, it just won't remember */
  }
}

export function clearProgress(bookId: string) {
  if (!isBrowser()) return;
  try {
    const all = readAllProgress();
    delete all[bookId];
    window.localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("joshbooks:progress"));
  } catch {
    /* ignore */
  }
}

export function recentlyOpened(limit = 4): ReadingRecord[] {
  return Object.values(readAllProgress())
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}

export function progressPercent(page: number, totalPages: number) {
  if (!totalPages) return 0;
  return Math.round(((page + 1) / totalPages) * 100);
}

const THEME_KEY = "joshbooks:reader-theme:v1";
export type ReaderTheme = "light" | "dark";

export function readReaderTheme(): ReaderTheme {
  if (!isBrowser()) return "light";
  return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

export function saveReaderTheme(theme: ReaderTheme) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}
