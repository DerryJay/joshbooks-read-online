import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { catalogueQuery, categoriesQuery, type Book } from "@/lib/catalogue";

/** The public book list (metadata only) plus derived helpers. */
export function useCatalogue() {
  const query = useQuery(catalogueQuery());
  const cats = useQuery(categoriesQuery());
  const books = useMemo(() => query.data ?? [], [query.data]);

  const byId = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);
  const getBook = useCallback((id: string): Book | undefined => byId.get(id), [byId]);

  const featuredBooks = useMemo(() => {
    const featured = books.filter((b) => b.featured);
    return featured.length ? featured : books.slice(0, 3);
  }, [books]);

  const categories = useMemo(() => {
    const names = cats.data?.map((c) => c.name) ?? Array.from(new Set(books.map((b) => b.category)));
    return ["All", ...[...names].sort()];
  }, [cats.data, books]);

  return {
    books,
    getBook,
    featuredBooks,
    categories,
    loading: query.isPending,
    error: query.isError,
    retry: () => void query.refetch(),
  };
}
