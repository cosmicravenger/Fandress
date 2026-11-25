import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Accordion, SectionHeading, Stars } from "@/components/ui";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchase, StickyBuyBar } from "@/components/product-purchase";
import { ProductCard } from "@/components/product-card";
import { Carousel, Reveal } from "@/components/client-ui";
import { RecentlyViewed } from "@/components/recently-viewed";
import { getCollections, getOtherProducts, getProductByHandle, getRelatedProducts } from "@/lib/catalog";
import { STORE, AUDIENCES } from "@/lib/config";
import { formatPrice } from "@/lib/format";

type Params = Promise<{ handle: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { handle } = await params;
  const data = await getProductByHandle(handle);
  if (!data) return { title: "Product not found" };
  const p = data.product;
  const description = `${p.title} — officially licensed Fan Dress jersey dress. ${formatPrice(p.priceCents)}. Patented drawstring jersey design.`;
  return {
    title: p.title,
    description: description.slice(0, 160),
    alternates: { canonical: `${STORE.siteUrl}/products/${p.handle}` },
    openGraph: {
      title: p.title,
      description: description.slice(0, 160),
      images: data.images[0] ? [data.images[0].url] : [],
    },
  };
}

function plainText(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;|’/g, "'").replace(/\s+/g, " ").trim();
}

function extractFeatures(html: string) {
  const items = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => plainText(m[1])).filter(Boolean);
  return items.filter((t) => !/^sizing|^officially licensed$/i.test(t)).slice(0, 7);
}

function fabricNotes(html: string) {
  const text = plainText(html);
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.filter((s) => /polyester|fabric|wash|care|cotton|lining|breathable/i.test(s)).slice(0, 5);
}

const TEAM_COLLECTIONS: Record<string, string[]> = {
  "texas-am": ["texas-am-jersey-dress"],
  lsu: ["lsu-jersey-dress"],
};

