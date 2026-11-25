"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart";
import { STORE } from "@/lib/config";
import { formatPrice } from "@/lib/format";

export type NavCollection = { handle: string; title: string; imageUrl: string | null; imageAlt: string };
export type NavTeam = { slug: string; name: string; count: number };

type Link = { label: string; href: string };
type Mega = {
  key: string;
  label: string;
  href: string;
  intro: string;
  columns: { title: string; links: Link[] }[];
  featured: { title: string; href: string; image: { url: string; alt: string } | null };
};

type SearchItem = {
  id: string;
  handle: string;
  title: string;
  teamName: string;
  priceCents: number;
  available: boolean;
  image: { url: string; alt: string } | null;
};

function buildMegas(collections: NavCollection[], teams: NavTeam[]): Mega[] {
  const byHandle = (h: string) => collections.find((c) => c.handle === h);
  const colLinks = (handles: string[]) =>
    handles
      .map(byHandle)
      .filter((c): c is NavCollection => Boolean(c))
      .map((c) => ({ label: c.title, href: `/collections/${c.handle}` }));
  const firstImage = (handles: string[]) => {
    const c = handles.map(byHandle).find((x) => x?.imageUrl);
    return c?.imageUrl ? { url: c.imageUrl, alt: c.imageAlt } : null;
  };
  const teamLinks = (audience?: string) =>
    teams.map((t) => ({ label: t.name, href: `/shop?${audience ? `audience=${audience}&` : ""}team=${t.slug}` }));

  return [
    {
      key: "shop",
      label: "Shop All",
      href: "/shop",
      intro: "Every jersey dress, every team, every size.",
      columns: [
        {
          title: "Shop",
          links: [
            { label: "All dresses", href: "/shop" },
            { label: "New arrivals", href: "/shop?sort=newest" },
            { label: "Under $100", href: "/shop?max=100" },
          ],
        },
        {
          title: "By audience",
          links: [
            { label: "Women's", href: "/shop?audience=women" },
            { label: "Girls'", href: "/shop?audience=girls" },
            { label: "Baby & infant", href: "/shop?audience=baby" },
          ],
        },
      ],
      featured: { title: "The full collection", href: "/shop", image: firstImage(["womens-jersey-dresses", "girls-dresses"]) },
    },
    {
      key: "women",
      label: "Women's Dresses",
      href: "/collections/womens-jersey-dresses",
      intro: "Patented jersey silhouettes with a feminine, game-day fit.",
      columns: [
        { title: "Collections", links: colLinks(["womens-jersey-dresses", "womens-gameday-dresses"]) },
        { title: "Shop by team", links: teamLinks("women") },
      ],
      featured: { title: "Women's jersey dresses", href: "/collections/womens-jersey-dresses", image: firstImage(["womens-jersey-dresses", "womens-gameday-dresses"]) },
    },
    {
      key: "girls",
      label: "Girls' Dresses",
      href: "/collections/girls-dresses",
      intro: "Twirl-ready fan dresses sized 2T to 10/11.",
      columns: [
        { title: "Collections", links: colLinks(["girls-dresses", "girls-gameday-dresses"]) },
        { title: "Shop by team", links: teamLinks("girls") },
      ],
      featured: { title: "Girls' game day dresses", href: "/collections/girls-dresses", image: firstImage(["girls-dresses", "girls-gameday-dresses"]) },
    },
    {
      key: "baby",
      label: "Baby Collection",
      href: "/collections/infant-dresses",
      intro: "The littlest fans, dressed for the ballpark.",
      columns: [
        { title: "Collections", links: colLinks(["infant-dresses"]) },
        { title: "Shop by team", links: teamLinks("baby") },
      ],
      featured: { title: "Infant dresses", href: "/collections/infant-dresses", image: firstImage(["infant-dresses"]) },
    },
    {
      key: "team",
      label: "Shop by Team",
      href: "/shop-by-team",
      intro: "Officially licensed collections for your team.",
      columns: [
        { title: "Teams", links: teams.map((t) => ({ label: t.name, href: `/shop?team=${t.slug}` })) },
        { title: "Team collections", links: colLinks(["texas-am-jersey-dress", "lsu-jersey-dress"]) },
      ],
      featured: { title: "Shop by team", href: "/shop-by-team", image: firstImage(["texas-am-jersey-dress", "lsu-jersey-dress"]) },
    },
  ];
}

