import { useCallback, useEffect, useState } from "react";
import {
  readAllProgress,
  readProgress,
  saveProgress,
  type ReadingRecord,
} from "@/lib/reading-progress";

/** Reads progress after hydration so server and client markup match. */
export function useSavedProgress(bookId: string) {
  const [record, setRecord] = useState<ReadingRecord | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRecord(readProgress(bookId));
    setReady(true);
  }, [bookId]);

  const save = useCallback(
    (page: number, totalPages: number) => {
      saveProgress(bookId, page, totalPages);
      setRecord({ bookId, page, totalPages, updatedAt: Date.now() });
    },
    [bookId],
  );

  return { record, ready, save };
}

/** Every stored record keyed by book id (used for reading-status filters). */
export function useAllProgress() {
  const [records, setRecords] = useState<Record<string, ReadingRecord>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
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
  }, []);

  return { records, ready };
}

/** All stored records, newest first, kept in sync with other components. */
export function useRecentlyOpened(limit = 4) {
  const [records, setRecords] = useState<ReadingRecord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setRecords(
        Object.values(readAllProgress())
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, limit),
      );
      setReady(true);
    };
    sync();
    window.addEventListener("joshbooks:progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("joshbooks:progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, [limit]);

  return { records, ready };
}
