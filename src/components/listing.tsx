import Link from "next/link";
import { Suspense } from "react";
import { FilterBar, type Facets } from "@/components/filters";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/client-ui";
import { getFacets, listProducts, type ProductFilters } from "@/lib/catalog";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parseFilters(sp: SP): ProductFilters {
  const num = (v: string | undefined) => (v && Number.isFinite(Number(v)) ? Number(v) : undefined);
  const avail = one(sp.avail);
  return {
    q: one(sp.q),
    team: one(sp.team),
    size: one(sp.size),
    audience: one(sp.audience),
    availability: avail === "in-stock" ? "in-stock" : "all",
    minPrice: num(one(sp.min)),
    maxPrice: num(one(sp.max)),
    sort: one(sp.sort),
    page: num(one(sp.page)) ?? 1,
  };
}

function pageHref(basePath: string, sp: SP, page: number) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const val = one(v);
    if (k !== "page" && val) qs.set(k, val);
  }
  if (page > 1) qs.set("page", String(page));
  const s = qs.toString();
  return `${basePath}${s ? `?${s}` : ""}`;
}

/** Shared product listing: filters, sorting, product grid and pagination. */
export async function ProductListing({
  basePath,
  searchParams,
  collectionId,
  hideAudienceFilter = false,
  emptyText,
}: {
  basePath: string;
  searchParams: SP;
  collectionId?: string;
  hideAudienceFilter?: boolean;
  emptyText?: string;
}) {
  const filters = { ...parseFilters(searchParams), collectionId };
  const [result, facets] = await Promise.all([listProducts(filters), getFacets()]);

  return (
    <div className="container-fd pb-24 pt-8">
      <Suspense fallback={<div className="skeleton h-14 rounded-full" />}>
        <FilterBar facets={facets as Facets} total={result.total} showAudience={!hideAudienceFilter} />
      </Suspense>

      {result.items.length === 0 ? (
        <div className="py-24 text-center">
          <h2 className="text-3xl">No dresses match these filters</h2>
          <p className="mx-auto mt-3 max-w-md text-stone">{emptyText ?? "Try clearing a filter or browse all dresses."}</p>
          <Link href={basePath} className="btn btn-primary mt-8">Clear filters</Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
          {result.items.map((p, i) => (
            <Reveal as="li" key={p.id} delay={Math.min(i, 3) * 60}>
              <ProductCard product={p} priority={i < 2} />
            </Reveal>
          ))}
        </ul>
      )}

      {result.pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-2">
          {result.page > 1 && (
            <Link href={pageHref(basePath, searchParams, result.page - 1)} rel="prev" className="btn btn-outline h-11 px-5 text-[0.7rem]">Previous</Link>
          )}
          <p className="px-4 text-sm text-stone tabular-nums" aria-current="page">Page {result.page} of {result.pageCount}</p>
          {result.page < result.pageCount && (
            <Link href={pageHref(basePath, searchParams, result.page + 1)} rel="next" className="btn btn-primary h-11 px-5 text-[0.7rem]">Load more</Link>
          )}
        </nav>
      )}
    </div>
  );
}
