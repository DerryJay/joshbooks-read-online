/**
 * Local browser storage helper for large book files (PDFs) that exceed Firestore's 1MB document limit.
 */
export async function storeLocalPdf(bookId: string, file: Blob): Promise<void> {
  if (typeof window === "undefined") return;
  return new Promise((resolve) => {
    const req = indexedDB.open("joshbooks_files", 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains("files")) {
        req.result.createObjectStore("files");
      }
    };
    req.onsuccess = () => {
      try {
        const db = req.result;
        const tx = db.transaction("files", "readwrite");
        const store = tx.objectStore("files");
        store.put(file, `pdf_${bookId}`);
        // Also save under simplified slug prefix if applicable
        const baseSlug = bookId.split("-").slice(0, -1).join("-");
        if (baseSlug) {
          store.put(file, `pdf_slug_${baseSlug}`);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    };
    req.onerror = () => resolve();
  });
}

export async function getLocalPdfBlob(bookId: string): Promise<Blob | null> {
  if (typeof window === "undefined") return null;
  return new Promise((resolve) => {
    const req = indexedDB.open("joshbooks_files", 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains("files")) {
        req.result.createObjectStore("files");
      }
    };
    req.onsuccess = () => {
      try {
        const db = req.result;
        const tx = db.transaction("files", "readonly");
        const store = tx.objectStore("files");
        const getReq = store.get(`pdf_${bookId}`);
        getReq.onsuccess = () => {
          if (getReq.result instanceof Blob) {
            resolve(getReq.result);
            return;
          }
          // Try fallback by base slug or any matching key
          const baseSlug = bookId.split("-").slice(0, -1).join("-");
          if (baseSlug) {
            const fallbackReq = store.get(`pdf_slug_${baseSlug}`);
            fallbackReq.onsuccess = () => {
              if (fallbackReq.result instanceof Blob) {
                resolve(fallbackReq.result);
                return;
              }
              // Try scanning keys
              const cursorReq = store.openCursor();
              cursorReq.onsuccess = (e) => {
                const cursor = (e.target as IDBRequest<IDBCursorWithValue | null>).result;
                if (!cursor) {
                  resolve(null);
                  return;
                }
                const key = String(cursor.key);
                if (key.includes(baseSlug) && cursor.value instanceof Blob) {
                  resolve(cursor.value);
                  return;
                }
                cursor.continue();
              };
              cursorReq.onerror = () => resolve(null);
            };
            fallbackReq.onerror = () => resolve(null);
            return;
          }
          resolve(null);
        };
        getReq.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    };
    req.onerror = () => resolve(null);
  });
}

export async function getLocalPdf(bookId: string): Promise<string | null> {
  const blob = await getLocalPdfBlob(bookId);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return null;
}
