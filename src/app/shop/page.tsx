import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { ProductListing } from "@/components/listing";
import { STORE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Shop All Jersey Dresses",
  description:
    "Shop officially licensed jersey dresses for women, girls and baby fans. Filter by team, size, product type, availability and price.",
  alternates: { canonical: `${STORE.siteUrl}/shop` },
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  return (
    <>
      <PageHero eyebrow="The full collection" title="Shop all fan dresses">
        Patented jersey-inspired dresses for every fan in the family. Filter by team, size and style to find your game-day look.
      </PageHero>
      <ProductListing basePath="/shop" searchParams={sp} />
    </>
  );
}
