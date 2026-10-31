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
        tx.objectStore("files").put(file, `pdf_${bookId}`);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    };
    req.onerror = () => resolve();
  });
}

export async function getLocalPdf(bookId: string): Promise<string | null> {
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
        const getReq = tx.objectStore("files").get(`pdf_${bookId}`);
        getReq.onsuccess = () => {
          if (getReq.result instanceof Blob) {
            resolve(URL.createObjectURL(getReq.result));
          } else {
            resolve(null);
          }
        };
        getReq.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    };
    req.onerror = () => resolve(null);
  });
}
