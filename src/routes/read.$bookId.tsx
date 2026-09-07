import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Atmosphere } from "@/components/Atmosphere";
import { getBook } from "@/data/books";

export const Route = createFileRoute("/read/$bookId")({
  loader: ({ params }) => {
    const book = getBook(params.bookId);
    if (!book) throw notFound();
    return { book };
  },
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
        { name: "description", content: `Read an excerpt of ${book.title} by ${book.author}.` },
        { property: "og:title", content: title },
        { property: "og:description", content: book.shortDescription },
      ],
    };
  },
  component: Reader,
});

const ZOOM_STEPS = [0.85, 1, 1.15, 1.35, 1.6];

function Reader() {
  const { book } = Route.useLoaderData();
  const [page, setPage] = useState(0);
  const [zoomIndex, setZoomIndex] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const total = book.pages.length;
  const zoom = ZOOM_STEPS[zoomIndex] ?? 1;

  const goTo = useCallback(
    (next: number) => {
      setPage(Math.min(Math.max(next, 0), total - 1));
      pageRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [total],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goTo(page + 1);
      if (event.key === "ArrowLeft") goTo(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, page]);

  useEffect(() => {
    const onChange = () => setIsFullScreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullScreen = () => {
    if (typeof document === "undefined" || !document.fullscreenEnabled) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void shellRef.current?.requestFullscreen();
    }
  };

  return (
    <div
      ref={shellRef}
      className="relative flex min-h-screen flex-col bg-water-deep font-sans text-parchment"
    >
      <Atmosphere />

      <header className="relative z-20 border-b border-parchment/10 bg-water-deep/70 backdrop-blur-md">
        <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">
              JoshBooks reader
            </p>
            <h1 className="truncate font-serif text-xl font-semibold tracking-tight text-parchment">
              {book.title}
            </h1>
          </div>
          <Link
            to="/books/$bookId"
            params={{ bookId: book.id }}
            className="shrink-0 rounded-full border border-parchment/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/75 transition-colors hover:border-parchment/40"
          >
            ← Back to Book
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-5 py-6">
        <div
          ref={pageRef}
          className="max-h-[70vh] overflow-y-auto rounded-2xl border border-parchment/10 bg-parchment px-6 py-8 text-ink shadow-2xl sm:px-10 sm:py-12"
        >
          <div
            style={{ fontSize: `${zoom}rem`, lineHeight: 1.75 }}
            className="mx-auto max-w-[62ch] font-serif"
          >
            {(book.pages[page] ?? []).map((paragraph, index) => (
              <p key={index} className={index === 0 ? "" : "mt-5"}>
                {paragraph}
              </p>
            ))}
            <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
              {book.title} · demo excerpt · page {page + 1}
            </p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-parchment/10 bg-water-deep/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(page - 1)}
              disabled={page === 0}
              className="rounded-full border border-parchment/20 px-4 py-2 font-sans text-xs font-medium text-parchment/85 transition-colors hover:border-parchment/40 disabled:opacity-35"
            >
              ← Prev
            </button>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-parchment/60">
              Page {page + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => goTo(page + 1)}
              disabled={page === total - 1}
              className="rounded-full bg-oxblood px-4 py-2 font-sans text-xs font-semibold text-parchment transition-colors hover:bg-oxblood/90 disabled:opacity-35"
            >
              Next →
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
              disabled={zoomIndex === 0}
              aria-label="Zoom out"
              className="size-9 rounded-full border border-parchment/20 font-sans text-sm text-parchment/85 transition-colors hover:border-parchment/40 disabled:opacity-35"
            >
              −
            </button>
            <span className="w-12 text-center font-mono text-[11px] text-parchment/60">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
              disabled={zoomIndex === ZOOM_STEPS.length - 1}
              aria-label="Zoom in"
              className="size-9 rounded-full border border-parchment/20 font-sans text-sm text-parchment/85 transition-colors hover:border-parchment/40 disabled:opacity-35"
            >
              +
            </button>
            <button
              type="button"
              onClick={toggleFullScreen}
              className="rounded-full border border-parchment/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/75 transition-colors hover:border-parchment/40"
            >
              {isFullScreen ? "Exit full screen" : "Full screen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