const ICON = {
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" strokeLinecap="round" /></svg>
  ),
  user: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="8.5" r="4" /><path d="M4.5 20.5c1.4-3.6 4.2-5.5 7.5-5.5s6.1 1.9 7.5 5.5" strokeLinecap="round" /></svg>
  ),
  bag: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z" strokeLinejoin="round" /><path d="M9 8V6.5a3 3 0 016 0V8" /></svg>
  ),
  menu: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" /></svg>
  ),
  close: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
  ),
};

export function AnnouncementBar() {
  const messages = STORE.announcements.map((m) => m.trim()).filter(Boolean);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (messages.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % messages.length), 4500);
    return () => window.clearInterval(t);
  }, [messages.length]);
  return (
    <div className="bg-ink text-white">
      <div className="container-fd flex h-9 items-center justify-center text-center text-[0.72rem] font-medium tracking-[0.16em] uppercase">
        <p key={index} className="animate-fade-up" aria-live="off">{messages[index]}</p>
      </div>
    </div>
  );
}

export function SiteHeader({ collections, teams }: { collections: NavCollection[]; teams: NavTeam[] }) {
  const megas = buildMegas(collections, teams);
  const { cart, open: openCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [megaKey, setMegaKey] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bagPulse, setBagPulse] = useState(0);
  const prevCount = useRef(0);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMegaKey(null);
    setSearchOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const count = cart?.count ?? 0;
    if (count !== prevCount.current && prevCount.current !== 0) setBagPulse((p) => p + 1);
    prevCount.current = count;
  }, [cart?.count]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaKey(null);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const activeMega = megas.find((m) => m.key === megaKey) ?? null;
  const count = cart?.count ?? 0;

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-[60] bg-paper/95 backdrop-blur-md transition-[box-shadow,border-color] duration-500 ${
        scrolled ? "border-b border-line shadow-[0_8px_30px_rgba(19,32,58,0.06)]" : "border-b border-transparent"
      }`}
      onMouseLeave={() => setMegaKey(null)}
    >
      <a href="#main" className="sr-only-focusable absolute left-4 top-4 z-[100] rounded-full bg-ink px-4 py-2 text-white">
        Skip to content
      </a>
      <div className={`container-fd flex items-center justify-between gap-4 transition-[height] duration-500 ${scrolled ? "h-16" : "h-20"}`}>
        <div className="flex items-center gap-3 lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu" aria-expanded={mobileOpen} aria-controls="mobile-drawer" className="-ml-2 grid h-11 w-11 place-items-center rounded-full transition hover:bg-sand">
            {ICON.menu}
          </button>
        </div>

        <Link href="/" className="group flex flex-col leading-none" aria-label="Fan Dress home">
          <span className="font-display text-[1.45rem] font-bold tracking-[0.04em] transition group-hover:text-rose md:text-[1.7rem]">FAN DRESS</span>
          <span className="mt-1 hidden text-[0.6rem] tracking-[0.28em] text-stone uppercase sm:block">Where sports passion meets style</span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-9">
            <li>
              <Link href="/" className="nav-link" aria-current={pathname === "/" ? "page" : undefined}>Home</Link>
            </li>
            {megas.map((m) => (
              <li key={m.key} onMouseEnter={() => setMegaKey(m.key)}>
                <button
                  type="button"
                  className="nav-link flex items-center gap-1.5"
                  aria-expanded={megaKey === m.key}
                  aria-controls={`mega-${m.key}`}
                  onFocus={() => setMegaKey(m.key)}
                  onClick={() => setMegaKey((k) => (k === m.key ? null : m.key))}
                >
                  {m.label}
                  <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true" className={`transition-transform duration-300 ${megaKey === m.key ? "rotate-180" : ""}`}><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
                </button>
              </li>
            ))}
            <li>
              <Link href="/shop?sort=newest" className="nav-link">New Arrivals</Link>
            </li>
            <li>
              <Link href="/our-story" className="nav-link">Our Story</Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button type="button" onClick={() => { setMegaKey(null); setSearchOpen((s) => !s); }} aria-label="Search" aria-expanded={searchOpen} aria-controls="site-search" className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-sand">
            {ICON.search}
          </button>
          <Link href="/account" aria-label="Customer account" className="hidden h-11 w-11 place-items-center rounded-full transition hover:bg-sand sm:grid">
            {ICON.user}
          </Link>
          <button type="button" onClick={openCart} aria-label={`Shopping bag, ${count} items`} className="relative grid h-11 w-11 place-items-center rounded-full transition hover:bg-sand">
            {ICON.bag}
            {count > 0 && (
              <span key={bagPulse} className="animate-pop absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose px-1 text-[0.68rem] font-bold text-white tabular-nums">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mega menu */}
      <div
        id={activeMega ? `mega-${activeMega.key}` : undefined}
        className={`absolute inset-x-0 top-full hidden border-b border-line bg-paper shadow-[0_30px_60px_rgba(19,32,58,0.10)] transition-all duration-300 lg:block ${
          activeMega ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
        }`}
        onMouseEnter={() => activeMega && setMegaKey(activeMega.key)}
      >
        {activeMega && (
          <div className="container-fd grid grid-cols-[1fr_1fr_1fr_1.2fr] gap-10 py-10">
            <div className="col-span-1">
              <p className="eyebrow mb-3">{activeMega.label}</p>
              <p className="max-w-xs text-sm leading-relaxed text-stone">{activeMega.intro}</p>
              <Link href={activeMega.href} onClick={() => setMegaKey(null)} className="link-underline mt-6 inline-block text-sm font-semibold">
                Shop {activeMega.label} →
              </Link>
            </div>
            {activeMega.columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 font-sans text-xs font-semibold tracking-[0.18em] text-stone uppercase">{col.title}</h3>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link href={l.href} onClick={() => setMegaKey(null)} className="text-[0.98rem] transition hover:text-rose">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <Link href={activeMega.featured.href} onClick={() => setMegaKey(null)} className="group relative block overflow-hidden rounded-2xl bg-sand">
              <div className="relative aspect-[16/10]">
                {activeMega.featured.image && (
                  <Image src={activeMega.featured.image.url} alt={activeMega.featured.image.alt} fill sizes="360px" className="object-cover transition duration-[1200ms] ease-out group-hover:scale-105" />
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-5 pt-12 text-white">
                <p className="font-display text-xl">{activeMega.featured.title}</p>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Predictive search */}
      <div id="site-search" className={`absolute inset-x-0 top-full border-b border-line bg-paper shadow-[0_30px_60px_rgba(19,32,58,0.10)] transition-all duration-300 ${searchOpen ? "visible opacity-100" : "invisible -translate-y-2 opacity-0"}`}>
        {searchOpen && <SearchPanel onNavigate={() => setSearchOpen(false)} onSubmit={(q) => { setSearchOpen(false); router.push(`/search?q=${encodeURIComponent(q)}`); }} />}
      </div>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-[90] lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`} aria-hidden={!mobileOpen}>
        <div className={`absolute inset-0 bg-ink/40 transition-opacity duration-400 ${mobileOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setMobileOpen(false)} />
        <aside id="mobile-drawer" role="dialog" aria-modal="true" aria-label="Site navigation" className={`absolute inset-y-0 left-0 flex w-[88vw] max-w-sm flex-col bg-paper shadow-2xl transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)] ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <span className="font-display text-xl font-bold tracking-[0.04em]">FAN DRESS</span>
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu" className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand">{ICON.close}</button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="mb-5">
              <SearchPanel mobile onNavigate={() => setMobileOpen(false)} onSubmit={(q) => { setMobileOpen(false); router.push(`/search?q=${encodeURIComponent(q)}`); }} />
            </div>
            <ul className="divide-y divide-line border-y border-line text-[1.05rem]">
              <li><Link href="/" onClick={() => setMobileOpen(false)} className="flex min-h-14 items-center font-medium">Home</Link></li>
              {megas.map((m) => (
                <li key={m.key}>
                  <details className="group">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-medium">
                      {m.label}
                      <span className="transition group-open:rotate-45 text-xl" aria-hidden="true">+</span>
                    </summary>
                    <div className="space-y-5 pb-5">
                      {m.columns.map((col) => (
                        <div key={col.title}>
                          <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-stone uppercase">{col.title}</p>
                          <ul className="space-y-2">
                            {col.links.map((l) => (
                              <li key={l.href + l.label}>
                                <Link href={l.href} onClick={() => setMobileOpen(false)} className="block py-1.5 text-[0.95rem]">{l.label}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <Link href={m.href} onClick={() => setMobileOpen(false)} className="link-underline inline-block text-sm font-semibold">View all</Link>
                    </div>
                  </details>
                </li>
              ))}
              <li><Link href="/shop?sort=newest" onClick={() => setMobileOpen(false)} className="flex min-h-14 items-center font-medium">New Arrivals</Link></li>
              <li><Link href="/our-story" onClick={() => setMobileOpen(false)} className="flex min-h-14 items-center font-medium">Our Story</Link></li>
            </ul>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <Link href="/account" onClick={() => setMobileOpen(false)} className="btn btn-outline">Account</Link>
              <button type="button" onClick={() => { setMobileOpen(false); openCart(); }} className="btn btn-primary">Bag ({count})</button>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}

function SearchPanel({
  onSubmit,
  onNavigate,
  mobile = false,
}: {
  onSubmit: (q: string) => void;
  onNavigate: () => void;
  mobile?: boolean;
}) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const { cart } = useCart();

  useEffect(() => {
    if (!mobile) inputRef.current?.focus();
  }, [mobile]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setItems([]);
      setStatus("idle");
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        const data = await res.json();
        setItems(data.items ?? []);
        setStatus("done");
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    }, 220);
    return () => {
      window.clearTimeout(t);
      controller.abort();
    };
  }, [q]);

  void cart;
  const term = q.trim();
  return (
    <div className={mobile ? "" : "container-fd py-6"}>
      <form role="search" onSubmit={(e) => { e.preventDefault(); if (term) onSubmit(term); }} className="relative">
        <label htmlFor={mobile ? "search-mobile" : "search-desktop"} className="sr-only">Search Fan Dress</label>
        <input
          ref={inputRef}
          id={mobile ? "search-mobile" : "search-desktop"}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search teams, styles, sizes…"
          className="field h-14 rounded-full pl-6 pr-14 text-base"
          autoComplete="off"
          role="combobox"
          aria-expanded={items.length > 0}
          aria-controls="search-results"
        />
        <button type="submit" aria-label="Search" className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink text-white">
          {ICON.search}
        </button>
      </form>

      <div id="search-results" className="mt-4" aria-live="polite">
        {status === "loading" && <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>}
        {status === "error" && <p className="text-sm text-rose">Search is unavailable right now. Please try again.</p>}
        {status === "done" && items.length === 0 && term.length >= 2 && (
          <p className="text-sm text-stone">No matches for &ldquo;{term}&rdquo;. Try a team name like &ldquo;Texas A&amp;M&rdquo; or &ldquo;LSU&rdquo;.</p>
        )}
        {items.length > 0 && (
          <>
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={item.id}>
                  <Link href={`/products/${item.handle}`} onClick={onNavigate} className="flex items-center gap-4 py-3 transition hover:text-rose">
                    <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-sand">
                      {item.image && <Image src={item.image.url} alt="" fill sizes="56px" className="object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{item.title}</span>
                      <span className="block text-sm text-stone">{item.teamName} · {formatPrice(item.priceCents)}{!item.available && " · Sold out"}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => onSubmit(term)} className="link-underline mt-4 text-sm font-semibold">
              See all results for &ldquo;{term}&rdquo;
            </button>
          </>
        )}
      </div>
    </div>
  );
}
