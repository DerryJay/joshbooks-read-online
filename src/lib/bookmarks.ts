/**
 * Guest bookmarks (localStorage). Signed-in readers keep bookmarks in the cloud
 * instead — see src/lib/user-data.ts.
 */
import type { Bookmark } from "@/lib/user-data";

const KEY = "joshbooks:bookmarks:v1";
export const BOOKMARKS_EVENT = "joshbooks:bookmarks";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readLocalBookmarks(bookId?: string): Bookmark[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Bookmark[]) : [];
    const all = Array.isArray(parsed) ? parsed : [];
    const scoped = bookId ? all.filter((b) => b.bookId === bookId) : all;
    return scoped.sort((a, b) => a.page - b.page);
  } catch {
    return [];
  }
}

function write(next: Bookmark[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(BOOKMARKS_EVENT));
  } catch {
    /* storage unavailable — reading still works */
  }
}

export function addLocalBookmark(bookId: string, page: number, note?: string) {
  const all = readLocalBookmarks();
  if (all.some((b) => b.bookId === bookId && b.page === page)) return;
  write([
    ...all,
    {
      id: `${bookId}-${page}-${Date.now()}`,
      bookId,
      page,
      note: note ?? null,
      createdAt: Date.now(),
    },
  ]);
}

export function removeLocalBookmark(bookId: string, page: number) {
  write(readLocalBookmarks().filter((b) => !(b.bookId === bookId && b.page === page)));
}
