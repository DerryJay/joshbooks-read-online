/**
 * Data access for recommendations. Public stats come from a cached aggregate
 * function; personal signals are read through RLS (own rows only).
 */
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BookStats, UserSignals } from "@/lib/recommendations";

export type EventType =
  | "viewed"
  | "started_reading"
  | "completed"
  | "favorited"
  | "unfavorited"
  | "bookmarked"
  | "rated"
  | "recommendation_clicked";

export const bookStatsQuery = () =>
  queryOptions({
    queryKey: ["book-stats"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("public_book_stats");
      const map = new Map<string, BookStats>();
      if (error) return map; // stats are optional — recommendations still work on metadata
      for (const r of data ?? []) {
        map.set(r.book_id, {
          readers: r.readers,
          completed: r.completed,
          favorites: r.favorites,
          views: r.views,
          ratingAvg: r.rating_avg === null ? null : Number(r.rating_avg),
          ratingCount: r.rating_count,
        });
      }
      return map;
    },
  });

export const signalsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["rec-signals", userId ?? "anon"],
    staleTime: 2 * 60 * 1000,
    queryFn: async (): Promise<UserSignals> => {
      if (!userId) return { progress: [], favorites: [], bookmarks: [], ratings: [], views: [] };
      const [p, f, b, r, v] = await Promise.all([
        supabase.from("reading_progress").select("book_id, completed, last_read_at, progress_percentage").order("last_read_at", { ascending: false }).limit(200),
        supabase.from("favorites").select("book_id").limit(300),
        supabase.from("bookmarks").select("book_id").limit(300),
        supabase.from("book_ratings").select("book_id, rating").limit(300),
        supabase.from("recommendation_events").select("book_id, created_at").eq("event_type", "viewed").order("created_at", { ascending: false }).limit(50),
      ]);
      return {
        progress: (p.data ?? []).map((x) => ({
          bookId: x.book_id,
          completed: x.completed,
          lastReadAt: new Date(x.last_read_at).getTime(),
          percent: x.progress_percentage,
        })),
        favorites: (f.data ?? []).map((x) => x.book_id),
        bookmarks: Array.from(new Set((b.data ?? []).map((x) => x.book_id))),
        ratings: (r.data ?? []).map((x) => ({ bookId: x.book_id, rating: x.rating })),
        views: (v.data ?? []).map((x) => ({ bookId: x.book_id, at: new Date(x.created_at).getTime() })),
      };
    },
  });

const sent = new Set<string>();

/** Fire-and-forget activity log; one row per (user, book, type), at most once per session. */
export async function trackEvent(bookId: string, type: EventType) {
  const key = `${bookId}:${type}`;
  if (sent.has(key) && type !== "favorited" && type !== "unfavorited") return;
  sent.add(key);
  try {
    const { data } = await supabase.auth.getSession();
    const user_id = data.session?.user.id;
    if (!user_id) return;
    await supabase
      .from("recommendation_events")
      .upsert({ user_id, book_id: bookId, event_type: type, created_at: new Date().toISOString() }, { onConflict: "user_id,book_id,event_type" });
  } catch {
    /* tracking must never break reading */
  }
}

const shown = new Set<string>();
export async function logImpressions(ids: string[]) {
  const key = ids.join(",");
  if (!ids.length || shown.has(key)) return;
  shown.add(key);
  try {
    await supabase.rpc("log_recommendation_impressions", { _ids: ids.slice(0, 24) });
  } catch {
    /* aggregate only — ignore failures */
  }
}

export const myRatingQuery = (userId: string | undefined, bookId: string) =>
  queryOptions({
    queryKey: ["my-rating", userId ?? "anon", bookId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase.from("book_ratings").select("rating").eq("book_id", bookId).maybeSingle();
      return data?.rating ?? null;
    },
  });

export async function rateBook(bookId: string, rating: number) {
  const { data } = await supabase.auth.getSession();
  const user_id = data.session?.user.id;
  if (!user_id) throw new Error("Please sign in to rate books.");
  const safe = Math.min(5, Math.max(1, Math.round(rating)));
  const { error } = await supabase
    .from("book_ratings")
    .upsert({ user_id, book_id: bookId, rating: safe }, { onConflict: "user_id,book_id" });
  if (error) throw new Error("We couldn't save your rating.");
  void trackEvent(bookId, "rated");
}

export type RecommendationAdminStats = {
  impressions: number;
  clicks: number;
  most_recommended: { id: string; title: string; count: number }[];
  most_viewed: { id: string; title: string; count: number }[];
  most_completed: { id: string; title: string; count: number }[];
  popular_categories: { id: string; name: string; count: number }[];
};

export const adminRecommendationQuery = () =>
  queryOptions({
    queryKey: ["admin", "recommendations"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_recommendation_stats");
      if (error) throw new Error("We couldn't load recommendation statistics.");
      return data as unknown as RecommendationAdminStats;
    },
  });
