/**
 * Account-backed personal library (favourites, bookmarks, reading progress).
 * Backed by Firebase Firestore and Firebase Authentication.
 */
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '@/integrations/firebase/client';
import type { ReadingRecord } from '@/lib/reading-progress';

export type Bookmark = {
  id: string;
  bookId: string;
  page: number;
  note: string | null;
  createdAt: number;
};

export class LibraryError extends Error {}

async function sessionUserId() {
  const user = auth.currentUser;
  if (!user) throw new LibraryError('Please sign in again to save this.');
  return user.uid;
}

export async function fetchFavorites(): Promise<string[]> {
  const userId = await sessionUserId();
  const path = `users/${userId}/favorites`;
  try {
    const q = query(collection(db, 'users', userId, 'favorites'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.id);
  } catch (error) {
    console.error('Error loading favourites:', error);
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function addFavorite(bookId: string) {
  const userId = await sessionUserId();
  const path = `users/${userId}/favorites/${bookId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'favorites', bookId), {
      userId,
      bookId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error adding favourite:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeFavorite(bookId: string) {
  const userId = await sessionUserId();
  const path = `users/${userId}/favorites/${bookId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'favorites', bookId));
  } catch (error) {
    console.error('Error removing favourite:', error);
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchProgress(): Promise<Record<string, ReadingRecord>> {
  const userId = await sessionUserId();
  const path = `users/${userId}/reading_progress`;
  try {
    const q = query(collection(db, 'users', userId, 'reading_progress'), limit(200));
    const snapshot = await getDocs(q);
    const out: Record<string, ReadingRecord> = {};
    for (const d of snapshot.docs) {
      const row = d.data();
      const lastReadAt = (row["lastReadAt"] as string) ?? null;
      out[d.id] = {
        bookId: d.id,
        page: (row["page"] as number) ?? 0,
        totalPages: (row["totalPages"] as number) ?? 1,
        updatedAt: lastReadAt ? new Date(lastReadAt).getTime() : Date.now(),
      };
    }
    return out;
  } catch (error) {
    console.error('Error loading reading progress:', error);
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function upsertProgress(bookId: string, page: number, totalPages: number) {
  const userId = await sessionUserId();
  const safeTotal = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(0, page), safeTotal - 1);
  const now = new Date().toISOString();
  const path = `users/${userId}/reading_progress/${bookId}`;

  try {
    await setDoc(doc(db, 'users', userId, 'reading_progress', bookId), {
      userId,
      bookId,
      page: safePage,
      totalPages: safeTotal,
      progressPercentage: Math.min(100, Math.round(((safePage + 1) / safeTotal) * 100)),
      completed: safePage >= safeTotal - 1,
      lastReadAt: now,
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchBookmarks(bookId?: string): Promise<Bookmark[]> {
  const userId = await sessionUserId();
  const path = `users/${userId}/bookmarks`;
  try {
    let q = query(collection(db, 'users', userId, 'bookmarks'), limit(500));
    if (bookId) {
      q = query(collection(db, 'users', userId, 'bookmarks'), where('bookId', '==', bookId), limit(500));
    }
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((d) => {
      const data = d.data();
      const createdAt = (data["createdAt"] as string) ?? null;
      return {
        id: d.id,
        bookId: data["bookId"] as string,
        page: data["page"] as number,
        note: (data["note"] as string) ?? null,
        createdAt: createdAt ? new Date(createdAt).getTime() : Date.now(),
      };
    });
    return list.sort((a, b) => a.page - b.page);
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function addBookmark(bookId: string, page: number, note?: string) {
  const userId = await sessionUserId();
  const bookmarkId = `${bookId}_${page}`;
  const path = `users/${userId}/bookmarks/${bookmarkId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'bookmarks', bookmarkId), {
      id: bookmarkId,
      userId,
      bookId,
      page,
      note: note?.trim() ? note.trim().slice(0, 500) : null,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving bookmark:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeBookmark(bookId: string, page: number) {
  const userId = await sessionUserId();
  const bookmarkId = `${bookId}_${page}`;
  const path = `users/${userId}/bookmarks/${bookmarkId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'bookmarks', bookmarkId));
  } catch (error) {
    console.error('Error removing bookmark:', error);
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function friendlyMessage(error: unknown, fallback: string) {
  return error instanceof LibraryError ? error.message : fallback;
}
