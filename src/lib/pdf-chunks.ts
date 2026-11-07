import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

// ~450 KB binary per chunk to ensure base64 string stays well under 1MB Firestore limit
const CHUNK_SIZE = 450 * 1024;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    const b = bytes[i];
    if (b !== undefined) {
      binary += String.fromCharCode(b);
    }
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Admin uploads a PDF document directly into Firestore chunked storage.
 * All readers everywhere can then read it without having to attach anything.
 */
export async function uploadPdfToFirestore(
  bookId: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const totalBytes = arrayBuffer.byteLength;
  const totalChunks = Math.ceil(totalBytes / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalBytes);
    const chunkBuffer = arrayBuffer.slice(start, end);
    const base64Data = arrayBufferToBase64(chunkBuffer);

    const chunkDocRef = doc(db, "books", bookId, "pdf_chunks", String(i).padStart(4, "0"));
    await setDoc(chunkDocRef, {
      index: i,
      totalChunks,
      data: base64Data,
      updatedAt: Date.now(),
    });

    if (onProgress) {
      const pct = Math.round(((i + 1) / totalChunks) * 100);
      onProgress(pct);
    }
  }

  return totalChunks;
}

/**
 * Automatically fetch and reconstruct the PDF from Firestore for any reader.
 */
export async function fetchPdfFromFirestore(
  bookId: string,
  onProgress?: (pct: number) => void,
): Promise<Blob | null> {
  try {
    const chunksCol = collection(db, "books", bookId, "pdf_chunks");
    const snapshot = await getDocs(chunksCol);
    if (snapshot.empty) return null;

    const docs = snapshot.docs.map((d) => d.data() as { index: number; totalChunks: number; data: string });
    docs.sort((a, b) => a.index - b.index);

    const arrays: Uint8Array[] = [];
    let totalLength = 0;

    for (let i = 0; i < docs.length; i++) {
      const docItem = docs[i];
      if (!docItem) continue;
      const bytes = base64ToUint8Array(docItem.data);
      arrays.push(bytes);
      totalLength += bytes.length;
      if (onProgress) {
        onProgress(Math.round(((i + 1) / docs.length) * 100));
      }
    }

    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      merged.set(arr, offset);
      offset += arr.length;
    }

    return new Blob([merged], { type: "application/pdf" });
  } catch (err) {
    console.warn("Could not fetch PDF chunks from Firestore:", err);
    return null;
  }
}
