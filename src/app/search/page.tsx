import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { ProductListing } from "@/components/listing";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Fan Dress jersey dresses by team, style or size.",
  robots: { index: false, follow: true },
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const raw = sp.q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  return (
    <>
      <PageHero eyebrow="Search" title={q ? `Results for “${q}”` : "Search the collection"}>
        {q ? "Matching dresses across all teams and styles." : "Search by team, style or keyword, for example “LSU” or “baby”."}
      </PageHero>
      {q ? (
        <ProductListing basePath="/search" searchParams={sp} emptyText="Try a team name, a style, or browse the full collection." />
      ) : (
        <div className="container-fd py-16 text-center">
          <a href="/shop" className="btn btn-primary">Browse all dresses</a>
        </div>
      )}
    </>
  );
}
