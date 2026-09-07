import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { getBook } from "@/data/books";

export const Route = createFileRoute("/books/$bookId")({
  loader: ({ params }) => {
    const book = getBook(params.bookId);
    if (!book) throw notFound();
    return { book };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Volume unavailable — JoshBooks" }, { name: "robots", content: "noindex" }],
      };
    }
    const { book } = loaderData;
    const title = `${book.title} by ${book.author} — JoshBooks`;
    return {
      meta: [
        { title },
        { name: "description", content: book.shortDescription },
        { property: "og:title", content: title },
        { property: "og:description", content: book.shortDescription },
      ],
    };
  },
  component: BookDetails,
});

function BookDetails() {
  const { book } = Route.useLoaderData();

  const facts = [
    ["Author", book.author],
    ["Category", book.category],
    ["First published", book.year],
    ["Publisher", book.publisher],
    ["Length", book.pagesLabel],
    ["Language", book.language],
    ["Rights", "Public domain"],
  ] as const;

  return (
    <SiteLayout>
      <main className="mx-auto max-w-[420px] px-5 pb-16 md:max-w-5xl">
        <div className="pt-6">
          <Link
            to="/books"
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-parchment/50 hover:text-parchment"
          >
            ← Back to Books
          </Link>
        </div>

        <section className="animate-rise grid gap-6 pt-6 md:grid-cols-[300px_minmax(0,1fr)] md:gap-10">
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            width={512}
            height={768}
            className="aspect-[2/3] w-48 rounded-xl object-cover outline-1 -outline-offset-1 outline-black/5 md:w-full"
          />

          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sand/70">
              {book.category} · {book.year}
            </p>
            <h1 className="mt-2 text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-parchment md:text-5xl">
              {book.title}
            </h1>
            <p className="mt-2 font-sans text-sm text-parchment/60">{book.author}</p>
            <p className="mt-4 max-w-[60ch] text-pretty font-sans text-[15px] leading-relaxed text-parchment/75">
              {book.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/read/$bookId"
                params={{ bookId: book.id }}
                className="group inline-flex items-center gap-2 rounded-full bg-oxblood px-6 py-3.5 font-sans text-sm font-semibold text-parchment transition-colors hover:bg-oxblood/90"
              >
                Read Book
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <Link
                to="/books"
                className="rounded-full border border-parchment/20 px-5 py-3.5 font-sans text-sm font-medium text-parchment/80 transition-colors hover:border-parchment/40"
              >
                Back to Books
              </Link>
            </div>
          </div>
        </section>

        <section className="animate-rise mt-8 rounded-2xl border border-parchment/10 bg-glass/25 p-6 backdrop-blur-md [animation-delay:80ms]">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">
            (b) publication
          </p>
          <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {facts.map(([label, value]) => (
              <div key={label} className="min-w-0 border-b border-parchment/10 pb-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/40">
                  {label}
                </dt>
                <dd className="mt-1 font-sans text-sm text-parchment/80">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </SiteLayout>
  );
}
