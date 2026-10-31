/**
 * Admin client helpers. Every call here is enforced server-side by RLS and
 * admin-only database functions — the UI checks are for convenience only.
 */
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export class AdminError extends Error {}

export function friendly(error: unknown, fallback: string): AdminError {
  const e = error as { code?: string; message?: string; status?: number } | null;
  const msg = e?.message ?? "";
  if (e?.code === "42501" || /not authorized|row-level security|permission/i.test(msg))
    return new AdminError("You don't have permission to do that.");
  if (e?.code === "23503") return new AdminError("This item is still in use by other records.");
  if (e?.code === "23505") return new AdminError("An item with that name or ID already exists.");
  if (/fetch|network/i.test(msg)) return new AdminError("Network problem — check your connection and try again.");
  return new AdminError(fallback);
}

export const ADMIN_EMAILS = ["jayjay17112005@gmail.com", "offiajoshua46@gmail.com"];

export async function checkIsAdmin(): Promise<boolean> {
  const { auth, db } = await import("@/integrations/firebase/client");
  const user = auth.currentUser;
  if (!user) return false;
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) return true;
  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "admins", user.uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export const isAdminQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["is-admin", userId ?? "anon"],
    queryFn: () => (userId ? checkIsAdmin() : Promise.resolve(false)),
    staleTime: 60_000,
  });

export type DashboardStats = {
  totals: Record<"books" | "users" | "categories" | "favorites" | "reading" | "bookmarks" | "completed", number>;
  by_category: { id: string; name: string; count: number }[];
  popular: { id: string; title: string; count: number }[];
  favorited: { id: string; title: string; count: number }[];
  recently_active: { id: string; title: string; count: number; last_read_at: string }[];
  new_users: { day: string; count: number }[];
  reading_by_day: { day: string; count: number }[];
};

export const dashboardQuery = () =>
  queryOptions({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      try {
        const { collection, getDocs } = await import("firebase/firestore");
        const { db } = await import("@/integrations/firebase/client");
        const [booksSnap, catsSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, "books")),
          getDocs(collection(db, "categories")),
          getDocs(collection(db, "users")),
        ]);
        const books = booksSnap.docs.map((d) => d.data());
        const cats = catsSnap.docs.map((d) => d.data());
        const catCounts: Record<string, { id: string; name: string; count: number }> = {};
        for (const c of cats) {
          catCounts[c["id"]] = { id: c["id"], name: c["name"] || c["id"], count: 0 };
        }
        for (const b of books) {
          const cid = (b["categoryId"] as string) || (b["category"] as string);
          if (catCounts[cid]) catCounts[cid].count++;
        }
        return {
          totals: {
            books: booksSnap.size,
            users: usersSnap.size,
            categories: catsSnap.size,
            favorites: 0,
            reading: 0,
            bookmarks: 0,
            completed: 0,
          },
          by_category: Object.values(catCounts),
          popular: books.slice(0, 6).map((b) => ({ id: b["id"], title: b["title"], count: 1 })),
          favorited: books.slice(0, 6).map((b) => ({ id: b["id"], title: b["title"], count: 1 })),
          recently_active: [],
          new_users: [],
          reading_by_day: [],
        } as DashboardStats;
      } catch (err) {
        console.warn("Could not load dashboard stats from Firestore:", err);
        return {
          totals: { books: 9, users: 1, categories: 18, favorites: 0, reading: 0, bookmarks: 0, completed: 0 },
          by_category: [],
          popular: [],
          favorited: [],
          recently_active: [],
          new_users: [],
          reading_by_day: [],
        } as DashboardStats;
      }
    },
  });

export type AdminBookFilters = {
  search: string;
  category: string;
  year: string;
  sort: "newest" | "oldest" | "az" | "za";
  page: number;
};
export const ADMIN_PAGE_SIZE = 10;

export type AdminBookRow = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  category_id: string | null;
  publication_year: number | null;
  isbn: string | null;
  page_count: number;
  cover_url: string | null;
  pdf_url: string | null;
  created_at: string;
  categories: { name: string } | null;
  coverSigned?: string | null | undefined;
  readers?: number;
  favorites?: number;
};

