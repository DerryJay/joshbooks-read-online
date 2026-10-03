/**
 * Account-backed personal library (favourites, bookmarks, reading progress).
 * Ownership always comes from the signed-in session; row-level security makes
 * sure one reader can never read or change another reader's rows.
 * Functions throw friendly messages — raw database errors are never shown.
 */
import { supabase } from "@/integrations/supabase/client";
import type { ReadingRecord } from "@/lib/reading-progress";

export type Bookmark = {
  id: string;
  bookId: string;
  page: number;
  note: string | null;
  createdAt: number;
};

export class LibraryError extends Error {}

async function sessionUserId() {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new LibraryError("Please sign in again to save this.");
  return id;
}

export async function fetchFavorites(): Promise<string[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("book_id")
    .order("created_at", { ascending: false });
  if (error) throw new LibraryError("We couldn't load your favourites.");
  return (data ?? []).map((row) => row.book_id);
}

export async function addFavorite(bookId: string) {
  const user_id = await sessionUserId();
  const { error } = await supabase
    .from("favorites")
    .upsert({ user_id, book_id: bookId }, { onConflict: "user_id,book_id", ignoreDuplicates: true });
  if (error) throw new LibraryError("We couldn't add this to your favourites.");
}

export async function removeFavorite(bookId: string) {
  const user_id = await sessionUserId();
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user_id)
    .eq("book_id", bookId);
  if (error) throw new LibraryError("We couldn't remove this from your favourites.");
}

export async function fetchProgress(): Promise<Record<string, ReadingRecord>> {
  const { data, error } = await supabase
    .from("reading_progress")
    .select("book_id, page, total_pages, last_read_at")
    .order("last_read_at", { ascending: false })
    .limit(200);
  if (error) throw new LibraryError("We couldn't load your reading progress.");
  const out: Record<string, ReadingRecord> = {};
  for (const row of data ?? []) {
    out[row.book_id] = {
      bookId: row.book_id,
      page: row.page,
      totalPages: row.total_pages,
      updatedAt: new Date(row.last_read_at).getTime(),
    };
  }
  return out;
}

export async function upsertProgress(bookId: string, page: number, totalPages: number) {
  const user_id = await sessionUserId();
  const safeTotal = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(0, page), safeTotal - 1);
  const now = new Date().toISOString();
  const { error } = await supabase.from("reading_progress").upsert(
    {
      user_id,
      book_id: bookId,
      page: safePage,
      total_pages: safeTotal,
      progress_percentage: Math.min(100, Math.round(((safePage + 1) / safeTotal) * 100)),
      completed: safePage >= safeTotal - 1,
      last_read_at: now,
      updated_at: now,
    },
    { onConflict: "user_id,book_id" },
  );
  if (error) throw new LibraryError("We couldn't save your reading progress.");
}

export async function fetchBookmarks(bookId?: string): Promise<Bookmark[]> {
  let query = supabase.from("bookmarks").select("id, book_id, page, note, created_at");
  if (bookId) query = query.eq("book_id", bookId);
  const { data, error } = await query.order("page", { ascending: true }).limit(500);
  if (error) throw new LibraryError("We couldn't load your bookmarks.");
  return (data ?? []).map((row) => ({
    id: row.id,
    bookId: row.book_id,
    page: row.page,
    note: row.note,
    createdAt: new Date(row.created_at).getTime(),
  }));
}

export async function addBookmark(bookId: string, page: number, note?: string) {
  const user_id = await sessionUserId();
  const { error } = await supabase
    .from("bookmarks")
    .upsert(
      { user_id, book_id: bookId, page, note: note?.trim() ? note.trim().slice(0, 500) : null },
      { onConflict: "user_id,book_id,page" },
    );
  if (error) throw new LibraryError("We couldn't save this bookmark.");
}

export async function removeBookmark(bookId: string, page: number) {
  const user_id = await sessionUserId();
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", user_id)
    .eq("book_id", bookId)
    .eq("page", page);
  if (error) throw new LibraryError("We couldn't delete this bookmark.");
}

export function friendlyMessage(error: unknown, fallback: string) {
  return error instanceof LibraryError ? error.message : fallback;
}