export default async function ProductPage({ params }: { params: Params }) {
  const { handle } = await params;
  const data = await getProductByHandle(handle);
  if (!data) notFound();

  const { product, images, variants, reviews } = data;
  const audienceLabel = AUDIENCES.find((a) => a.slug === product.audience)?.label ?? "Women's";
  const sizeChartUrl = images.find((i) => /size_chart/i.test(i.url))?.url ?? null;
  const galleryImages = images.filter((i) => !/size_chart/i.test(i.url));
  const features = extractFeatures(product.descriptionHtml);
  const fabric = fabricNotes(product.descriptionHtml);
  const licensed = /officially licensed/i.test(product.descriptionHtml) || /officially licensed/i.test(product.tags);
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const [related, others, collections] = await Promise.all([
    getRelatedProducts(product, 4),
    getOtherProducts(product.id, 4),
    getCollections(),
  ]);
  const teamCollections = (TEAM_COLLECTIONS[product.teamSlug] ?? [])
    .map((h) => collections.find((c) => c.handle === h))
    .filter((c): c is (typeof collections)[number] => Boolean(c));
  const audienceCollection = collections.find((c) =>
    product.audience === "baby" ? c.handle === "infant-dresses" : product.audience === "girls" ? c.handle === "girls-dresses" : c.handle === "womens-jersey-dresses",
  );
  const completeLook = related.filter((p) => p.id !== product.id).slice(0, 4);

  const variantData = variants.map((v) => ({
    id: v.id,
    size: v.size,
    available: v.available,
    priceCents: v.priceCents,
    compareAtCents: v.compareAtCents,
  }));

  const url = `${STORE.siteUrl}/products/${product.handle}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: plainText(product.descriptionHtml).slice(0, 500),
    brand: { "@type": "Brand", name: STORE.name },
    image: images.map((i) => i.url),
    sku: product.id,
    url,
    category: `${audienceLabel} jersey dress`,
    ...(reviews.length
      ? {
          aggregateRating: { "@type": "AggregateRating", ratingValue: avgRating.toFixed(1), reviewCount: reviews.length },
          review: reviews.map((r) => ({
            "@type": "Review",
            reviewRating: { "@type": "Rating", ratingValue: r.rating },
            author: { "@type": "Person", name: r.authorName },
            reviewBody: r.body,
          })),
        }
      : {}),
    offers: variants.map((v) => ({
      "@type": "Offer",
      sku: String(v.id),
      name: `${product.title} — ${v.size}`,
      price: (v.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: v.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url,
      itemCondition: "https://schema.org/NewCondition",
    })),
  };

  const sizeNote = product.audience === "baby"
    ? "Infant sizes are by age range. Fit is true to size."
    : product.audience === "girls"
      ? "If between sizes, we recommend sizing up."
      : "If between sizes, we recommend sizing up. Use the size guide and the drawstring to tailor the fit.";

  const productImages = galleryImages.length ? galleryImages : images;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-fd pb-28 pt-6 md:pb-24 md:pt-10">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-stone">
          <ol className="flex flex-wrap gap-2">
            <li><Link href="/" className="hover:text-ink">Home</Link> <span aria-hidden="true">/</span></li>
            <li><Link href={audienceCollection ? `/collections/${audienceCollection.handle}` : "/shop"} className="hover:text-ink">{audienceLabel}</Link> <span aria-hidden="true">/</span></li>
            <li aria-current="page" className="text-ink">{product.title}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <ProductGallery images={productImages.map((i) => ({ url: i.url, alt: i.alt, width: i.width, height: i.height }))} title={product.title} />

          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link href={`/shop?team=${product.teamSlug}`} className="font-medium text-rose hover:underline underline-offset-4">{product.teamName}</Link>
              <span className="text-line" aria-hidden="true">|</span>
              <span className="text-stone">{audienceLabel}</span>
            </div>
            <h1 className="mt-3 text-[clamp(2rem,4vw,2.9rem)] leading-[1.08]">{product.title}</h1>
            <div className="mt-3 flex items-center gap-3 text-sm">
              {reviews.length > 0 ? (
                <>
                  <Stars rating={avgRating} />
                  <a href="#reviews" className="link-underline text-stone">{reviews.length} verified {reviews.length === 1 ? "review" : "reviews"}</a>
                </>
              ) : (
                <a href="#reviews" className="link-underline text-stone">Be the first to review</a>
              )}
            </div>

            <div className="mt-8">
              <ProductPurchase
                product={{
                  id: product.id,
                  title: product.title,
                  teamName: product.teamName,
                  audience: product.audience,
                  sizeOption: product.sizeOption,
                  priceCents: product.priceCents,
                  compareAtCents: product.compareAtCents,
                  sizeChartUrl,
                }}
                variants={variantData}
              />
            </div>

            {features.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg">Features</h2>
                <ul className="mt-4 grid gap-3 text-[0.95rem] text-ink-soft">
                  {features.map((f) => (
                    <li key={f} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose" aria-hidden="true" />{f}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-10 rounded-3xl border border-line bg-white p-5">
              <p className="text-sm font-semibold">{licensed ? "Officially licensed" : "Licensing details"}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone">
                {licensed
                  ? `${product.teamName} names and marks are used under license on this Fan Dress product, as stated in the product description.`
                  : "Licensing details for this product are not listed yet. Contact us for more information."}
              </p>
            </div>

            <div className="mt-8">
              <Accordion
                items={[
                  {
                    title: "Product details",
                    defaultOpen: true,
                    body: <div className="prose-fd space-y-3 [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />,
                  },
                  {
                    title: "Size & fit",
                    body: (
                      <div className="space-y-3">
                        <p>{sizeNote}</p>
                        <p>
                          Sizes for this style: {variants.map((v) => v.size).join(", ")}.{" "}
                          <Link href="/faqs#sizing" className="link-underline text-ink">Read the full sizing guide</Link>.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Fabric & care",
                    body: (
                      <ul className="list-disc space-y-2 pl-5">
                        {(fabric.length ? fabric : ["See product details for fabric composition and care information."]).map((f) => <li key={f}>{f}</li>)}
                      </ul>
                    ),
                  },
                  {
                    title: "Shipping & returns",
                    body: (
                      <div className="space-y-3">
                        <p>Free shipping on orders over ${STORE.freeShippingThreshold}. Shipping rates and delivery times are shown at Shopify checkout.</p>
                        <p>
                          See our <Link href="/shipping-returns" className="link-underline text-ink">shipping policy</Link> and{" "}
                          <Link href="/returns-exchanges" className="link-underline text-ink">returns & exchanges</Link>.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Licensing information",
                    body: (
                      <p>
                        {licensed
                          ? `Officially licensed ${product.teamName} product. Fan Dress designs are patent-protected.`
                          : "Licensing information for this product is listed on request. Contact us for details."}
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>

        <section id="reviews" className="mt-24 scroll-mt-32 border-t border-line pt-16" aria-labelledby="reviews-heading">
          <SectionHeading eyebrow="Customer reviews" title="What fans are saying">
            Reviews are only shown from verified purchasers. We never display invented or placeholder reviews.
          </SectionHeading>
          {reviews.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-line bg-white p-8 text-center md:p-12">
              <p className="font-display text-2xl">No reviews have been published for this style yet.</p>
              <p className="mx-auto mt-3 max-w-md text-stone">
                Once you have worn your Fan Dress, verified buyer reviews can be published here. Until then, our sizing guide and product details can help you choose.
              </p>
              <Link href="/faqs#sizing" className="btn btn-outline mt-6">Sizing help</Link>
            </div>
          ) : (
            <ul className="mt-10 grid gap-6 md:grid-cols-2">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-3xl bg-white p-6">
                  <Stars rating={r.rating} />
                  <p className="mt-4 leading-relaxed">&ldquo;{r.body}&rdquo;</p>
                  <p className="mt-4 text-sm font-semibold">{r.authorName} {r.verifiedBuyer && <span className="ml-2 rounded-full bg-sand px-2 py-0.5 text-xs font-medium text-stone">Verified buyer</span>}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {completeLook.length > 0 && (
          <section className="mt-24" aria-labelledby="complete-look">
            <SectionHeading eyebrow="Complete the look" title="More from the team"></SectionHeading>
            <div className="mt-10">
              <Carousel label="Complete the look products">
                {completeLook.map((p) => (
                  <div key={p.id} className="w-[72%] shrink-0 snap-start sm:w-[44%] lg:w-[24%]"><ProductCard product={p} /></div>
                ))}
              </Carousel>
            </div>
          </section>
        )}

        {others.length > 0 && (
          <section className="mt-24" aria-labelledby="also-like">
            <SectionHeading eyebrow="You may also like" title="More jersey dresses" action={<Link href="/shop" className="link-underline text-sm font-semibold">Shop all</Link>} />
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {others.map((p, i) => (
                <Reveal as="li" key={p.id} delay={i * 60}><ProductCard product={p} /></Reveal>
              ))}
            </ul>
          </section>
        )}

        {teamCollections.length > 0 && (
          <section className="mt-24" aria-labelledby="team-collections">
            <SectionHeading eyebrow="Related team collections" title={`More from ${product.teamName}`} />
            <ul className="mt-10 grid gap-4 md:grid-cols-2">
              {teamCollections.map((c) => (
                <li key={c.id}>
                  <Link href={`/collections/${c.handle}`} className="group flex items-center justify-between gap-6 rounded-3xl bg-white p-6 transition hover:shadow-[0_18px_50px_rgba(19,32,58,0.08)]">
                    <span>
                      <span className="block font-display text-2xl">{c.title}</span>
                      <span className="mt-1 block text-sm text-stone">Shop the full {product.teamName} collection</span>
                    </span>
                    <span aria-hidden="true" className="text-xl transition group-hover:translate-x-1">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-24" aria-label="Recently viewed">
          <RecentlyViewed current={{ handle: product.handle, title: product.title, imageUrl: images[0]?.url ?? null, priceCents: product.priceCents, teamName: product.teamName }} />
        </section>
      </div>

      <StickyBuyBar title={product.title} priceCents={product.priceCents} compareAtCents={product.compareAtCents} variants={variantData} />
    </>
  );
}
