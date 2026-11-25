import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart";
import { AnnouncementBar, SiteHeader } from "@/components/header";
import { SiteFooter } from "@/components/footer";
import { getCollections, getTeams } from "@/lib/catalog";
import { STORE } from "@/lib/config";
import "./globals.css";

// Storefront data is read from PostgreSQL at request time, so pages are always fresh.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(STORE.siteUrl),
  title: {
    default: "Fan Dress — Where Sports Passion Meets Feminine Style",
    template: "%s | Fan Dress",
  },
  description: STORE.description,
  applicationName: "Fan Dress",
  openGraph: {
    type: "website",
    siteName: "Fan Dress",
    title: "Fan Dress — Game Day. Your Way.",
    description: STORE.description,
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#13203a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [collections, teams] = await Promise.all([getCollections(), getTeams()]);
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: STORE.name,
    url: STORE.siteUrl,
    logo: `${STORE.siteUrl}/favicon.ico`,
    description: STORE.description,
    sameAs: [STORE.instagramUrl],
  };

  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <CartProvider>
          <AnnouncementBar />
          <SiteHeader
            collections={collections.map((c) => ({ handle: c.handle, title: c.title, imageUrl: c.imageUrl, imageAlt: c.imageAlt }))}
            teams={teams}
          />
          <main id="main" className="min-h-[60vh] overflow-x-hidden">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
