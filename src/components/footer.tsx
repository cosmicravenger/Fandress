import Link from "next/link";
import { STORE } from "@/lib/config";
import { NewsletterForm } from "@/components/newsletter";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Shop All", href: "/shop" },
      { label: "Women's Collection", href: "/collections/womens-jersey-dresses" },
      { label: "Girls' Collection", href: "/collections/girls-dresses" },
      { label: "Baby Collection", href: "/collections/infant-dresses" },
      { label: "Shop by Team", href: "/shop-by-team" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
    ],
  },
  {
    title: "Fan Dress",
    links: [
      { label: "Our Story", href: "/our-story" },
      { label: "Our Team", href: "/our-team" },
      { label: "FAQs", href: "/faqs" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Shipping & Returns", href: "/shipping-returns" },
      { label: "Returns & Exchanges", href: "/returns-exchanges" },
      { label: "Size Guide", href: "/faqs#sizing" },
      { label: "Account", href: "/account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
];

const PAYMENTS = ["Visa", "Mastercard", "American Express", "Discover", "Apple Pay", "Google Pay", "Shop Pay", "PayPal"];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="container-fd grid gap-14 py-16 lg:grid-cols-[1.1fr_1.4fr] lg:gap-20 lg:py-24">
        <div>
          <p className="eyebrow !text-rose-200">Be the first to know</p>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-tight">BE THE FIRST TO KNOW.</h2>
          <p className="mt-4 max-w-md text-white/75 leading-relaxed">
            Get exclusive updates, new arrivals, special promotions, and everything happening at Fan Dress.
          </p>
          <div className="mt-8">
            <NewsletterForm tone="dark" source="footer" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {columns.map((col) => (
            <nav key={col.title} aria-label={`${col.title} links`}>
              <h3 className="mb-5 text-xs font-semibold tracking-[0.2em] text-white/60 uppercase">{col.title}</h3>
              <ul className="space-y-3 text-[0.95rem]">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/85 transition hover:text-white hover:underline underline-offset-4">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-fd flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-5">
            <a href={STORE.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Fan Dress on Instagram" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 transition hover:bg-white hover:text-ink">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" /></svg>
            </a>
            <p className="text-sm text-white/60">© {new Date().getFullYear()} Fan Dress. Officially licensed fan apparel.</p>
          </div>
          <p className="flex items-center gap-2 text-xs text-white/60">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></svg>
            Checkout is secure and handled by Shopify. Accepted payment methods are shown at checkout.
          </p>
        </div>
        <p className="container-fd pb-8 text-xs leading-relaxed text-white/50">
          Officially licensed fan apparel. Team names and marks appear only on products that carry the licensing statement on their product page.
        </p>
      </div>
    </footer>
  );
}
