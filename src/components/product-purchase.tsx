"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart";
import { Modal } from "@/components/client-ui";
import { Price } from "@/components/ui";
import { STORE } from "@/lib/config";

export type PurchaseVariant = {
  id: string;
  size: string;
  available: boolean;
  priceCents: number;
  compareAtCents: number | null;
};

export type PurchaseProduct = {
  id: string;
  title: string;
  teamName: string;
  audience: string;
  sizeOption: string;
  priceCents: number;
  compareAtCents: number | null;
  sizeChartUrl: string | null;
};

const AUDIENCE_GUIDE: Record<string, { title: string; body: string[] }> = {
  women: {
    title: "Women's sizing",
    body: [
      "Sizes run XS through 2XL. Compare your measurements with the size chart image below.",
      "The drawstring at the waist lets you tailor the fit, so the size you usually wear is a good starting point.",
      "If you fall between sizes, we recommend sizing up.",
    ],
  },
  girls: {
    title: "Girls' sizing",
    body: [
      "Girls' sizes run 2T through 10/11, and are sized by age range.",
      "If your little fan is between sizes, we recommend sizing up.",
    ],
  },
  baby: {
    title: "Baby & infant sizing",
    body: [
      "Infant sizes are based on age range: 0–3 months, 6–9 months and 12–18 months.",
      "Fit is true to size. Choose the range closest to your baby's current age.",
    ],
  },
};

