"use client";

import Image from "next/image";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CartState, CartLine } from "@/lib/cart";
import { STORE } from "@/lib/config";
import { formatPrice } from "@/lib/format";

type Toast = { id: number; message: string; tone: "success" | "error" };

type CartContextValue = {
  cart: CartState | null;
  loading: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (variantId: string, quantity?: number) => Promise<boolean>;
  update: (variantId: string, quantity: number) => Promise<void>;
  remove: (variantId: string) => Promise<void>;
  notify: (message: string, tone?: "success" | "error") => void;
  discount: string;
  setDiscount: (code: string) => void;
  checkoutUrl: string;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/** Client checkout link: Shopify's native cart permalink (lines + optional discount). */
function buildClientCheckoutUrl(lines: CartLine[], discount: string) {
  if (!lines.length) return `${STORE.shopifyUrl}/cart`;
  const path = lines.map((l) => `${l.variantId}:${l.quantity}`).join(",");
  const params = discount ? `?discount=${encodeURIComponent(discount)}` : "";
  return `${STORE.shopifyUrl}/cart/${path}${params}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [discount, setDiscount] = useState("");
  const toastId = useRef(0);

  const notify = useCallback((message: string, tone: "success" | "error" = "success") => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  const post = useCallback(
    async (body: Record<string, unknown>) => {
      setLoading(true);
      try {
        const res = await fetch("/api/cart", {
          method: body.action === undefined ? "GET" : "POST",
          headers: { "content-type": "application/json" },
          body: body.action === undefined ? undefined : JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          notify(data.error || "Something went wrong. Please try again.", "error");
          return false;
        }
        setCart(data.cart as CartState);
        return true;
      } catch {
        notify("Network error. Please check your connection and try again.", "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [notify],
  );

  useEffect(() => {
    post({}).catch(() => undefined);
  }, [post]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const add = useCallback(
    async (variantId: string, quantity = 1) => {
      const ok = await post({ action: "add", variantId, quantity });
      if (ok) {
        notify("Added to your bag.");
        setOpen(true);
      }
      return ok;
    },
    [post, notify],
  );

  const update = useCallback(async (variantId: string, quantity: number) => {
    await post({ action: "update", variantId, quantity });
  }, [post]);

  const remove = useCallback(
    async (variantId: string) => {
      const ok = await post({ action: "remove", variantId });
      if (ok) notify("Item removed from your bag.");
    },
    [post, notify],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      loading,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      update,
      remove,
      notify,
      discount,
      setDiscount,
      checkoutUrl: buildClientCheckoutUrl(cart?.lines ?? [], discount.trim()),
    }),
    [cart, loading, isOpen, add, update, remove, notify, discount],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-fade-up pointer-events-auto rounded-full px-5 py-3 text-sm font-medium shadow-lg ${
              t.tone === "error" ? "bg-rose text-white" : "bg-ink text-white"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </CartContext.Provider>
  );
}

/* ---------- Shared cart line UI ---------- */

function QtyControl({ line, disabled }: { line: CartLine; disabled: boolean }) {
  const { update } = useCart();
  return (
    <div className="inline-flex h-10 items-center rounded-full border border-line bg-white" role="group" aria-label={`Quantity for ${line.title}, size ${line.size}`}>
      <button
        type="button"
        className="grid h-10 w-10 place-items-center rounded-full text-lg transition hover:bg-sand disabled:opacity-40"
        onClick={() => update(line.variantId, line.quantity - 1)}
        disabled={disabled}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">{line.quantity}</span>
      <button
        type="button"
        className="grid h-10 w-10 place-items-center rounded-full text-lg transition hover:bg-sand disabled:opacity-40"
        onClick={() => update(line.variantId, line.quantity + 1)}
        disabled={disabled || line.quantity >= 20}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function CartLineItem({ line, compact }: { line: CartLine; compact: boolean }) {
  const { remove, loading } = useCart();
  return (
    <li className="animate-fade-up flex gap-4 py-5">
      <Link href={`/products/${line.handle}`} className="relative block h-28 w-22 shrink-0 overflow-hidden rounded-2xl bg-sand sm:h-36 sm:w-28" tabIndex={-1} aria-hidden="true">
        {line.image && (
          <Image src={line.image.url} alt="" fill sizes="112px" className="object-cover" />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/products/${line.handle}`} className="block truncate font-semibold hover:text-rose">{line.title}</Link>
            <p className="mt-1 text-sm text-stone">Size {line.size} · {line.teamName}</p>
          </div>
          <p className="shrink-0 font-semibold tabular-nums">{formatPrice(line.priceCents * line.quantity)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <QtyControl line={line} disabled={loading} />
          <button type="button" onClick={() => remove(line.variantId)} disabled={loading} className="link-underline text-sm text-stone hover:text-rose disabled:opacity-40">
            Remove
          </button>
        </div>
        {!line.available && !compact && <p className="mt-2 text-xs font-medium text-rose">This size just sold out. Remove it or choose another size.</p>}
      </div>
    </li>
  );
}

