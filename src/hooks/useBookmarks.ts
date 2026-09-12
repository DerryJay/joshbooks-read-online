import { useCallback, useEffect, useState } from "react";
import {
  BOOKMARKS_EVENT,
  addLocalBookmark,
  readLocalBookmarks,
  removeLocalBookmark,
} from "@/lib/bookmarks";
import { addBookmark, fetchBookmarks, removeBookmark, type Bookmark } from "@/lib/user-data";
import { useAuth } from "@/hooks/useAuth";

/** Saved pages for one book (or the whole library when bookId is omitted). */
export function useBookmarks(bookId?: string) {
  const { user, loading: authLoading } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    if (user) {
      setBookmarks(await fetchBookmarks(bookId));
    } else {
      setBookmarks(readLocalBookmarks(bookId));
    }
    setReady(true);
  }, [user, bookId]);

  useEffect(() => {
    if (authLoading) return;
    setReady(false);
    void reload();

    if (user) return;
    const sync = () => void reload();
    window.addEventListener(BOOKMARKS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(BOOKMARKS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [authLoading, user, reload]);

  const add = useCallback(
    async (page: number, note?: string) => {
      if (!bookId) return;
      if (user) {
        await addBookmark(user.id, bookId, page, note);
        await reload();
        return;
      }
      addLocalBookmark(bookId, page, note);
    },
    [bookId, user, reload],
  );

  const remove = useCallback(
    async (page: number) => {
      if (!bookId) return;
      if (user) {
        await removeBookmark(user.id, bookId, page);
        await reload();
        return;
      }
      removeLocalBookmark(bookId, page);
    },
    [bookId, user, reload],
  );

  const has = useCallback(
    (page: number) => bookmarks.some((mark) => mark.page === page),
    [bookmarks],
  );

  return { bookmarks, ready, add, remove, has };
}
