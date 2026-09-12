/**
 * Cloud-backed personal library (favourites, bookmarks, reading progress).
 * Every row is scoped to the signed-in user by row-level security, so one
 * reader can never see another reader's library.
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

export async function fetchFavorites(): Promise<string[]> {
  const { data, error } = await supabase.from("favorites").select("book_id");
  if (error || !data) return [];
  return data.map((row) => row.book_id);
}

export async function addFavorite(userId: string, bookId: string) {
  await supabase.from("favorites").upsert({ user_id: userId, book_id: bookId });
}

export async function removeFavorite(userId: string, bookId: string) {
  await supabase.from("favorites").delete().eq("user_id", userId).eq("book_id", bookId);
}

export async function fetchProgress(): Promise<Record<string, ReadingRecord>> {
  const { data, error } = await supabase
    .from("reading_progress")
    .select("book_id, page, total_pages, updated_at");
  if (error || !data) return {};
  const out: Record<string, ReadingRecord> = {};
  for (const row of data) {
    out[row.book_id] = {
      bookId: row.book_id,
      page: row.page,
      totalPages: row.total_pages,
      updatedAt: new Date(row.updated_at).getTime(),
    };
  }
  return out;
}

export async function upsertProgress(
  userId: string,
  bookId: string,
  page: number,
  totalPages: number,
) {
  await supabase.from("reading_progress").upsert(
    {
      user_id: userId,
      book_id: bookId,
      page,
      total_pages: totalPages,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,book_id" },
  );
}

export async function fetchBookmarks(bookId?: string): Promise<Bookmark[]> {
  let query = supabase.from("bookmarks").select("id, book_id, page, note, created_at");
  if (bookId) query = query.eq("book_id", bookId);
  const { data, error } = await query.order("page", { ascending: true });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    bookId: row.book_id,
    page: row.page,
    note: row.note,
    createdAt: new Date(row.created_at).getTime(),
  }));
}

export async function addBookmark(userId: string, bookId: string, page: number, note?: string) {
  await supabase
    .from("bookmarks")
    .upsert(
      { user_id: userId, book_id: bookId, page, note: note ?? null },
      { onConflict: "user_id,book_id,page" },
    );
}

export async function removeBookmark(userId: string, bookId: string, page: number) {
  await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .eq("page", page);
}
