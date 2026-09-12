import type { ReactNode } from "react";
import { SiteLayout } from "@/components/SiteLayout";

export const authField =
  "w-full rounded-xl border border-parchment/15 bg-glass/30 px-4 py-3 font-sans text-sm text-parchment placeholder:text-parchment/40 outline-none backdrop-blur-sm focus:border-sand/50";

export const authLabel =
  "block font-mono text-[10px] uppercase tracking-[0.16em] text-parchment/50";

export const authPrimary =
  "w-full rounded-full bg-oxblood px-6 py-3.5 font-sans text-sm font-semibold text-parchment transition-colors hover:bg-oxblood/90 disabled:opacity-50";

export function FieldError({ children }: { children?: string | null }) {
  if (!children) return null;
  return <p className="mt-1.5 font-sans text-xs text-alert">{children}</p>;
}

/** Shared frame for the sign-in, sign-up and password pages. */
export function AuthShell({
  eyebrow,
  title,
  intro,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <SiteLayout>
      <main className="mx-auto w-full max-w-[420px] px-5 pb-16 pt-10 md:max-w-md">
        <section className="animate-rise rounded-2xl border border-parchment/10 bg-glass/25 p-6 backdrop-blur-md">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight tracking-tight text-parchment">
            {title}
          </h1>
          <p className="mt-2 font-sans text-sm leading-relaxed text-parchment/65">{intro}</p>
          <div className="mt-6">{children}</div>
        </section>
        {footer ? <div className="mt-5 text-center">{footer}</div> : null}
      </main>
    </SiteLayout>
  );
}
