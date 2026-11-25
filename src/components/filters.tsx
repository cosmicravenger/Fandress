"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Modal } from "@/components/client-ui";
import { AUDIENCES } from "@/lib/config";

export type Facets = {
  teams: { slug: string; name: string }[];
  sizes: string[];
  audiences: string[];
  minPrice: number;
  maxPrice: number;
};

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "New arrivals" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "title", label: "Alphabetically, A–Z" },
];

/** URL-driven filter bar. Every filter is a query param, so filtered views are shareable and crawlable. */
export function FilterBar({ facets, total, showAudience = true }: { facets: Facets; total: number; showAudience?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const current = (key: string) => params.get(key) ?? "";
  const activeCount = ["team", "size", "audience", "avail", "min", "max"].filter((k) => params.get(k)).length;

  function update(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === "") sp.delete(k);
      else sp.set(k, v);
    });
    sp.delete("page");
    const qs = sp.toString();
    startTransition(() => router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false }));
  }

  const chip = (active: boolean) =>
    `h-10 rounded-full border px-4 text-sm font-medium transition ${active ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`;

  const controls = (
    <div className="space-y-8">
      {showAudience && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Product type</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={chip(!current("audience"))} aria-pressed={!current("audience")} onClick={() => update({ audience: null })}>All</button>
            {AUDIENCES.filter((a) => facets.audiences.includes(a.slug)).map((a) => (
              <button key={a.slug} type="button" className={chip(current("audience") === a.slug)} aria-pressed={current("audience") === a.slug} onClick={() => update({ audience: a.slug })}>{a.label}</button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Team</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={chip(!current("team"))} aria-pressed={!current("team")} onClick={() => update({ team: null })}>All teams</button>
          {facets.teams.map((t) => (
            <button key={t.slug} type="button" className={chip(current("team") === t.slug)} aria-pressed={current("team") === t.slug} onClick={() => update({ team: t.slug })}>{t.name}</button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Size</legend>
        <div className="flex flex-wrap gap-2">
          {facets.sizes.map((s) => (
            <button key={s} type="button" className={`${chip(current("size") === s)} min-w-12`} aria-pressed={current("size") === s} onClick={() => update({ size: current("size") === s ? null : s })}>{s}</button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Availability</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={chip(!current("avail"))} aria-pressed={!current("avail")} onClick={() => update({ avail: null })}>All items</button>
          <button type="button" className={chip(current("avail") === "in-stock")} aria-pressed={current("avail") === "in-stock"} onClick={() => update({ avail: "in-stock" })}>In stock</button>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Price</legend>
        <PriceInputs
          key={`${current("min")}-${current("max")}`}
          min={current("min")}
          max={current("max")}
          bounds={[facets.minPrice, facets.maxPrice]}
          onApply={(min, max) => update({ min: min || null, max: max || null })}
        />
      </fieldset>
    </div>
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setOpen(true)} className="btn btn-outline h-11 px-5 text-[0.72rem] lg:hidden">
            Filter{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
          <p className="text-sm text-stone" aria-live="polite"><span className="font-semibold text-ink tabular-nums">{total}</span> {total === 1 ? "dress" : "dresses"}</p>
          {activeCount > 0 && (
            <button type="button" onClick={() => router.push(pathname, { scroll: false })} className="link-underline hidden text-sm font-medium sm:inline-block">Clear all</button>
          )}
        </div>
        <label className="flex items-center gap-3 text-sm">
          <span className="text-stone">Sort</span>
          <select
            className="field h-11 w-auto min-w-[200px] rounded-full pr-8 text-sm"
            value={current("sort") || "featured"}
            onChange={(e) => update({ sort: e.target.value === "featured" ? null : e.target.value })}
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
      </div>

      <aside className="mt-6 hidden lg:block" aria-label="Product filters">
        <div className="sticky top-32">{controls}</div>
      </aside>

      <Modal open={open} onClose={() => setOpen(false)} title="Filter & sort">
        <div className="pb-24">{controls}</div>
        <div className="sticky bottom-0 -mx-5 -mb-5 flex gap-3 border-t border-line bg-paper p-5 sm:-mx-7 sm:-mb-7 sm:p-7">
          <button type="button" className="btn btn-outline flex-1" onClick={() => router.push(pathname, { scroll: false })}>Clear</button>
          <button type="button" className="btn btn-primary flex-1" onClick={() => setOpen(false)}>Show results</button>
        </div>
      </Modal>
    </>
  );
}

function PriceInputs({
  min,
  max,
  bounds,
  onApply,
}: {
  min: string;
  max: string;
  bounds: [number, number];
  onApply: (min: string, max: string) => void;
}) {
  const [lo, setLo] = useState(min);
  const [hi, setHi] = useState(max);
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onApply(lo, hi);
      }}
    >
      <label className="sr-only" htmlFor="price-min">Minimum price</label>
      <input id="price-min" inputMode="numeric" type="number" min={0} placeholder={`$${bounds[0]}`} value={lo} onChange={(e) => setLo(e.target.value)} className="field h-11 rounded-full text-sm" />
      <span aria-hidden="true" className="text-stone">–</span>
      <label className="sr-only" htmlFor="price-max">Maximum price</label>
      <input id="price-max" inputMode="numeric" type="number" min={0} placeholder={`$${bounds[1]}`} value={hi} onChange={(e) => setHi(e.target.value)} className="field h-11 rounded-full text-sm" />
      <button type="submit" className="btn btn-outline h-11 shrink-0 px-4 text-[0.7rem]">Apply</button>
    </form>
  );
}
