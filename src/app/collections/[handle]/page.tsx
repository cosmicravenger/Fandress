import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/listing";
import { getCollectionByHandle } from "@/lib/catalog";
import { STORE } from "@/lib/config";

type Params = Promise<{ handle: string }>;
type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { handle } = await params;
  const c = await getCollectionByHandle(handle);
  if (!c) return { title: "Collection not found" };
  const description = c.description || `Shop ${c.title} from Fan Dress — officially licensed jersey dresses for game day.`;
  return {
    title: c.title,
    description: description.slice(0, 160),
    alternates: { canonical: `${STORE.siteUrl}/collections/${c.handle}` },
    openGraph: { title: c.title, description: description.slice(0, 160), images: c.imageUrl ? [c.imageUrl] : [] },
  };
}

export default async function CollectionPage({ params, searchParams }: { params: Params; searchParams: SP }) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);
  if (!collection) notFound();
  const sp = await searchParams;

  return (
    <>
      <section className="border-b border-line bg-sand/50">
        <div className="container-fd grid items-center gap-10 py-12 md:grid-cols-[1fr_0.9fr] md:py-16">
          <div className="animate-fade-up">
            <nav aria-label="Breadcrumb" className="mb-5 text-sm text-stone">
              <Link href="/" className="hover:text-ink">Home</Link> <span aria-hidden="true">/</span> <Link href="/shop" className="hover:text-ink">Shop</Link> <span aria-hidden="true">/</span> <span className="text-ink">{collection.title}</span>
            </nav>
            <p className="eyebrow mb-4">Collection</p>
            <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.02]">{collection.title}</h1>
            {collection.description && <p className="mt-5 max-w-xl text-base leading-relaxed text-stone md:text-lg">{collection.description}</p>}
          </div>
          {collection.imageUrl && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand md:aspect-[5/4]">
              <Image src={collection.imageUrl} alt={collection.imageAlt || collection.title} fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
            </div>
          )}
        </div>
      </section>
      <ProductListing basePath={`/collections/${collection.handle}`} searchParams={sp} collectionId={collection.id} />
    </>
  );
}
