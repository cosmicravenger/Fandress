"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart";
import { Modal } from "@/components/client-ui";
import { Price } from "@/components/ui";
import type { ProductCard as ProductCardData } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

const WISH_KEY = "fd-wishlist";

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      setIds(JSON.parse(localStorage.getItem(WISH_KEY) || "[]"));
    } catch {
      setIds([]);
    }
  }, []);
  const toggle = (id: string) =>
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(WISH_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable: keep in-memory state */
      }
      return next;
    });
  return { ids, toggle };
}

function SizeChips({
  variants,
  selected,
  onSelect,
  size = "sm",
}: {
  variants: ProductCardData["variants"];
  selected?: string;
  onSelect: (variantId: string) => void;
  size?: "sm" | "md";
}) {
  return (
    <div role="radiogroup" aria-label="Choose size" className="flex flex-wrap gap-2">
      {variants.map((v) => (
        <button
          key={v.id}
          type="button"
          role="radio"
          aria-checked={selected === v.id}
          disabled={!v.available}
          onClick={() => onSelect(v.id)}
          className={`min-w-11 rounded-full border px-3 font-medium transition disabled:cursor-not-allowed disabled:border-dashed disabled:text-stone/60 disabled:line-through ${
            size === "md" ? "h-11 text-sm" : "h-9 text-xs"
          } ${selected === v.id ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`}
          title={v.available ? `Size ${v.size}` : `Size ${v.size} — sold out`}
        >
          {v.size}
        </button>
      ))}
    </div>
  );
}

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const { add, loading } = useCart();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { ids, toggle } = useWishlist();
  const saved = ids.includes(product.id);
  const onSale = product.compareAtCents !== null && product.compareAtCents > product.priceCents;
  const availableVariants = product.variants.filter((v) => v.available);

  return (
    <article className="product-card group relative flex min-w-0 flex-col">
      <div className="card-media relative aspect-[3/4]">
        <Link href={`/products/${product.handle}`} className="absolute inset-0 z-0" aria-label={`View ${product.title}`} tabIndex={-1}>
          {product.image && (
            <Image
              src={product.image.url}
              alt={product.image.alt}
              width={product.image.width}
              height={product.image.height}
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
              priority={priority}
              className="primary absolute inset-0 h-full w-full object-cover"
            />
          )}
          {product.hoverImage && product.hoverImage.url !== product.image?.url && (
            <Image
              src={product.hoverImage.url}
              alt=""
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {onSale && <span className="rounded-full bg-rose px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.12em] text-white uppercase">Sale</span>}
          {!product.available && <span className="rounded-full bg-ink px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.12em] text-white uppercase">Sold out</span>}
        </div>

        <button
          type="button"
          onClick={() => toggle(product.id)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition hover:scale-105"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className={saved ? "text-rose" : ""}>
            <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="absolute inset-x-3 bottom-3 z-10 flex translate-y-0 flex-col gap-2 transition duration-500 md:translate-y-[calc(100%+12px)] md:group-hover:translate-y-0 md:group-focus-within:translate-y-0">
          {quickAddOpen && product.available && (
            <div className="animate-fade-up rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
              <p className="mb-2 text-xs font-semibold tracking-[0.12em] uppercase">Select a size</p>
              <SizeChips
                variants={product.variants}
                onSelect={async (id) => {
                  const ok = await add(id, 1);
                  if (ok) setQuickAddOpen(false);
                }}
              />
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setQuickAddOpen((o) => !o)}
              disabled={!product.available || loading || availableVariants.length === 0}
              aria-expanded={quickAddOpen}
              className="btn btn-light h-11 flex-1 text-[0.7rem] shadow-md disabled:opacity-60"
            >
              {product.available ? "Quick add" : "Sold out"}
            </button>
            <button type="button" onClick={() => setQuickViewOpen(true)} className="btn h-11 bg-white/95 px-4 text-[0.7rem] text-ink shadow-md hover:bg-ink hover:text-white">
              Quick view
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-1.5">
        <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-stone uppercase">{product.teamName}</p>
        <h3 className="text-[1.05rem] leading-snug font-medium">
          <Link href={`/products/${product.handle}`} className="transition hover:text-rose">{product.title}</Link>
        </h3>
        <div className="flex items-center justify-between gap-2">
          <Price cents={product.priceCents} compareAtCents={product.compareAtCents} size="sm" />
          <span className="text-xs text-stone">{product.sizes[0]}–{product.sizes[product.sizes.length - 1]}</span>
        </div>
        {onSale && <p className="text-xs font-medium text-rose">Save {formatPrice(product.compareAtCents! - product.priceCents)}</p>}
      </div>

      <Modal open={quickViewOpen} onClose={() => setQuickViewOpen(false)} title={product.title}>
        <QuickViewBody product={product} onDone={() => setQuickViewOpen(false)} />
      </Modal>
    </article>
  );
}

function QuickViewBody({ product, onDone }: { product: ProductCardData; onDone: () => void }) {
  const { add, loading } = useCart();
  const firstAvailable = product.variants.find((v) => v.available)?.id;
  const [selected, setSelected] = useState<string | undefined>(firstAvailable);
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand">
        {product.image && <Image src={product.image.url} alt={product.image.alt} fill sizes="(min-width: 640px) 260px, 90vw" className="object-cover" />}
      </div>
      <div className="flex flex-col">
        <p className="text-xs font-semibold tracking-[0.16em] text-stone uppercase">{product.teamName}</p>
        <h3 className="mt-2 text-2xl leading-tight">{product.title}</h3>
        <div className="mt-3"><Price cents={product.priceCents} compareAtCents={product.compareAtCents} size="lg" /></div>
        <p className="mt-6 mb-3 text-sm font-semibold">Size</p>
        <SizeChips variants={product.variants} selected={selected} onSelect={setSelected} size="md" />
        <button
          type="button"
          disabled={!selected || loading}
          onClick={async () => {
            if (!selected) return;
            const ok = await add(selected, 1);
            if (ok) onDone();
          }}
          className="btn btn-primary mt-8 w-full"
        >
          {loading ? "Adding…" : "Add to bag"}
        </button>
        <Link href={`/products/${product.handle}`} onClick={onDone} className="link-underline mt-5 text-center text-sm font-medium">
          View full details
        </Link>
      </div>
    </div>
  );
}
