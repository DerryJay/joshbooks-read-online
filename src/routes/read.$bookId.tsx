import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { bookQuery } from "@/lib/catalogue";
import { useSavedProgress } from "@/hooks/useReadingProgress";
import { useBookmarks } from "@/hooks/useBookmarks";
import { z } from "zod";
import {
  progressPercent,
  readReaderTheme,
  saveReaderTheme,
  type ReaderTheme,
} from "@/lib/reading-progress";
import { getLocalPdfBlob, storeLocalPdf } from "@/lib/file-storage";
import { fetchPdfFromFirestore } from "@/lib/pdf-chunks";
import { PdfPageView } from "@/components/PdfPageView";

// Configure PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export const Route = createFileRoute("/read/$bookId")({
  validateSearch: (search) =>
    z.object({ page: z.coerce.number().int().min(1).optional().catch(undefined) }).parse(search),
  loader: async ({ params, context }) => {
    const book = await context.queryClient.ensureQueryData(bookQuery(params.bookId));
    if (!book) throw notFound();
    return { book };
  },
  errorComponent: ({ reset }) => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-water-deep px-6 text-center text-parchment">
      <h1 className="font-serif text-3xl font-semibold">We couldn't load this book.</h1>
      <p className="font-sans text-sm text-parchment/65">Please check your connection and try again.</p>
      <div className="flex gap-3">
        <button type="button" onClick={reset} className="rounded-full bg-oxblood px-5 py-3 font-sans text-sm font-semibold">Try again</button>
        <Link to="/books" className="rounded-full border border-parchment/25 px-5 py-3 font-sans text-sm">Back to Books</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-water-deep px-6 text-center text-parchment">
      <h1 className="font-serif text-3xl font-semibold">This book isn't on the shelf.</h1>
      <Link to="/books" className="rounded-full bg-oxblood px-5 py-3 font-sans text-sm font-semibold">Browse all books</Link>
    </div>
  ),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Reader unavailable — JoshBooks" }, { name: "robots", content: "noindex" }],
      };
    }
    const { book } = loaderData;
    const title = `Reading ${book.title} — JoshBooks`;
    return {
      meta: [
        { title },
        { name: "description", content: `Read ${book.title} by ${book.author} in the JoshBooks reader.` },
        { property: "og:title", content: title },
        { property: "og:description", content: book.shortDescription },
      ],
    };
  },
  component: Reader,
});

const ZOOM_STEPS = [0.85, 1, 1.15, 1.35, 1.6];
const DEFAULT_ZOOM = 1;

