/**
 * Central store configuration. Values come from environment variables so the
 * store owner can change them without editing components.
 */
export const STORE = {
  name: "Fan Dress",
  tagline: "Where Sports Passion Meets Feminine Style.",
  description:
    "Officially licensed jersey dresses for women, girls and baby fans. Patented drawstring jersey designs for game day.",
  // Public Shopify storefront domain. Product feed + native checkout live here.
  shopifyUrl: (process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || "https://fandress.com").replace(/\/$/, ""),
  // Free shipping threshold (USD). Mirrors the Shopify shipping rule configured in admin.
  freeShippingThreshold: Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || 100),
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/fandressofficial/",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
  announcements: (
    process.env.NEXT_PUBLIC_ANNOUNCEMENTS ||
    "Free Shipping on Orders Over $100|Officially Licensed Fan Apparel|New Collections Just Arrived"
  ).split("|"),
};

export const SIZE_ORDER = [
  "0-3m", "6-9m", "12-18m",
  "2t", "3t", "4t", "5t", "6/7", "8/9", "10/11",
  "XS", "S", "M", "L", "XL", "2XL",
];

export function sizeRank(size: string) {
  const i = SIZE_ORDER.indexOf(size);
  return i === -1 ? 999 : i;
}

export const AUDIENCES = [
  { slug: "women", label: "Women's" },
  { slug: "girls", label: "Girls'" },
  { slug: "baby", label: "Baby & Infant" },
] as const;