function ShippingProgress({ subtotalCents, thresholdCents }: { subtotalCents: number; thresholdCents: number }) {
  const remaining = Math.max(0, thresholdCents - subtotalCents);
  const pct = thresholdCents ? Math.min(100, (subtotalCents / thresholdCents) * 100) : 100;
  return (
    <div className="rounded-2xl bg-sand/70 p-4">
      <p className="text-sm font-medium">
        {remaining > 0
          ? <>You&apos;re only <span className="text-rose">{formatPrice(remaining)}</span> away from free shipping!</>
          : <>🎉 You&apos;ve unlocked free shipping!</>}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuemin={0} aria-valuemax={thresholdCents} aria-valuenow={Math.min(subtotalCents, thresholdCents)} aria-label="Progress toward free shipping">
        <div className="h-full rounded-full bg-rose transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CartBody({ compact }: { compact: boolean }) {
  const { cart, loading, discount, setDiscount, checkoutUrl, close } = useCart();
  const [promoApplied, setPromoApplied] = useState(false);

  if (!cart) {
    return (
      <div className="space-y-4 py-6" aria-busy="true">
        {[0, 1].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
    );
  }

  if (!cart.lines.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="eyebrow">Your bag</p>
        <h3 className="mt-3 text-2xl">Your bag is empty</h3>
        <p className="mt-3 max-w-xs text-stone">Find your team and pick a jersey dress made for game day.</p>
        <Link href="/shop" onClick={close} className="btn btn-primary mt-8">Shop all dresses</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <ul className="divide-y divide-line">
        {cart.lines.map((line) => (
          <CartLineItem key={line.variantId} line={line} compact={compact} />
        ))}
      </ul>

      <div className="mt-auto space-y-5 border-t border-line pt-6">
        <ShippingProgress subtotalCents={cart.subtotalCents} thresholdCents={cart.freeShippingThresholdCents} />

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPromoApplied(Boolean(discount.trim()));
          }}
        >
          <label htmlFor={compact ? "promo-drawer" : "promo-page"} className="sr-only">Promo code</label>
          <input
            id={compact ? "promo-drawer" : "promo-page"}
            className="field"
            placeholder="Promo code"
            value={discount}
            onChange={(e) => {
              setDiscount(e.target.value);
              setPromoApplied(false);
            }}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-outline shrink-0 px-5" disabled={!discount.trim()}>Apply</button>
        </form>
        {promoApplied && (
          <p className="text-sm text-stone" role="status">Code <strong>{discount.trim().toUpperCase()}</strong> will be applied at Shopify checkout, where discounts are validated.</p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-stone">Subtotal</span><span className="font-semibold tabular-nums">{formatPrice(cart.subtotalCents)}</span></div>
          <div className="flex justify-between"><span className="text-stone">Shipping &amp; taxes</span><span className="text-stone">Calculated at checkout</span></div>
        </div>

        <a href={checkoutUrl} className="btn btn-primary w-full">
          Checkout securely
        </a>
        <p className="flex items-center justify-center gap-2 text-center text-xs text-stone">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></svg>
          Secure checkout powered by Shopify. Payment methods shown there match this store&apos;s configuration.
        </p>
        <div className="text-center">
          <button type="button" onClick={close} className="link-underline text-sm font-medium">Continue shopping</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Slide-out drawer ---------- */

function CartDrawer() {
  const { isOpen, close, cart } = useCart();
  return (
    <div className={`fixed inset-0 z-[80] ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <div
        className={`absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-paper shadow-2xl transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)] ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-7">
          <h2 className="text-2xl">Your bag {cart && cart.count > 0 && <span className="text-base text-stone">({cart.count})</span>}</h2>
          <button type="button" onClick={close} aria-label="Close bag" className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-sand">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
          </button>
        </header>
        <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6 sm:px-7">
          <CartBody compact />
        </div>
      </aside>
    </div>
  );
}

/** Full cart page body (used at /cart). */
export function CartPageView() {
  const { cart, loading, discount, setDiscount, checkoutUrl } = useCart();
  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
      <section aria-labelledby="bag-heading" className="flex flex-col">
        <h2 id="bag-heading" className="sr-only">Items in your bag</h2>
        {!cart && <div className="skeleton h-40 rounded-2xl" />}
        {cart && !cart.lines.length && (
          <div className="rounded-3xl border border-dashed border-line bg-white p-10 text-center">
            <h2 className="text-2xl">Your bag is empty</h2>
            <p className="mt-3 text-stone">Find your team and pick a jersey dress made for game day.</p>
            <Link href="/shop" className="btn btn-primary mt-6">Shop all dresses</Link>
          </div>
        )}
        {cart && cart.lines.length > 0 && <CartLinesOnly />}
      </section>
      {cart && cart.lines.length > 0 && (
        <aside className="h-fit rounded-3xl bg-white p-6 shadow-[0_10px_40px_rgba(19,32,58,0.06)] lg:sticky lg:top-32" aria-label="Order summary">
          <h2 className="text-xl">Order summary</h2>
          <div className="mt-5 space-y-4 text-sm">
            <ShippingProgress subtotalCents={cart.subtotalCents} thresholdCents={cart.freeShippingThresholdCents} />
            <div className="flex justify-between"><span className="text-stone">Items</span><span>{cart.count}</span></div>
            <div className="flex justify-between text-base font-semibold"><span>Subtotal</span><span className="tabular-nums">{formatPrice(cart.subtotalCents)}</span></div>
            <p className="text-stone">Shipping and taxes are calculated at checkout.</p>
            <label htmlFor="promo-page-2" className="block text-sm font-medium">Promo code</label>
            <input id="promo-page-2" className="field" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="Enter code" autoComplete="off" />
          </div>
          <a href={checkoutUrl} className={`btn btn-primary mt-6 w-full ${loading ? "pointer-events-none opacity-60" : ""}`}>Checkout securely</a>
          <p className="mt-4 text-center text-xs text-stone">Secure checkout powered by Shopify.</p>
          <Link href="/shop" className="link-underline mt-5 block text-center text-sm font-medium">Continue shopping</Link>
        </aside>
      )}
    </div>
  );
}

function CartLinesOnly() {
  const { cart } = useCart();
  if (!cart) return null;
  return (
    <ul className="divide-y divide-line rounded-3xl bg-white px-5 sm:px-7">
      {cart.lines.map((line) => (
        <CartLineItem key={line.variantId} line={line} compact={false} />
      ))}
    </ul>
  );
}
