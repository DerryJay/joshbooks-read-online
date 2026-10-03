import { useCallback, useEffect, useState } from "react";
import {
  readAllProgress,
  readProgress,
  saveProgress,
  type ReadingRecord,
} from "@/lib/reading-progress";
import { toast } from "sonner";
import { fetchProgress, friendlyMessage, upsertProgress } from "@/lib/user-data";
import { useAuth } from "@/hooks/useAuth";

/**
 * Reading position for one book. Signed-in readers store it in their account so
 * it follows them between devices; guests keep it in this browser.
 */
export function useSavedProgress(bookId: string) {
  const { user, loading: authLoading } = useAuth();
  const [record, setRecord] = useState<ReadingRecord | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      let active = true;
      setReady(false);
      fetchProgress()
        .then((all) => {
          if (active) setRecord(all[bookId] ?? null);
        })
        .catch((error) => toast.error(friendlyMessage(error, "We couldn't load your reading progress.")))
        .finally(() => {
          if (active) setReady(true);
        });
      return () => {
        active = false;
      };
    }

    setRecord(readProgress(bookId));
    setReady(true);
    return;
  }, [bookId, user, authLoading]);

  const save = useCallback(
    (page: number, totalPages: number) => {
      setRecord({ bookId, page, totalPages, updatedAt: Date.now() });
      if (user) {
        upsertProgress(bookId, page, totalPages).catch((error) => {
          toast.error(friendlyMessage(error, "We couldn't save your reading progress."), {
            id: "progress-save",
          });
        });
        return;
      }
      saveProgress(bookId, page, totalPages);
    },
    [bookId, user],
  );

  return { record, ready, save };
}

/** Every stored record keyed by book id (used for reading-status filters). */
export function useAllProgress() {
  const { user, loading: authLoading } = useAuth();
  const [records, setRecords] = useState<Record<string, ReadingRecord>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      let active = true;
      setReady(false);
      fetchProgress()
        .then((all) => {
          if (active) setRecords(all);
        })
        .catch(() => {
          /* the catalogue still works without progress; the reader reports save errors */
        })
        .finally(() => {
          if (active) setReady(true);
        });
      return () => {
        active = false;
      };
    }

    const sync = () => {
      setRecords(readAllProgress());
      setReady(true);
    };
    sync();
    window.addEventListener("joshbooks:progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("joshbooks:progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, [user, authLoading]);

  return { records, ready };
}

/** All stored records, newest first. */
export function useRecentlyOpened(limit = 4) {
  const { records, ready } = useAllProgress();
  const sorted = Object.values(records)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
  return { records: sorted, ready };
}
