import { CATALOG_COLLECTIONS, CATALOG_PRODUCTS, type CatalogImage } from "@/data/catalog";
import { sizeRank } from "@/lib/config";

export { formatPrice } from "@/lib/format";

/* Static catalog layer: reads the generated Shopify data in src/data/catalog.ts. No database. */

type ImageRef = { url: string; width: number; height: number; alt: string };

export type ProductCard = {
  id: string;
  handle: string;
  title: string;
  teamSlug: string;
  teamName: string;
  audience: string;
  priceCents: number;
  compareAtCents: number | null;
  available: boolean;
  createdAt: Date | null;
  image: ImageRef | null;
  hoverImage: ImageRef | null;
  sizes: string[];
  variants: { id: string; size: string; available: boolean; priceCents: number }[];
  colorLabel: string;
};

export type ProductFilters = {
  q?: string;
  team?: string;
  size?: string;
  audience?: string;
  availability?: "in-stock" | "all";
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  collectionId?: string;
};

export type ReviewRow = {
  id: number;
  authorName: string;
  rating: number;
  body: string;
  verifiedBuyer: boolean;
  createdAt: Date;
};

export const PAGE_SIZE = 12;

const ALL = CATALOG_PRODUCTS.map((p) => ({ ...p, createdAt: new Date(p.createdAt) }));
type Product = (typeof ALL)[number];

const sortedImages = (p: Product) => [...p.images].sort((a, b) => a.position - b.position);
const sortedVariants = (p: Product) => [...p.variants].sort((a, b) => a.position - b.position);
const imgRef = (i?: CatalogImage): ImageRef | null => (i ? { url: i.url, width: i.width, height: i.height, alt: i.alt } : null);

function toCard(p: Product): ProductCard {
  const imgs = sortedImages(p);
  const vars = sortedVariants(p);
  const sizes = [...new Set(vars.map((v) => v.size))].sort((a, b) => sizeRank(a) - sizeRank(b));
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    teamSlug: p.teamSlug,
    teamName: p.teamName,
    audience: p.audience,
    priceCents: p.priceCents,
    compareAtCents: p.compareAtCents,
    available: p.available,
    createdAt: p.createdAt,
    image: imgRef(imgs[0]),
    hoverImage: imgRef(imgs[1] ?? imgs[0]),
    sizes,
    variants: vars.map((v) => ({ id: v.id, size: v.size, available: v.available, priceCents: v.priceCents })),
    colorLabel: p.teamName,
  };
}

function filterProducts(f: ProductFilters): Product[] {
  const q = f.q?.trim().toLowerCase();
  const members = f.collectionId
    ? new Set(CATALOG_COLLECTIONS.find((c) => c.id === f.collectionId)?.productIds ?? [])
    : null;
  return ALL.filter((p) => {
    if (q && !`${p.title} ${p.tags} ${p.teamName}`.toLowerCase().includes(q)) return false;
    if (f.team && p.teamSlug !== f.team) return false;
    if (f.audience && p.audience !== f.audience) return false;
    if (f.availability === "in-stock" && !p.available) return false;
    if (f.minPrice !== undefined && p.priceCents < Math.round(f.minPrice * 100)) return false;
    if (f.maxPrice !== undefined && p.priceCents > Math.round(f.maxPrice * 100)) return false;
    if (f.size && !p.variants.some((v) => v.size === f.size)) return false;
    if (members && !members.has(p.id)) return false;
    return true;
  });
}

function sortProducts(list: Product[], sort?: string): Product[] {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.priceCents - b.priceCents);
    case "price-desc":
      return copy.sort((a, b) => b.priceCents - a.priceCents);
    case "title":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "newest":
      return copy.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
    default:
      return copy.sort((a, b) => Number(b.available) - Number(a.available) || a.title.localeCompare(b.title));
  }
}

export async function listProducts(f: ProductFilters) {
  const sorted = sortProducts(filterProducts(f), f.sort);
  const page = Math.max(1, f.page ?? 1);
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const slice = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return { items: slice.map(toCard), total: sorted.length, page, pageCount };
}

export async function getTeams() {
  const map = new Map<string, { slug: string; name: string; count: number }>();
  for (const p of ALL) {
    if (p.teamSlug === "other") continue;
    const entry = map.get(p.teamSlug) ?? { slug: p.teamSlug, name: p.teamName, count: 0 };
    entry.count += 1;
    map.set(p.teamSlug, entry);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getFacets() {
  const prices = ALL.map((p) => p.priceCents);
  return {
    teams: (await getTeams()).map((t) => ({ slug: t.slug, name: t.name })),
    sizes: [...new Set(ALL.flatMap((p) => p.variants.map((v) => v.size)))].sort((a, b) => sizeRank(a) - sizeRank(b)),
    audiences: [...new Set(ALL.map((p) => p.audience))],
    minPrice: prices.length ? Math.floor(Math.min(...prices) / 100) : 0,
    maxPrice: prices.length ? Math.ceil(Math.max(...prices) / 100) : 0,
  };
}

export async function getCollections() {
  return CATALOG_COLLECTIONS.map((c, i) => ({
    id: c.id,
    handle: c.handle,
    title: c.title,
    description: c.description,
    imageUrl: c.imageUrl,
    imageAlt: c.imageAlt,
    position: i,
  }));
}

export async function getCollectionByHandle(handle: string) {
  const all = await getCollections();
  return all.find((c) => c.handle === handle) ?? null;
}

export async function getProductByHandle(handle: string) {
  const p = ALL.find((x) => x.handle === handle);
  if (!p) return null;
  return {
    product: p,
    images: sortedImages(p),
    variants: sortedVariants(p),
    reviews: [] as ReviewRow[],
  };
}

/** Reviews are not stored anywhere yet, so no review data is shown until a review source is connected. */
export async function getPublishedReviews(_limit = 6): Promise<ReviewRow[]> {
  return [];
}

export async function getRelatedProducts(p: { id: string; teamSlug: string }, limit = 4) {
  const list = ALL.filter((x) => x.teamSlug === p.teamSlug && x.id !== p.id);
  return sortProducts(list, "featured").slice(0, limit).map(toCard);
}

export async function getOtherProducts(excludeId: string, limit = 4) {
  return sortProducts(ALL.filter((x) => x.id !== excludeId), "newest").slice(0, limit).map(toCard);
}

export async function getFeaturedProducts(limit = 8) {
  return sortProducts(ALL, "featured").slice(0, limit).map(toCard);
}

export async function getNewArrivals(limit = 4) {
  return sortProducts(ALL, "newest").slice(0, limit).map(toCard);
}

export async function searchCatalog(q: string) {
  return sortProducts(filterProducts({ q }), "featured").slice(0, 8).map(toCard);
}

/** Looks up a Shopify variant (used by the cart). */
export function findVariant(variantId: string) {
  for (const p of ALL) {
    const variant = p.variants.find((v) => v.id === variantId);
    if (variant) return { product: p, variant, image: sortedImages(p)[0] ?? null };
  }
  return null;
}

export function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