export function ProductPurchase({
  product,
  variants,
  shippingNote,
}: {
  product: PurchaseProduct;
  variants: PurchaseVariant[];
  shippingNote?: string;
}) {
  const { add, loading } = useCart();
  const firstAvailable = variants.find((v) => v.available)?.id ?? variants[0]?.id;
  const [selected, setSelected] = useState<string | undefined>(firstAvailable);
  const [qty, setQty] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const variant = useMemo(() => variants.find((v) => v.id === selected), [variants, selected]);
  const anyAvailable = variants.some((v) => v.available);
  const guide = AUDIENCE_GUIDE[product.audience] ?? AUDIENCE_GUIDE.women;
  const price = variant?.priceCents ?? product.priceCents;
  const compare = variant?.compareAtCents ?? product.compareAtCents;

  const requireSize = () => {
    if (!selected || !variant?.available) {
      setSizeError(true);
      document.getElementById("size-selector")?.focus();
      return false;
    }
    return true;
  };

  const buyNowUrl = variant
    ? `${STORE.shopifyUrl}/cart/${variant.id}:${qty}`
    : `${STORE.shopifyUrl}/cart`;

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-rose uppercase">{product.teamName}</p>
        <div className="mt-3 flex flex-wrap items-baseline gap-3">
          <Price cents={price} compareAtCents={compare} size="lg" />
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm">
          <span className={`inline-block h-2 w-2 rounded-full ${anyAvailable ? "bg-emerald-600" : "bg-stone"}`} aria-hidden="true" />
          {!anyAvailable
            ? "Sold out"
            : variant && !variant.available
              ? "This size is sold out, choose another"
              : variant
                ? `Size ${variant.size} in stock`
                : "Select a size to see availability"}
        </p>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p id="size-label" className="text-sm font-semibold">Size{selected && variant ? `: ${variant.size}` : ""}</p>
          <button type="button" onClick={() => setGuideOpen(true)} className="link-underline text-sm font-medium">Size guide</button>
        </div>
        <div
          id="size-selector"
          tabIndex={-1}
          role="radiogroup"
          aria-labelledby="size-label"
          aria-describedby={sizeError ? "size-error" : undefined}
          className={`grid grid-cols-4 gap-2 outline-none sm:grid-cols-5 ${sizeError ? "rounded-2xl ring-2 ring-rose ring-offset-4 ring-offset-paper" : ""}`}
        >
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={selected === v.id}
              aria-label={`Size ${v.size}${v.available ? "" : ", sold out"}`}
              disabled={!v.available}
              onClick={() => {
                setSelected(v.id);
                setSizeError(false);
              }}
              className={`h-12 rounded-2xl border text-sm font-semibold transition disabled:cursor-not-allowed disabled:border-dashed disabled:bg-transparent disabled:text-stone/50 disabled:line-through ${
                selected === v.id ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"
              }`}
            >
              {v.size}
            </button>
          ))}
        </div>
        {sizeError && <p id="size-error" role="alert" className="mt-2 text-sm font-medium text-rose">Please select an available size to continue.</p>}
        <p className="mt-3 text-sm text-stone">{guide.body[2] ?? guide.body[0]}</p>
      </div>

      <div className="flex gap-3">
        <div>
          <label htmlFor="qty" className="sr-only">Quantity</label>
          <div className="inline-flex h-14 items-center rounded-full border border-line bg-white">
            <button type="button" className="grid h-14 w-12 place-items-center rounded-full text-lg hover:bg-sand" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
            <input id="qty" value={qty} readOnly className="w-10 bg-transparent text-center font-semibold tabular-nums" aria-live="polite" />
            <button type="button" className="grid h-14 w-12 place-items-center rounded-full text-lg hover:bg-sand" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button
          id="buy-cta"
          type="button"
          disabled={loading || !anyAvailable}
          onClick={async () => {
            if (!requireSize()) return;
            await add(selected!, qty);
          }}
          className="btn btn-primary h-14 flex-1 text-[0.82rem]"
        >
          {loading ? "Updating bag…" : anyAvailable ? "Add to bag" : "Sold out"}
        </button>
      </div>

      <a
        href={buyNowUrl}
        onClick={(e) => {
          if (!requireSize()) e.preventDefault();
        }}
        className="btn btn-outline h-14 w-full text-[0.82rem]"
      >
        Buy with Shopify checkout
      </a>
      <p className="text-xs text-stone">Buy now sends you straight to Shopify&apos;s secure checkout for the selected size.</p>

      <ul className="grid gap-3 rounded-3xl bg-sand/60 p-5 text-sm">
        <li className="flex gap-3"><span aria-hidden="true">✓</span> Officially licensed design, patented drawstring jersey construction.</li>
        <li className="flex gap-3"><span aria-hidden="true">✓</span>{shippingNote ?? `Free shipping on orders over $${STORE.freeShippingThreshold}. Shipping and taxes are calculated at checkout.`}</li>
        <li className="flex gap-3"><span aria-hidden="true">✓</span> Secure checkout powered by Shopify. Read our returns policy before you order.</li>
      </ul>

      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="Size guide" size="lg">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl">{guide.title}</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-stone">
              {guide.body.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </div>
          {product.sizeChartUrl ? (
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-white sm:aspect-[4/3]">
              <Image src={product.sizeChartUrl} alt={`Fan Dress size chart for ${product.title}`} fill sizes="(min-width: 640px) 900px, 100vw" className="object-contain" />
            </div>
          ) : (
            <p className="rounded-2xl bg-sand p-4 text-sm text-stone">A size chart for this style is not available yet. Contact us for fit help.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}

/** Mobile + desktop sticky purchase bar: appears once the main Add to bag button scrolls away. */
export function StickyBuyBar({
  title,
  priceCents,
  compareAtCents,
  variants,
}: {
  title: string;
  priceCents: number;
  compareAtCents: number | null;
  variants: PurchaseVariant[];
}) {
  const [visible, setVisible] = useState(false);
  const { add, loading } = useCart();
  useEffect(() => {
    const target = document.getElementById("buy-cta");
    if (!target || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  const firstAvailable = variants.find((v) => v.available);
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[55] border-t border-line bg-paper/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(19,32,58,0.10)] backdrop-blur transition-transform duration-500 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <div className="container-fd flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          <Price cents={priceCents} compareAtCents={compareAtCents} size="sm" />
        </div>
        <button
          type="button"
          tabIndex={visible ? 0 : -1}
          disabled={!firstAvailable || loading}
          onClick={() => {
            document.getElementById("size-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
            document.getElementById("size-selector")?.focus();
          }}
          className="btn btn-primary h-12 px-6 text-[0.75rem]"
        >
          {firstAvailable ? "Choose size" : "Sold out"}
        </button>
      </div>
    </div>
  );
}
