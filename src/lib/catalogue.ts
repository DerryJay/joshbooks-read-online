/**
 * Database-backed book catalogue. Books and categories are publicly readable;
 * covers and files live in Storage and are resolved to short-lived signed URLs.
 */
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  categoryId: string | null;
  year: string;
  publisher: string;
  pagesLabel: string;
  language: string;
  shortDescription: string;
  description: string;
  cover: string;
  featured: boolean;
  /** When the book was added to the catalogue (ms epoch). */
  createdAt: number;
  /** Signed URL of the full PDF/document in Storage, when one has been uploaded. */
  documentUrl?: string | undefined;
  pageCount: number;
  /** Excerpt pages for the in-browser reader — only loaded for a single book. */
  pages: string[][];
};

export type Category = { id: string; name: string; description: string | null };

const LIST_COLUMNS =
  "id, title, author, short_description, description, category_id, publication_year, cover_url, pdf_url, page_count, publisher, language, pages_label, featured, created_at, categories(name)";

type Row = {
  id: string;
  title: string;
  author: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  publication_year: number | null;
  cover_url: string | null;
  pdf_url: string | null;
  page_count: number;
  publisher: string | null;
  language: string | null;
  pages_label: string | null;
  featured: boolean;
  created_at?: string;
  categories: { name: string } | null;
  content?: unknown;
};

const SIGNED_URL_TTL = 60 * 60 * 6;

async function signPaths(bucket: string, paths: string[]) {
  const unique = Array.from(new Set(paths.filter((p) => p && !/^https?:/.test(p))));
  const map = new Map<string, string>();
  if (unique.length === 0) return map;
  const { data } = await supabase.storage.from(bucket).createSignedUrls(unique, SIGNED_URL_TTL);
  for (const entry of data ?? []) {
    if (entry.path && entry.signedUrl) map.set(entry.path, entry.signedUrl);
  }
  return map;
}

function toBook(row: Row, covers: Map<string, string>, files: Map<string, string>): Book {
  const cover = row.cover_url ? (covers.get(row.cover_url) ?? row.cover_url) : "";
  const doc = row.pdf_url ? (files.get(row.pdf_url) ?? row.pdf_url) : undefined;
  const pages = Array.isArray(row.content) ? (row.content as string[][]) : [];
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    category: row.categories?.name ?? "Other",
    categoryId: row.category_id,
    year: row.publication_year ? String(row.publication_year) : "Unknown",
    publisher: row.publisher ?? "Unknown publisher",
    pagesLabel: row.pages_label ?? `${row.page_count} pages`,
    language: row.language ?? "English",
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    cover: cover && /^https?:/.test(cover) ? cover : "",
    featured: row.featured,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : 0,
    documentUrl: doc && /^https?:/.test(doc) ? doc : undefined,
    pageCount: row.page_count || pages.length,
    pages,
  };
}

/** Friendly error that never leaks raw database messages to readers. */
export class CatalogueError extends Error {}

const CATALOGUE_LIMIT = 500;

async function fetchCatalogue(): Promise<Book[]> {
  const { data, error } = await supabase
    .from("books")
    .select(LIST_COLUMNS)
    .order("title", { ascending: true })
    .range(0, CATALOGUE_LIMIT - 1);
  if (error) throw new CatalogueError("We couldn't load the catalogue right now.");
  const rows = (data ?? []) as unknown as Row[];
  const covers = await signPaths("book-covers", rows.map((r) => r.cover_url ?? ""));
  return rows.map((row) => toBook(row, covers, new Map()));
}

async function fetchBook(id: string): Promise<Book | null> {
  const { data, error } = await supabase
    .from("books")
    .select(`${LIST_COLUMNS}, content`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new CatalogueError("We couldn't load this book right now.");
  if (!data) return null;
  const row = data as unknown as Row;
  const [covers, files] = await Promise.all([
    signPaths("book-covers", [row.cover_url ?? ""]),
    signPaths("book-files", [row.pdf_url ?? ""]),
  ]);
  return toBook(row, covers, files);
}

async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, description")
    .order("name");
  if (error) throw new CatalogueError("We couldn't load categories right now.");
  return data ?? [];
}

const STALE = 5 * 60 * 1000;

export const catalogueQuery = () =>
  queryOptions({ queryKey: ["catalogue"], queryFn: fetchCatalogue, staleTime: STALE });

export const bookQuery = (id: string) =>
  queryOptions({ queryKey: ["book", id], queryFn: () => fetchBook(id), staleTime: STALE });

export const categoriesQuery = () =>
  queryOptions({ queryKey: ["categories"], queryFn: fetchCategories, staleTime: STALE });
