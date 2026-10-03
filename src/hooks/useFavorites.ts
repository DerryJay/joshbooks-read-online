import { useCallback, useEffect, useState } from "react";
import { FAVORITES_EVENT, readFavorites, toggleFavorite } from "@/lib/favorites";
import { toast } from "sonner";
import { addFavorite, fetchFavorites, friendlyMessage, removeFavorite } from "@/lib/user-data";
import { useAuth } from "@/hooks/useAuth";

/**
 * Favourite book ids. Signed-in readers keep them in their account; guests keep
 * them in this browser only. Hydrated after mount so SSR markup matches.
 */
export function useFavorites() {
  const { user, loading: authLoading } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      let active = true;
      setReady(false);
      fetchFavorites()
        .then((cloud) => {
          if (active) setIds(cloud);
        })
        .catch((error) => toast.error(friendlyMessage(error, "We couldn't load your favourites.")))
        .finally(() => {
          if (active) setReady(true);
        });
      return () => {
        active = false;
      };
    }

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
  }, [user, authLoading]);

  const toggle = useCallback(
    (bookId: string) => {
      if (user) {
        const isOn = ids.includes(bookId);
        setIds((prev) => (isOn ? prev.filter((id) => id !== bookId) : [...prev, bookId]));
        (isOn ? removeFavorite(bookId) : addFavorite(bookId)).catch((error) => {
          // Roll back the optimistic change so the heart reflects what was saved.
          setIds((prev) => (isOn ? [...prev, bookId] : prev.filter((id) => id !== bookId)));
          toast.error(friendlyMessage(error, "We couldn't update your favourites."));
        });
        return;
      }
      setIds(toggleFavorite(bookId));
    },
    [user, ids],
  );

  const isFavorite = useCallback((bookId: string) => ids.includes(bookId), [ids]);

  return { ids, ready, toggle, isFavorite };
}
