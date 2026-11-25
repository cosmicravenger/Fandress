import { findVariant } from "@/lib/catalog";
import { STORE } from "@/lib/config";

/* Cart lives in an HTTP-only cookie (no database). The cookie stores only variant ids and quantities. */

export const CART_COOKIE = "fd_cart";
export const MAX_QTY = 20;

export type StoredLine = { v: string; q: number };

export type CartLine = {
  variantId: string;
  quantity: number;
  productId: string;
  handle: string;
  title: string;
  teamName: string;
  size: string;
  priceCents: number;
  compareAtCents: number | null;
  available: boolean;
  image: { url: string; alt: string; width: number; height: number } | null;
};

export type CartState = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  freeShippingThresholdCents: number;
  checkoutUrl: string;
};

/** Native Shopify checkout link built from real Shopify variant ids. */
export function buildCheckoutUrl(lines: { variantId: string; quantity: number }[], discount?: string) {
  if (!lines.length) return `${STORE.shopifyUrl}/cart`;
  const path = lines.map((l) => `${l.variantId}:${l.quantity}`).join(",");
  const params = discount ? `?discount=${encodeURIComponent(discount)}` : "";
  return `${STORE.shopifyUrl}/cart/${path}${params}`;
}

export function parseCart(raw: string | null | undefined): StoredLine[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(decodeURIComponent(raw));
    if (!Array.isArray(data)) return [];
    return data
      .filter((l) => typeof l?.v === "string" && Number.isInteger(l?.q) && l.q > 0 && l.q <= MAX_QTY)
      .slice(0, 30);
  } catch {
    return [];
  }
}

export function serializeCart(lines: StoredLine[]) {
  return encodeURIComponent(JSON.stringify(lines));
}

/** Pure cart mutation. */
export function applyAction(
  lines: StoredLine[],
  action: "add" | "update" | "remove",
  variantId: string,
  quantity: number,
): StoredLine[] {
  const existing = lines.find((l) => l.v === variantId);
  if (action === "add") {
    if (!existing) return [...lines, { v: variantId, q: Math.min(quantity, MAX_QTY) }];
    return lines.map((l) => (l.v === variantId ? { v: variantId, q: Math.min(l.q + quantity, MAX_QTY) } : l));
  }
  if (action === "update") {
    if (quantity <= 0) return lines.filter((l) => l.v !== variantId);
    return lines.map((l) => (l.v === variantId ? { v: variantId, q: Math.min(quantity, MAX_QTY) } : l));
  }
  return lines.filter((l) => l.v !== variantId);
}

export function readCart(stored: StoredLine[]): CartState {
  const lines: CartLine[] = [];
  for (const l of stored) {
    const hit = findVariant(l.v);
    if (!hit) continue;
    lines.push({
      variantId: l.v,
      quantity: l.q,
      productId: hit.product.id,
      handle: hit.product.handle,
      title: hit.product.title,
      teamName: hit.product.teamName,
      size: hit.variant.size,
      priceCents: hit.variant.priceCents,
      compareAtCents: hit.variant.compareAtCents,
      available: hit.variant.available,
      image: hit.image ? { url: hit.image.url, alt: hit.image.alt, width: hit.image.width, height: hit.image.height } : null,
    });
  }
  const subtotalCents = lines.reduce((sum, l) => sum + l.priceCents * l.quantity, 0);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  return {
    lines,
    count,
    subtotalCents,
    freeShippingThresholdCents: Math.round(STORE.freeShippingThreshold * 100),
    checkoutUrl: buildCheckoutUrl(lines),
  };
}
