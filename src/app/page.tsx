import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { Carousel, Reveal } from "@/components/client-ui";
import { NewsletterForm } from "@/components/newsletter";
import { SectionHeading, Stars } from "@/components/ui";

import { getCollections, getFeaturedProducts, getNewArrivals, getPublishedReviews, getTeams } from "@/lib/catalog";
import { STORE } from "@/lib/config";

export default async function HomePage() {
  const [collections, bestSellers, newArrivals, teams, publishedReviews] = await Promise.all([
    getCollections(),
    getFeaturedProducts(10),
    getNewArrivals(6),
    getTeams(),
    getPublishedReviews(6),
  ]);
  const byHandle = (h: string) => collections.find((c) => c.handle === h);
  const heroImage = byHandle("womens-gameday-dresses")?.imageUrl ?? byHandle("womens-jersey-dresses")?.imageUrl;
  const storyImage = byHandle("texas-am-jersey-dress")?.imageUrl;

  const featured = [
    { href: "/collections/womens-jersey-dresses", title: "Women's Fan Dresses", body: "Patented jersey silhouettes with a feminine, game-day fit.", img: byHandle("womens-jersey-dresses")?.imageUrl, alt: byHandle("womens-jersey-dresses")?.imageAlt },
    { href: "/collections/girls-dresses", title: "Girls' Fan Dresses", body: "Twirl-ready designs for little fans, sized 2T to 10/11.", img: byHandle("girls-dresses")?.imageUrl, alt: byHandle("girls-dresses")?.imageAlt },
    { href: "/collections/infant-dresses", title: "Baby Fan Dresses", body: "Jersey dresses for the littlest fans, from 0–3 months.", img: byHandle("infant-dresses")?.imageUrl, alt: byHandle("infant-dresses")?.imageAlt },
    { href: "/collections/texas-am-jersey-dress", title: "College Collections", body: "Officially licensed university jersey dresses for the stands.", img: byHandle("texas-am-jersey-dress")?.imageUrl, alt: byHandle("texas-am-jersey-dress")?.imageAlt },
    { href: "/collections/womens-gameday-dresses", title: "Baseball Collections", body: "Ballpark-ready jersey dresses inspired by the diamond.", img: byHandle("womens-gameday-dresses")?.imageUrl, alt: byHandle("womens-gameday-dresses")?.imageAlt },
    { href: "/shop?sort=newest", title: "New Arrivals", body: "The latest drops, freshly added to the collection.", img: newArrivals[0]?.image?.url ?? null, alt: newArrivals[0]?.image?.alt ?? "New Fan Dress arrivals" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="relative h-[92svh] min-h-[620px] w-full md:h-[88vh]">
          {heroImage && (
            <Image src={heroImage} alt="Women wearing Fan Dress jersey dresses on game day" fill priority sizes="100vw" className="-z-10 object-cover object-[center_25%] opacity-95" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-transparent" aria-hidden="true" />
          <div className="container-fd relative flex h-full flex-col justify-end pb-16 pt-32 md:justify-center md:pb-0">
            <div className="max-w-2xl animate-fade-up">
              <p className="eyebrow !text-rose-200">Where sports passion meets feminine style</p>
              <h1 className="mt-5 text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] font-bold tracking-[-0.02em]">GAME DAY.<br />YOUR WAY.</h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85 md:text-lg">
                Your favorite teams. Your signature style. Discover officially licensed dresses designed to make every game day unforgettable.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/collections/womens-jersey-dresses" className="btn btn-light h-14 px-8">Shop women&apos;s dresses</Link>
                <Link href="/collections/girls-dresses" className="btn btn-ghost-light h-14 px-8">Shop girls&apos; collection</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section aria-label="Fan Dress highlights" className="border-b border-line bg-white">
        <ul className="container-fd grid grid-cols-2 gap-y-4 py-6 text-center text-[0.8rem] font-medium tracking-[0.08em] uppercase md:grid-cols-4">
          <li>Officially licensed</li>
          <li>Patented drawstring design</li>
          <li>Free shipping over ${STORE.freeShippingThreshold}</li>
          <li>Secure checkout by Shopify</li>
        </ul>
      </section>

      {/* FEATURED COLLECTIONS */}
      <section className="container-fd py-24" aria-labelledby="collections-heading">
        <SectionHeading eyebrow="Shop by collection" title="Dressed for every fan" action={<Link href="/shop" className="link-underline text-sm font-semibold">View all dresses</Link>} />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {featured.map((c, i) => (
            <Reveal as="li" key={c.title} delay={i * 80}>
              <Link href={c.href} className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-sand sm:aspect-[4/3] lg:aspect-[4/5]">
                {c.img && <Image src={c.img} alt={c.alt || c.title} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-[1400ms] ease-out group-hover:scale-105" />}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-7">
                  <h3 id={i === 0 ? "collections-heading" : undefined} className="text-2xl md:text-[1.7rem]">{c.title}</h3>
                  <p className="mt-2 max-w-xs text-sm text-white/85">{c.body}</p>
                  <span className="link-underline mt-4 inline-block text-sm font-semibold">Shop now →</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* BEST SELLERS */}
      <section className="bg-sand/50 py-24" aria-labelledby="best-sellers">
        <div className="container-fd">
          <SectionHeading eyebrow="Best sellers" title="The fan favorites" action={<Link href="/shop" className="link-underline text-sm font-semibold">Shop all</Link>} />
          <div className="mt-12">
            <Carousel label="Best selling products">
              {bestSellers.map((p, i) => (
                <div key={p.id} className="w-[70%] shrink-0 snap-start sm:w-[44%] lg:w-[25%] xl:w-[22%]">
                  <ProductCard product={p} priority={i < 2} />
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      </section>

      {/* SHOP BY TEAM */}
      <section className="container-fd py-24" aria-labelledby="teams-heading">
        <SectionHeading eyebrow="Shop by team" title="Your team, your dress" action={<Link href="/shop-by-team" className="link-underline text-sm font-semibold">All teams</Link>}>
          Officially licensed collections for the teams fans love. Pick your team and shop the full collection.
        </SectionHeading>
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:gap-6">
          {teams.map((t, i) => {
            const teamCol = collections.find((c) => (t.slug === "texas-am" ? c.handle === "texas-am-jersey-dress" : c.handle === "lsu-jersey-dress"));
            return (
              <Reveal as="li" key={t.slug} delay={i * 90}>
                <article className="group grid overflow-hidden rounded-3xl bg-white sm:grid-cols-[0.9fr_1.1fr]">
                  <div className="relative aspect-[4/3] bg-sand sm:aspect-auto">
                    {teamCol?.imageUrl && <Image src={teamCol.imageUrl} alt={teamCol.imageAlt || `${t.name} collection`} fill sizes="(min-width: 640px) 35vw, 100vw" className="object-cover transition duration-[1200ms] group-hover:scale-105" />}
                  </div>
                  <div className="flex flex-col justify-center p-7 md:p-9">
                    <p className="eyebrow">Officially licensed</p>
                    <h3 className="mt-3 text-3xl">{t.name}</h3>
                    <p className="mt-2 text-sm text-stone">{t.count} {t.count === 1 ? "style" : "styles"} available</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link href={`/shop?team=${t.slug}`} className="btn btn-primary h-12 px-6 text-[0.7rem]">Shop {t.name}</Link>
                      {teamCol && <Link href={`/collections/${teamCol.handle}`} className="btn btn-outline h-12 px-6 text-[0.7rem]">Collection</Link>}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* BRAND STORY */}
      <section className="bg-ink text-white" aria-labelledby="story-heading">
        <div className="container-fd grid items-center gap-12 py-24 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white/5">
              {storyImage && <Image src={storyImage} alt="A Fan Dress jersey dress styled for game day" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow !text-rose-200">Our story</p>
            <h2 id="story-heading" className="mt-4 text-[clamp(2.2rem,4.5vw,3.6rem)] leading-[1.05]">MORE THAN MERCHANDISE. A NEW WAY TO FAN.</h2>
            <blockquote className="mt-8 border-l-2 border-rose pl-6 font-display text-xl leading-relaxed text-white/90">
              &ldquo;I wanted an elevated jersey dress for my daughter and myself, so I designed it, patented it, and turned it into a brand for female fans everywhere.&rdquo;
              <footer className="mt-3 font-sans text-sm text-white/60">Allison Brockman, Founder</footer>
            </blockquote>
            <p className="mt-8 max-w-xl leading-relaxed text-white/80">
              Fan Dress created a new category of sports apparel designed specifically for women and girls. Jersey-inspired design meets a feminine silhouette, so fans can cheer in a look they feel confident in. We have secured three design patents, with three more pending, because originality matters to us.
            </p>
            <Link href="/our-story" className="btn btn-light mt-10 h-14 px-8">Read our story</Link>
          </Reveal>
        </div>
      </section>

      {/* SIGNATURE FEATURES */}
      <section className="container-fd py-24" aria-labelledby="features-heading">
        <SectionHeading eyebrow="Signature details" title="Designed for the game, styled for you" />
        <ul className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { t: "Jersey-inspired design", b: "The look of a classic jersey with a feminine, elevated silhouette." },
            { t: "Functional drawstring", b: "Tailor the fit at the waist for a flattering, customizable shape." },
            { t: "Partially lined", b: "Butter-soft lining in applicable women's styles, so it is never see-through where it matters." },
            { t: "Concealed chest closure", b: "Hidden Velcro or button chest closures keep the design clean and secure, depending on the style." },
          ].map((f, i) => (
            <Reveal as="li" key={f.t} delay={i * 80} className="rounded-3xl bg-white p-8 transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(19,32,58,0.08)]">
              <span className="font-display text-4xl text-rose" aria-hidden="true">0{i + 1}</span>
              <h3 className="mt-6 text-xl">{f.t}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-stone">{f.b}</p>
            </Reveal>
          ))}
        </ul>
        <p className="mt-6 text-sm text-stone">Features vary by style. Check each product page for the details that apply.</p>
      </section>

      {/* REVIEWS */}
      <section className="bg-white py-24" aria-labelledby="reviews-home">
        <div className="container-fd">
          <SectionHeading eyebrow="Verified reviews" title="Real reviews from verified buyers" />
          {publishedReviews.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-dashed border-line bg-paper p-10 text-center">
              <p className="font-display text-2xl">Reviews are on their way.</p>
              <p className="mx-auto mt-3 max-w-lg text-stone">
                We only show reviews from verified buyers. Once customers publish reviews, they appear here with star ratings and product links.
              </p>
              <Link href="/shop" className="btn btn-outline mt-7">Shop dresses</Link>
            </div>
          ) : (
            <ul className="mt-12 grid gap-6 md:grid-cols-3">
              {publishedReviews.map((r) => (
                <li key={r.id} className="rounded-3xl bg-paper p-7">
                  <Stars rating={r.rating} />
                  <p className="mt-4 leading-relaxed">&ldquo;{r.body}&rdquo;</p>
                  <p className="mt-5 text-sm font-semibold">{r.authorName}{r.verifiedBuyer ? " · Verified buyer" : ""}</p>
                  <Link href={`/shop`} className="link-underline mt-3 inline-block text-sm">Read product reviews</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* SOCIAL GALLERY */}
      <section className="container-fd py-24" aria-labelledby="social-heading">
        <SectionHeading eyebrow="Follow along" title="On the bleachers, on Instagram" action={<a href={STORE.instagramUrl} target="_blank" rel="noopener noreferrer" className="link-underline text-sm font-semibold">@fandressofficial</a>} />
        <ul className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {newArrivals.concat(bestSellers).slice(0, 6).map((p) => (
            <li key={p.id}>
              <a href={STORE.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${p.title} on Instagram`} className="group relative block aspect-square overflow-hidden rounded-2xl bg-sand">
                {p.image && <Image src={p.image.url} alt={p.image.alt} fill sizes="(min-width: 1024px) 16vw, 50vw" className="object-cover transition duration-[1000ms] group-hover:scale-105" />}
                <span className="absolute inset-0 grid place-items-center bg-ink/0 text-white opacity-0 transition duration-300 group-hover:bg-ink/40 group-hover:opacity-100 text-sm font-semibold">View on Instagram</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* NEWSLETTER */}
      <section className="container-fd pb-24" aria-labelledby="newsletter-home">
        <div className="grid gap-8 rounded-[2rem] bg-sand p-8 md:p-14 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow">Newsletter</p>
            <h2 id="newsletter-home" className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-tight">BE THE FIRST TO KNOW.</h2>
            <p className="mt-4 max-w-md leading-relaxed text-stone">Get exclusive updates, new arrivals, special promotions, and everything happening at Fan Dress.</p>
          </div>
          <NewsletterForm source="homepage" />
        </div>
      </section>
    </>
  );
}
