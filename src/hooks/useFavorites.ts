import { useCallback, useEffect, useState } from "react";
import { FAVORITES_EVENT, readFavorites, toggleFavorite } from "@/lib/favorites";

/** Favourite book ids, hydrated after mount so SSR markup matches. */
export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIds(readFavorites());
      setReady(true);
    };
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((bookId: string) => {
    setIds(toggleFavorite(bookId));
  }, []);

  const isFavorite = useCallback((bookId: string) => ids.includes(bookId), [ids]);

  return { ids, ready, toggle, isFavorite };
}
