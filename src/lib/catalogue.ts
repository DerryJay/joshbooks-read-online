/**
 * Database-backed book catalogue.
 * Backed by Firebase Firestore with fallback to seed data.
 */
import { queryOptions } from "@tanstack/react-query";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/integrations/firebase/client";
import { SEED_BOOKS, SEED_CATEGORIES } from "./seed-data";

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

export class CatalogueError extends Error {}

let hasSeededFirestore = false;
async function autoSeedFirestoreIfEmpty() {
  if (hasSeededFirestore || typeof window === "undefined") return;
  hasSeededFirestore = true;
  try {
    const booksSnap = await getDocs(collection(db, "books"));
    if (booksSnap.empty) {
      // Seed books
      for (const book of SEED_BOOKS) {
        await setDoc(doc(db, "books", book.id), book, { merge: true });
      }
      // Seed categories
      for (const cat of SEED_CATEGORIES) {
        await setDoc(doc(db, "categories", cat.id), cat, { merge: true });
      }
      console.log("Seeded initial books and categories to Firestore");
    }
  } catch (err) {
    console.warn("Could not auto-seed Firestore:", err);
  }
}

function normalizeBook(data: any): Book {
  let pages = data.pages;
  if (!pages && data.pagesJson) {
    try {
      pages = JSON.parse(data.pagesJson);
    } catch {}
  }
  return {
    ...data,
    pages: pages || [],
  };
}

async function fetchCatalogue(): Promise<Book[]> {
  try {
    const snapshot = await getDocs(collection(db, "books"));
    if (!snapshot.empty) {
      const books = snapshot.docs.map((d) => normalizeBook(d.data()));
      return books.sort((a, b) => a.title.localeCompare(b.title));
    }
  } catch (err) {
    console.warn("Could not fetch catalogue from Firestore, falling back to seed:", err);
  }
  return SEED_BOOKS;
}

async function fetchBook(id: string): Promise<Book | null> {
  try {
    const snap = await getDoc(doc(db, "books", id));
    if (snap.exists()) {
      return normalizeBook(snap.data());
    }
  } catch (err) {
    console.warn("Could not fetch book from Firestore, falling back to seed:", err);
  }
  const fallback = SEED_BOOKS.find((b) => b.id === id);
  return fallback || null;
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const snapshot = await getDocs(collection(db, "categories"));
    if (!snapshot.empty) {
      const list = snapshot.docs.map((d) => d.data() as Category);
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
  } catch (err) {
    console.warn("Could not fetch categories from Firestore, falling back to seed:", err);
  }
  return SEED_CATEGORIES;
}

const STALE = 5 * 60 * 1000;

export const catalogueQuery = () =>
  queryOptions({ queryKey: ["catalogue"], queryFn: fetchCatalogue, staleTime: STALE });

export const bookQuery = (id: string) =>
  queryOptions({ queryKey: ["book", id], queryFn: () => fetchBook(id), staleTime: STALE });

export const categoriesQuery = () =>
  queryOptions({ queryKey: ["categories"], queryFn: fetchCategories, staleTime: STALE });
