import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface PdfPageViewProps {
  pdf: PDFDocumentProxy;
  pageNumber: number; // 1-based
  zoom?: number;
  dark?: boolean;
  onLoaded?: () => void;
}

export function PdfPageView({
  pdf,
  pageNumber,
  zoom = 1,
  dark = false,
  onLoaded,
}: PdfPageViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let renderTask: any = null;

    async function renderPage() {
      if (!canvasRef.current || !pdf) return;
      setLoading(true);
      setError(null);

      try {
        const page = await pdf.getPage(pageNumber);
        if (!active) return;

        // Base unscaled viewport
        const baseViewport = page.getViewport({ scale: 1 });
        
        // Target width based on viewport and container
        const containerWidth = Math.min(window.innerWidth - 48, 760);
        const baseScale = containerWidth / baseViewport.width;
        const finalScale = baseScale * zoom;

        const viewport = page.getViewport({ scale: finalScale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas,
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;

        if (active) {
          setLoading(false);
          onLoaded?.();
        }
      } catch (err: any) {
        if (err?.name === "RenderingCancelledException") {
          return;
        }
        if (active) {
          console.error("PDF render error:", err);
          setError("Failed to render page.");
          setLoading(false);
        }
      }
    }

    void renderPage();

    return () => {
      active = false;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {}
      }
    };
  }, [pdf, pageNumber, zoom, onLoaded]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[300px]">
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-parchment/60 backdrop-blur-xs">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-ink/70">
            <span className="size-2 animate-ping rounded-full bg-oxblood" />
            Rendering page {pageNumber}…
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="p-6 text-center font-sans text-sm text-oxblood">
          <p>{error}</p>
          <p className="mt-1 text-xs opacity-75">Page {pageNumber} of {pdf.numPages}</p>
        </div>
      ) : null}

      <canvas
        ref={canvasRef}
        className={`mx-auto rounded-lg shadow-md transition-[filter] duration-300 ${
          dark ? "invert-[0.88] hue-rotate-180 contrast-110" : ""
        }`}
      />
    </div>
  );
}
