import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/client-ui";
import { PageHero } from "@/components/ui";
import { getCollections, getTeams } from "@/lib/catalog";
import { STORE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Shop by Team",
  description: "Officially licensed Fan Dress jersey dresses by team. Find your team and shop the collection.",
  alternates: { canonical: `${STORE.siteUrl}/shop-by-team` },
};

export default async function ShopByTeamPage() {
  const [teams, collections] = await Promise.all([getTeams(), getCollections()]);
  return (
    <>
      <PageHero eyebrow="Shop by team" title="Find your team">
        Officially licensed jersey dresses for the teams fans love. Choose a team to see every style, size and price available.
      </PageHero>
      <div className="container-fd py-16 md:py-24">
        <ul className="grid gap-6 md:grid-cols-2">
          {teams.map((t, i) => {
            const col = collections.find((c) => (t.slug === "texas-am" ? c.handle === "texas-am-jersey-dress" : c.handle === "lsu-jersey-dress"));
            return (
              <Reveal as="li" key={t.slug} delay={i * 80}>
                <article className="group overflow-hidden rounded-3xl bg-white">
                  <div className="relative aspect-[16/9] bg-sand">
                    {col?.imageUrl && <Image src={col.imageUrl} alt={col.imageAlt || `${t.name} collection`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-[1200ms] group-hover:scale-105" />}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4 p-7">
                    <div>
                      <h2 className="text-3xl">{t.name}</h2>
                      <p className="mt-1 text-sm text-stone">{t.count} {t.count === 1 ? "style" : "styles"} · Officially licensed</p>
                    </div>
                    <div className="flex gap-3">
                      <Link href={`/shop?team=${t.slug}`} className="btn btn-primary h-12 px-6 text-[0.7rem]">Shop team</Link>
                      {col && <Link href={`/collections/${col.handle}`} className="btn btn-outline h-12 px-6 text-[0.7rem]">Collection</Link>}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>
        {teams.length === 0 && <p className="text-center text-stone">Team collections will appear here once the catalog is synced.</p>}
      </div>
    </>
  );
}