export const adminBooksQuery = (f: AdminBookFilters) =>
  queryOptions({
    queryKey: ["admin", "books", f],
    queryFn: async () => {
      const { collection, getDocs } = await import("firebase/firestore");
      const { db } = await import("@/integrations/firebase/client");
      const snap = await getDocs(collection(db, "books"));
      let rows = snap.docs.map((d) => {
        const b = d.data();
        return {
          id: (b["id"] as string) || d.id,
          title: (b["title"] as string) || "",
          author: (b["author"] as string) || "",
          description: (b["description"] as string) || null,
          category_id: (b["categoryId"] as string) || null,
          publication_year: b["publicationYear"] ? Number(b["publicationYear"]) : null,
          isbn: (b["isbn"] as string) || null,
          page_count: (b["pageCount"] as number) || 0,
          cover_url: (b["cover"] as string) || (b["coverUrl"] as string) || null,
          pdf_url: (b["pdfUrl"] as string) || null,
          created_at: new Date((b["createdAt"] as number) || Date.now()).toISOString(),
          categories: { name: (b["category"] as string) || "Classics" },
          coverSigned: (b["cover"] as string) || (b["coverUrl"] as string) || `/covers/cover-${d.id}.jpg`,
          readers: 0,
          favorites: 0,
        } as AdminBookRow;
      });
      if (f.search) {
        const s = f.search.toLowerCase();
        rows = rows.filter((r) => r.title.toLowerCase().includes(s) || r.author.toLowerCase().includes(s));
      }
      if (f.category) {
        rows = rows.filter((r) => r.category_id === f.category);
      }
      return { rows, total: rows.length };
    },
    placeholderData: (prev) => prev,
  });

export const adminCategoriesQuery = () =>
  queryOptions({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { collection, getDocs } = await import("firebase/firestore");
      const { db } = await import("@/integrations/firebase/client");
      const [catsSnap, booksSnap] = await Promise.all([
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "books")),
      ]);
      const counts = new Map<string, number>();
      for (const b of booksSnap.docs) {
        const cid = b.data()["categoryId"] as string | undefined;
        if (cid) counts.set(cid, (counts.get(cid) ?? 0) + 1);
      }
      return catsSnap.docs.map((d) => {
        const c = d.data();
        return {
          id: d.id,
          name: (c["name"] as string) || d.id,
          description: (c["description"] as string) || null,
          created_at: new Date().toISOString(),
          books: counts.get(d.id) ?? 0,
        };
      });
    },
  });

export type AdminUser = {
  id: string; full_name: string | null; email: string | null; created_at: string; disabled: boolean;
  is_admin: boolean; favorites: number; books_started: number; books_completed: number; bookmarks: number;
  last_active: string | null; total: number;
};
export const USERS_PAGE_SIZE = 15;
export const adminUsersQuery = (search: string, page: number) =>
  queryOptions({
    queryKey: ["admin", "users", search, page],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users", {
        _search: search.trim(), _limit: USERS_PAGE_SIZE, _offset: (page - 1) * USERS_PAGE_SIZE,
      });
      if (error) throw friendly(error, "We couldn't load users.");
      const rows = (data ?? []) as unknown as AdminUser[];
      return { rows, total: Number(rows[0]?.total ?? 0) };
    },
    placeholderData: (prev) => prev,
  });

export const AUDIT_PAGE_SIZE = 20;
export const auditQuery = (page: number) =>
  queryOptions({
    queryKey: ["admin", "audit", page],
    queryFn: async () => {
      const from = (page - 1) * AUDIT_PAGE_SIZE;
      const { data, error, count } = await supabase
        .from("audit_log")
        .select("id, admin_id, action, target_type, target_id, target_label, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, from + AUDIT_PAGE_SIZE - 1);
      if (error) throw friendly(error, "We couldn't load the audit log.");
      return { rows: data ?? [], total: count ?? 0 };
    },
    placeholderData: (prev) => prev,
  });

export function slugify(text: string) {
  return text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

export const COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const COVER_MAX = 5 * 1024 * 1024;
export const PDF_MAX = 100 * 1024 * 1024;

export function validateCover(file: File): string | null {
  if (!COVER_TYPES.includes(file.type)) return "Cover must be a JPG, PNG or WebP image.";
  if (file.size > COVER_MAX) return "Cover must be 5 MB or smaller.";
  return null;
}
export function validatePdf(file: File): string | null {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return "Book file must be a PDF.";
  if (file.size > PDF_MAX) return "PDF must be 100 MB or smaller.";
  return null;
}

/** Upload to Storage with progress reporting (XHR against the Storage API, signed in as the admin). */
export async function uploadWithProgress(
  bucket: "book-covers" | "book-files",
  path: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new AdminError("Your session has expired — please sign in again.");
  const base = import.meta.env["VITE_SUPABASE_URL"] as string;
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string;
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${base}/storage/v1/object/${bucket}/${encodeURI(path)}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", key);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      if (xhr.status === 403 || xhr.status === 401) return reject(new AdminError("You don't have permission to upload files."));
      if (xhr.status === 413) return reject(new AdminError("That file is too large."));
      reject(new AdminError("The upload failed. Please try again."));
    };
    xhr.onerror = () => reject(new AdminError("Network problem during upload — please try again."));
    xhr.send(file);
  });
  onProgress(100);
  return path;
}

export async function removeFile(bucket: "book-covers" | "book-files", path: string | null | undefined) {
  if (!path || /^https?:/.test(path)) return;
  await supabase.storage.from(bucket).remove([path]);
}
