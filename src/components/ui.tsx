import type { ReactNode } from "react";
import { formatPrice } from "@/lib/format";

export function SectionHeading({
  eyebrow,
  title,
  children,
  align = "left",
  action,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-4 ${align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-[clamp(1.9rem,4vw,3rem)] leading-[1.08]">{title}</h2>
        {children && <div className="mt-4 text-base leading-relaxed text-stone md:text-lg">{children}</div>}
      </div>
      {action}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  children,
  image,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  image?: ReactNode;
}) {
  return (
    <section className="border-b border-line bg-sand/60">
      <div className="container-fd grid items-center gap-8 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-20">
        <div className="animate-fade-up">
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h1 className="text-[clamp(2.2rem,5.5vw,4.25rem)] leading-[1.02]">{title}</h1>
          {children && <div className="mt-5 max-w-xl text-base leading-relaxed text-stone md:text-lg">{children}</div>}
        </div>
        {image}
      </div>
    </section>
  );
}

export function Price({
  cents,
  compareAtCents,
  size = "base",
}: {
  cents: number;
  compareAtCents?: number | null;
  size?: "sm" | "base" | "lg";
}) {
  const sizeClass = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";
  const onSale = compareAtCents && compareAtCents > cents;
  return (
    <p className={`flex flex-wrap items-baseline gap-2 font-medium ${sizeClass}`}>
      <span className={onSale ? "text-rose" : ""}>{formatPrice(cents)}</span>
      {onSale && <s className="text-sm text-stone">{formatPrice(compareAtCents!)}</s>}
    </p>
  );
}

export function Stars({ rating, label }: { rating: number; label?: string }) {
  const pct = Math.max(0, Math.min(5, rating)) / 5 * 100;
  return (
    <span className="relative inline-block align-middle text-[0.95rem] leading-none tracking-[0.12em]" role="img" aria-label={label ?? `${rating} out of 5 stars`}>
      <span className="text-line" aria-hidden="true">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden whitespace-nowrap text-gold" style={{ width: `${pct}%` }} aria-hidden="true">★★★★★</span>
    </span>
  );
}

export function Accordion({ items }: { items: { title: string; body: ReactNode; defaultOpen?: boolean }[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.title} open={item.defaultOpen} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[0.95rem] font-semibold">
            {item.title}
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line transition group-open:rotate-45" aria-hidden="true">
              +
            </span>
          </summary>
          <div className="pb-5 text-[0.95rem] leading-relaxed text-stone">{item.body}</div>
        </details>
      ))}
    </div>
  );
}

export function ProseSection({ children }: { children: ReactNode }) {
  return <div className="prose-fd max-w-3xl space-y-5 text-[1.02rem] leading-[1.75] text-ink-soft [&_h2]:mt-10 [&_h2]:text-2xl [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_a]:text-rose [&_a]:underline [&_a]:underline-offset-4">{children}</div>;
}
