/**
 * Search, filter and sort logic for the books catalogue.
 * Pure functions so the UI stays declarative and the rules stay testable.
 */
import type { Book } from "@/lib/catalogue";
import type { ReadingRecord } from "@/lib/reading-progress";

export type ReadingStatus = "all" | "unread" | "reading" | "completed";

export type SortKey =
  | "title-asc"
  | "title-desc"
  | "author-asc"
  | "newest"
  | "oldest"
  | "recent";

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "title-asc", label: "Title: A–Z" },
  { value: "title-desc", label: "Title: Z–A" },
  { value: "author-asc", label: "Author: A–Z" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "recent", label: "Recently read" },
];

export const readingStatusOptions: { value: ReadingStatus; label: string }[] = [
  { value: "all", label: "All books" },
  { value: "unread", label: "Unread" },
  { value: "reading", label: "Currently reading" },
  { value: "completed", label: "Completed" },
];

export type Filters = {
  query: string;
  category: string;
  author: string;
  yearFrom: string;
  yearTo: string;
  status: ReadingStatus;
  favoritesOnly: boolean;
  sort: SortKey;
};

export const defaultFilters: Filters = {
  query: "",
  category: "All",
  author: "All",
  yearFrom: "",
  yearTo: "",
  status: "all",
  favoritesOnly: false,
  sort: "title-asc",
};

export function authorsOf(books: Book[]) {
  return ["All", ...Array.from(new Set(books.map((b) => b.author))).sort()];
}

export function yearBoundsOf(books: Book[]) {
  const years = books.map((b) => bookYear(b)).filter((y): y is number => y !== null);
  return { min: years.length ? Math.min(...years) : 0, max: years.length ? Math.max(...years) : 0 };
}

export function bookYear(book: Book): number | null {
  const match = book.year.match(/\d{3,4}/);
  return match ? Number(match[0]) : null;
}

export function readingStatusOf(
  book: Book,
  records: Record<string, ReadingRecord>,
): Exclude<ReadingStatus, "all"> {
  const record = records[book.id];
  if (!record) return "unread";
  const total = record.totalPages || book.pageCount;
  return record.page >= total - 1 ? "completed" : "reading";
}

export function isFiltered(filters: Filters) {
  return (
    filters.query.trim() !== "" ||
    filters.category !== "All" ||
    filters.author !== "All" ||
    filters.yearFrom !== "" ||
    filters.yearTo !== "" ||
    filters.status !== "all" ||
    filters.favoritesOnly ||
    filters.sort !== defaultFilters.sort
  );
}

export function filterAndSortBooks(
  books: Book[],
  filters: Filters,
  records: Record<string, ReadingRecord>,
  favorites: string[],
): Book[] {
  const q = filters.query.trim().toLowerCase();
  const from = Number(filters.yearFrom);
  const to = Number(filters.yearTo);

  const matched = books.filter((book) => {
    if (filters.category !== "All" && book.category !== filters.category) return false;
    if (filters.author !== "All" && book.author !== filters.author) return false;
    if (filters.favoritesOnly && !favorites.includes(book.id)) return false;

    if (filters.status !== "all" && readingStatusOf(book, records) !== filters.status) {
      return false;
    }

    const year = bookYear(book);
    if (filters.yearFrom !== "" && !Number.isNaN(from) && (year === null || year < from)) return false;
    if (filters.yearTo !== "" && !Number.isNaN(to) && (year === null || year > to)) return false;

    if (q.length === 0) return true;
    return [book.title, book.author, book.category, book.shortDescription, book.description, book.publisher]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const sorted = [...matched];
  sorted.sort((a, b) => {
    switch (filters.sort) {
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "author-asc":
        return a.author.localeCompare(b.author) || a.title.localeCompare(b.title);
      case "newest":
        return (bookYear(b) ?? 0) - (bookYear(a) ?? 0);
      case "oldest":
        return (bookYear(a) ?? 0) - (bookYear(b) ?? 0);
      case "recent":
        return (records[b.id]?.updatedAt ?? 0) - (records[a.id]?.updatedAt ?? 0);
      case "title-asc":
      default:
        return a.title.localeCompare(b.title);
    }
  });
  return sorted;
}

export type Suggestion = { kind: "book" | "author" | "category"; label: string; bookId?: string };

export function buildSuggestions(books: Book[], query: string, limit = 6): Suggestion[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const out: Suggestion[] = [];

  for (const book of books) {
    if (book.title.toLowerCase().includes(q)) {
      out.push({ kind: "book", label: book.title, bookId: book.id });
    }
  }
  for (const author of new Set(books.map((b) => b.author))) {
    if (author.toLowerCase().includes(q)) out.push({ kind: "author", label: author });
  }
  for (const category of new Set(books.map((b) => b.category))) {
    if (category.toLowerCase().includes(q)) out.push({ kind: "category", label: category });
  }
  return out.slice(0, limit);
}