function Reader() {
  const { book } = Route.useLoaderData();
  const { record, ready, save } = useSavedProgress(book.id);

  const [page, setPage] = useState(0);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [theme, setTheme] = useState<ReaderTheme>("light");
  const [showInfo, setShowInfo] = useState(false);
  const [showResume, setShowResume] = useState(false);

  // PDF Document State
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<number | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const shellRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // Automatically load the book's full PDF (from local cache, remote URL, or Firestore chunks uploaded by admin)
  useEffect(() => {
    let active = true;

    async function loadPdf() {
      setPdfLoading(true);
      setPdfError(null);
      setPdfProgress(null);

      try {
        // 1. Try local cache in browser IndexedDB
        const localBlob = await getLocalPdfBlob(book.id);
        if (localBlob && active) {
          const buffer = await localBlob.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
          const doc = await loadingTask.promise;
          if (active) {
            setPdfDoc(doc);
            setPdfLoading(false);
            return;
          }
        }

        // 2. Try online documentUrl if configured by admin
        if (book.documentUrl && active) {
          const loadingTask = pdfjsLib.getDocument({ url: book.documentUrl });
          const doc = await loadingTask.promise;
          if (active) {
            setPdfDoc(doc);
            setPdfLoading(false);
            return;
          }
        }

        // 3. Automatically download PDF chunks from Firestore (stored by admin)
        const firestoreBlob = await fetchPdfFromFirestore(book.id, (p) => {
          if (active) setPdfProgress(p);
        });

        if (firestoreBlob && active) {
          // Cache in local IndexedDB so all future reads in this browser are instant
          await storeLocalPdf(book.id, firestoreBlob);
          const buffer = await firestoreBlob.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
          const doc = await loadingTask.promise;
          if (active) {
            setPdfDoc(doc);
            setPdfLoading(false);
            return;
          }
        }

        if (active) {
          setPdfLoading(false);
        }
      } catch (err: any) {
        if (active) {
          console.warn("Could not load PDF document:", err);
          setPdfError(err?.message || "Failed to load document.");
          setPdfLoading(false);
        }
      }
    }

    void loadPdf();

    return () => {
      active = false;
    };
  }, [book.id, book.documentUrl]);

  // Compute total pages:
  // If PDF loaded, use pdfDoc.numPages (e.g. 1020 pages!).
  // Otherwise use book.pageCount or text pages length.
  const total = pdfDoc
    ? pdfDoc.numPages
    : book.pageCount || (book.pages.length ? book.pages.length : 1);

  const zoom = ZOOM_STEPS[zoomIndex] ?? 1;
  const percent = progressPercent(page, total);
  const dark = theme === "dark";

  useEffect(() => {
    setTheme(readReaderTheme());
  }, []);

  // Offer to resume where the visitor left off
  const { page: requestedPage } = Route.useSearch();
  const { has: isBookmarked, add: addBookmark, remove: removeBookmark } = useBookmarks(book.id);
  const bookmarked = isBookmarked(page);

  useEffect(() => {
    if (!ready) return;
    if (requestedPage) {
      const target = Math.min(requestedPage - 1, total - 1);
      setPage(target);
      save(target, total);
      return;
    }
    if (record && record.page > 0 && record.page < total) {
      setShowResume(true);
    } else {
      save(record?.page ?? 0, total);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, total]);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), total - 1);
      setPage(clamped);
      save(clamped, total);
      pageRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [total, save],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goTo(page + 1);
      if (event.key === "ArrowLeft") goTo(page - 1);
      if (event.key === "Escape") {
        setShowInfo(false);
        if (document.fullscreenElement) {
          void document.exitFullscreen();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, page]);

  useEffect(() => {
    const onChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const toggleFullScreen = () => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      // Fullscreen the reading page surface
      const targetEl = pageRef.current || shellRef.current;
      if (targetEl?.requestFullscreen) {
        void targetEl.requestFullscreen();
      } else if ((targetEl as any)?.webkitRequestFullscreen) {
        void (targetEl as any).webkitRequestFullscreen();
      }
    }
  };

  const toggleTheme = () => {
    const next: ReaderTheme = dark ? "light" : "dark";
    setTheme(next);
    saveReaderTheme(next);
  };

  const ctrl =
    "rounded-full border border-parchment/20 px-4 py-2.5 font-sans text-xs font-medium text-parchment/85 transition-colors hover:border-parchment/45 active:scale-[0.98] disabled:opacity-35";
  const iconCtrl =
    "size-10 rounded-full border border-parchment/20 font-sans text-base text-parchment/85 transition-colors hover:border-parchment/45 active:scale-[0.98] disabled:opacity-35";

  return (
    <div
      ref={shellRef}
      className="relative flex min-h-screen flex-col bg-water-deep font-sans text-parchment"
    >
      {/* Reader header chrome */}
      <header className="relative z-20 border-b border-parchment/10 bg-water-deep/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-5">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">
              JoshBooks reader
            </p>
            <h1 className="truncate font-serif text-lg font-semibold tracking-tight text-parchment sm:text-xl">
              {book.title}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowInfo(true)}
            className="shrink-0 rounded-full border border-parchment/20 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/75 transition-colors hover:border-parchment/45"
          >
            Info
          </button>
          <Link
            to="/books/$bookId"
            params={{ bookId: book.id }}
            className="shrink-0 rounded-full border border-parchment/20 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/75 transition-colors hover:border-parchment/45"
          >
            ← Back
          </Link>
        </div>

        <div className="mx-auto max-w-3xl px-4 pb-3 sm:px-5">
          <div className="h-1 w-full overflow-hidden rounded-full bg-parchment/15">
            <div
              className="h-full rounded-full bg-sand transition-[width] duration-500 ease-out"
              style={{ width: `${percent}%` }}
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Reading progress"
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/55">
            <span>Reading progress: {percent}%</span>
            <span>
              Page {page + 1} of {total}
            </span>
          </div>
        </div>
      </header>

      {showResume && record ? (
        <div className="relative z-20 mx-auto mt-4 w-full max-w-3xl px-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-sand/25 bg-glass/40 p-4 backdrop-blur-md">
            <p className="min-w-0 flex-1 font-sans text-sm text-parchment/80">
              You stopped on page {record.page + 1} of {record.totalPages || total}.
            </p>
            <button
              type="button"
              onClick={() => {
                goTo(record.page);
                setShowResume(false);
              }}
              className="rounded-full bg-oxblood px-4 py-2.5 font-sans text-xs font-semibold text-parchment transition-colors hover:bg-oxblood/90"
            >
              Continue Reading
            </button>
            <button
              type="button"
              onClick={() => setShowResume(false)}
              className="rounded-full border border-parchment/20 px-4 py-2.5 font-sans text-xs font-medium text-parchment/75 transition-colors hover:border-parchment/45"
            >
              Start over
            </button>
          </div>
        </div>
      ) : null}

      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-4 py-5 sm:px-5 sm:py-6">
        {/* Main Reading Surface / White Page */}
        <div
          ref={pageRef}
          className={`relative min-h-[60vh] overflow-y-auto rounded-2xl border shadow-2xl transition-colors duration-500 ${
            isFullScreen
              ? "fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-start overflow-y-auto rounded-none p-4 sm:p-8"
              : "max-h-[70vh] px-5 py-8 sm:px-10 sm:py-12"
          } ${
            dark
              ? "border-parchment/10 bg-ink text-parchment/90"
              : "border-parchment/10 bg-parchment text-ink"
          }`}
        >
          {/* Fullscreen Floating Reader HUD */}
          {isFullScreen ? (
            <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-parchment/20 bg-water-deep/95 px-4 py-2.5 text-parchment shadow-2xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => goTo(page - 1)}
                disabled={page === 0}
                className="rounded-full border border-parchment/20 px-3 py-1.5 font-mono text-xs hover:border-parchment/50 disabled:opacity-30"
              >
                ← Prev
              </button>
              <span className="px-2 font-mono text-xs uppercase tracking-wider text-parchment/80">
                {page + 1} / {total}
              </span>
              <button
                type="button"
                onClick={() => goTo(page + 1)}
                disabled={page === total - 1}
                className="rounded-full bg-oxblood px-3.5 py-1.5 font-mono text-xs font-semibold hover:bg-oxblood/90 disabled:opacity-30"
              >
                Next →
              </button>
              <div className="mx-1 h-4 w-px bg-parchment/20" />
              <button
                type="button"
                onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
                disabled={zoomIndex === 0}
                aria-label="Zoom out"
                className="size-7 rounded-full border border-parchment/20 text-xs"
              >
                −
              </button>
              <span className="font-mono text-[10px] text-parchment/60">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
                disabled={zoomIndex === ZOOM_STEPS.length - 1}
                aria-label="Zoom in"
                className="size-7 rounded-full border border-parchment/20 text-xs"
              >
                +
              </button>
              <div className="mx-1 h-4 w-px bg-parchment/20" />
              <button
                type="button"
                onClick={toggleTheme}
                className="size-7 rounded-full border border-parchment/20 text-xs"
                title="Toggle Theme"
              >
                {dark ? "☀" : "☾"}
              </button>
              <button
                type="button"
                onClick={toggleFullScreen}
                className="rounded-full border border-sand/40 bg-sand/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-sand hover:bg-sand/25"
              >
                Exit Full Screen
              </button>
            </div>
          ) : null}

          {/* PDF Page Rendering Mode */}
          {pdfDoc ? (
            <div className="mx-auto w-full max-w-2xl py-2">
              <PdfPageView
                pdf={pdfDoc}
                pageNumber={page + 1}
                zoom={zoom}
                dark={dark}
              />
              <p
                className={`mt-8 text-center font-mono text-[10px] uppercase tracking-[0.2em] ${
                  dark ? "text-parchment/35" : "text-ink/40"
                }`}
              >
                {book.title} · page {page + 1} of {total}
              </p>
            </div>
          ) : pdfLoading ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
              <div className="size-8 animate-spin rounded-full border-2 border-oxblood border-t-transparent" />
              <p className="font-mono text-xs uppercase tracking-widest text-parchment/70">
                Loading complete volume ({total} pages)…
              </p>
              {pdfProgress !== null ? (
                <div className="w-48">
                  <div className="h-1 rounded-full bg-parchment/15 overflow-hidden">
                    <div
                      className="h-full bg-sand transition-[width] duration-200"
                      style={{ width: `${pdfProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-center font-mono text-[10px] text-parchment/40">
                    {pdfProgress}% downloaded
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            /* Text Page Mode */
            <div
              style={{ fontSize: `${zoom}rem`, lineHeight: 1.8 }}
              className="mx-auto max-w-[62ch] font-serif transition-[font-size] duration-300"
            >
              {(book.pages[page] ?? []).map((paragraph, index) => (
                <p key={index} className={index === 0 ? "" : "mt-6"}>
                  {paragraph}
                </p>
              ))}

              {!(book.pages[page] && book.pages[page].length) && (
                <div className="py-12 text-center font-sans text-sm opacity-60">
                  <p>Page {page + 1} of {total}</p>
                </div>
              )}

              <p
                className={`mt-10 text-center font-mono text-[10px] uppercase tracking-[0.2em] ${
                  dark ? "text-parchment/35" : "text-ink/40"
                }`}
              >
                {book.title} · page {page + 1} of {total}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Reader bottom navigation controls */}
      <div className="sticky bottom-0 z-20 border-t border-parchment/10 bg-water-deep/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <button
              type="button"
              onClick={() => goTo(page - 1)}
              disabled={page === 0}
              className={ctrl}
            >
              ← Prev
            </button>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-parchment/60">
              {page + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => goTo(page + 1)}
              disabled={page === total - 1}
              className="rounded-full bg-oxblood px-4 py-2.5 font-sans text-xs font-semibold text-parchment transition-colors hover:bg-oxblood/90 active:scale-[0.98] disabled:opacity-35"
            >
              Next →
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
              disabled={zoomIndex === 0}
              aria-label="Zoom out"
              className={iconCtrl}
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setZoomIndex(DEFAULT_ZOOM)}
              aria-label="Reset zoom"
              className="rounded-full border border-parchment/20 px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-parchment/75 transition-colors hover:border-parchment/45"
            >
              {Math.round(zoom * 100)}% · reset
            </button>
            <button
              type="button"
              onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
              disabled={zoomIndex === ZOOM_STEPS.length - 1}
              aria-label="Zoom in"
              className={iconCtrl}
            >
              +
            </button>
            <button
              type="button"
              onClick={() => void (bookmarked ? removeBookmark(page) : addBookmark(page))}
              aria-pressed={bookmarked}
              aria-label={bookmarked ? "Remove bookmark from this page" : "Bookmark this page"}
              className={`${iconCtrl} ${bookmarked ? "border-sand/60 text-sand" : ""}`}
            >
              {bookmarked ? "★" : "☆"}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle light or dark reading mode"
              className={iconCtrl}
            >
              {dark ? "☀" : "☾"}
            </button>
            <button
              type="button"
              onClick={toggleFullScreen}
              className="rounded-full border border-parchment/20 px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-parchment/75 transition-colors hover:border-parchment/45"
            >
              {isFullScreen ? "Exit full screen" : "Full screen"}
            </button>
          </div>
        </div>
      </div>

      {showInfo ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="animate-rise max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-parchment/15 bg-water-deep p-6 sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sand/70">
                  {book.category} · {book.year}
                </p>
                <h2 className="mt-1 font-serif text-2xl font-semibold leading-tight text-parchment">
                  {book.title}
                </h2>
                <p className="mt-1 font-sans text-sm text-parchment/60">{book.author}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                aria-label="Close book information"
                className={iconCtrl}
              >
                ✕
              </button>
            </div>

            <p className="mt-4 font-sans text-sm leading-relaxed text-parchment/75">
              {book.shortDescription}
            </p>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["Category", book.category],
                  ["Length", book.pagesLabel],
                  ["Pages in reader", `${total}`],
                  ["Language", book.language],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="border-b border-parchment/10 pb-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/40">
                    {label}
                  </dt>
                  <dd className="mt-1 font-sans text-sm text-parchment/80">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/books/$bookId"
                params={{ bookId: book.id }}
                className="inline-flex rounded-full bg-oxblood px-5 py-3 font-sans text-sm font-semibold text-parchment transition-colors hover:bg-oxblood/90"
              >
                Back to Book Details
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
