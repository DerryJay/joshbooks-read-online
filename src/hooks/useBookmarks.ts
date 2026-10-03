import { useCallback, useEffect, useState } from "react";
import {
  BOOKMARKS_EVENT,
  addLocalBookmark,
  readLocalBookmarks,
  removeLocalBookmark,
} from "@/lib/bookmarks";
import { toast } from "sonner";
import {
  addBookmark,
  fetchBookmarks,
  friendlyMessage,
  removeBookmark,
  type Bookmark,
} from "@/lib/user-data";
import { useAuth } from "@/hooks/useAuth";

/** Saved pages for one book (or the whole library when bookId is omitted). */
export function useBookmarks(bookId?: string) {
  const { user, loading: authLoading } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    if (user) {
      try {
        setBookmarks(await fetchBookmarks(bookId));
      } catch (error) {
        toast.error(friendlyMessage(error, "We couldn't load your bookmarks."));
      }
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
        try {
          await addBookmark(bookId, page, note);
          toast.success(`Bookmarked page ${page + 1}.`);
        } catch (error) {
          toast.error(friendlyMessage(error, "We couldn't save this bookmark."));
        }
        await reload();
        return;
      }
      addLocalBookmark(bookId, page, note);
    },
    [bookId, user, reload],
  );

  const remove = useCallback(
    async (page: number, targetBookId?: string) => {
      const id = targetBookId ?? bookId;
      if (!id) return;
      if (user) {
        try {
          await removeBookmark(id, page);
        } catch (error) {
          toast.error(friendlyMessage(error, "We couldn't delete this bookmark."));
        }
        await reload();
        return;
      }
      removeLocalBookmark(id, page);
    },
    [bookId, user, reload],
  );

  const has = useCallback(
    (page: number) => bookmarks.some((mark) => mark.page === page),
    [bookmarks],
  );

  return { bookmarks, ready, add, remove, has };
}
