import type { Metadata } from "next";
import { CartPageView } from "@/components/cart";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Your Bag",
  description: "Review your Fan Dress bag, update quantities and check out securely with Shopify.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <PageHero eyebrow="Your bag" title="Ready for game day?" />
      <div className="container-fd py-12 pb-28">
        <CartPageView />
      </div>
    </>
  );
}
