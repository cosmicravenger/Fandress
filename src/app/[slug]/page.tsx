import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Accordion, PageHero, ProseSection } from "@/components/ui";
import { STORE } from "@/lib/config";

type Params = Promise<{ slug: string }>;

const PLACEHOLDER = (text: string) => (
  <mark className="rounded bg-gold/20 px-1 text-ink not-italic">[Placeholder: {text}]</mark>
);

type Page = { title: string; description: string; eyebrow: string; body: ReactNode };

/** Brand and policy pages share one template so typography and spacing stay consistent. */
const PAGES: Record<string, Page> = {
  "our-story": {
    eyebrow: "Our story",
    title: "A new way to fan",
    description: "Fan Dress was designed by an Aggie wife who wanted a jersey dress for herself and her daughter, and built a brand for female fans everywhere.",
    body: (
      <ProseSection>
        <p className="font-display text-2xl leading-snug text-ink">I WANTED AN ELEVATED JERSEY DRESS FOR MY DAUGHTER AND MYSELF, SO I DESIGNED IT, PATENTED IT, AND TURNED IT INTO A BRAND FOR FEMALE FANS EVERYWHERE.</p>
        <p>— Allison Brockman, Founder</p>
        <h2>Designed for women and girls who love their teams</h2>
        <p>Fan Dress offers a distinctive combination of sports jerseys and fashionable dresses. Our designs are for women and girls who want to show team pride without giving up their personal style.</p>
        <h2>Patented design</h2>
        <p>We believed in our designs from the very beginning, so we protected them. We have secured three design patents, with three more currently pending. That commitment to originality is at the center of everything we make.</p>
        <h2>Officially licensed</h2>
        <p>Our team collections are officially licensed. We only display team names and marks on products that carry the licensing statement.</p>
        <p><Link href="/shop" className="link-underline font-semibold text-ink">Shop the collection</Link></p>
      </ProseSection>
    ),
  },
  "our-team": {
    eyebrow: "Our team",
    title: "The people behind the jersey",
    description: "Meet the founder and the team that designs, sizes and ships Fan Dress.",
    body: (
      <ProseSection>
        <h2>Allison Brockman, Founder</h2>
        <p>Allison founded Fan Dress after designing the original women&apos;s jersey dress because it did not exist. She is an Aggie wife and a Texas A&amp;M alumna who shares the brand&apos;s story with fans across the country.</p>
        <h2>The team</h2>
        <p>{PLACEHOLDER("Add team members, roles and photos here. Edit this page content in the codebase or your CMS.")}</p>
      </ProseSection>
    ),
  },
  contact: {
    eyebrow: "Contact",
    title: "We would love to hear from you",
    description: "Questions about sizing, orders, or licensed collections? Reach the Fan Dress team.",
    body: (
      <ProseSection>
        <h2>Customer support</h2>
        <p>
          {STORE.supportEmail
            ? <>Email us at <a href={`mailto:${STORE.supportEmail}`}>{STORE.supportEmail}</a>.</>
            : PLACEHOLDER("Support email address. Set NEXT_PUBLIC_SUPPORT_EMAIL to display it.")}
        </p>
        <h2>Order questions</h2>
        <p>Have your order number ready. Track orders from your confirmation email or the <Link href="/account">account page</Link>.</p>
        <h2>Sizing help</h2>
        <p>Browse the <Link href="/faqs#sizing">sizing guide</Link> before you order. If you are still unsure, include your measurements and your child&apos;s age when you reach out.</p>
      </ProseSection>
    ),
  },
  faqs: {
    eyebrow: "Help center",
    title: "Frequently asked questions",
    description: "Answers about sizing, shipping, returns, licensing and checkout.",
    body: (
      <div id="faq">
        <h2 id="sizing" className="sr-only">Sizing</h2>
        <Accordion
          items={[
            { title: "How do I choose my size?", defaultOpen: true, body: "Each product page has a size selector and a size guide. If you fall between sizes, we recommend sizing up. Women's dresses include a drawstring to tailor the fit." },
            { title: "What sizes are available?", body: "Women's: XS to 2XL. Girls': 2T to 10/11. Baby: 0–3 months, 6–9 months and 12–18 months. Availability varies by style, and each product page shows the sizes in stock." },
            { title: "Are the dresses officially licensed?", body: "Team collections are officially licensed, and the product page states the licensing information for each style." },
            { title: "Is checkout secure?", body: "Yes. Checkout is handled by Shopify's secure checkout. Payment methods shown at checkout match this store's configuration." },
            { title: "Do you offer free shipping?", body: `Yes, on orders over $${STORE.freeShippingThreshold}. Shipping rates and taxes are calculated at checkout.` },
            { title: "How do I track my order?", body: "Use the tracking link in your shipping confirmation email, or sign in to your account." },
          ]}
        />
        <p className="mt-8 text-stone">Still need help? <Link href="/contact" className="link-underline text-ink">Contact us</Link>.</p>
      </div>
    ),
  },
  "shipping-returns": {
    eyebrow: "Policies",
    title: "Shipping & returns",
    description: "Shipping thresholds, delivery information and how returns work at Fan Dress.",
    body: (
      <ProseSection>
        <h2>Shipping</h2>
        <ul>
          <li>Free shipping on orders over ${STORE.freeShippingThreshold}.</li>
          <li>Shipping rates, delivery windows and taxes are calculated at checkout.</li>
          <li>{PLACEHOLDER("Processing time and carrier details from your Shopify shipping settings")}</li>
        </ul>
        <h2>Returns & exchanges</h2>
        <p>See the <Link href="/returns-exchanges">returns & exchanges policy</Link> for eligibility, timing and how to start a return.</p>
      </ProseSection>
    ),
  },
  "returns-exchanges": {
    eyebrow: "Policies",
    title: "Returns & exchanges",
    description: "How to return or exchange a Fan Dress order.",
    body: (
      <ProseSection>
        <h2>Return eligibility</h2>
        <p>{PLACEHOLDER("Return window, condition requirements and exceptions as approved by Fan Dress")}</p>
        <h2>How to start a return</h2>
        <p>{PLACEHOLDER("Return request steps, such as a Shopify return portal link or the support email")}</p>
        <h2>Exchanges</h2>
        <p>{PLACEHOLDER("Exchange process and sizing swap policy")}</p>
      </ProseSection>
    ),
  },
  "privacy-policy": {
    eyebrow: "Legal",
    title: "Privacy policy",
    description: "How Fan Dress collects, uses and protects your information.",
    body: (
      <ProseSection>
        <p>{PLACEHOLDER("Replace with the approved privacy policy from your legal team")}</p>
        <h2>Marketing messages</h2>
        <p>We send marketing emails only to people who opt in. Text messages are sent only to people who give separate SMS consent. You can unsubscribe at any time, and message and data rates may apply.</p>
      </ProseSection>
    ),
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms & conditions",
    description: "The terms that apply when you use the Fan Dress website and place an order.",
    body: (
      <ProseSection>
        <p>{PLACEHOLDER("Replace with the approved terms and conditions from your legal team")}</p>
      </ProseSection>
    ),
  },
  account: {
    eyebrow: "Customer account",
    title: "Your account",
    description: "Sign in to view orders, track shipments and manage your details.",
    body: (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-8">
          <h2 className="text-2xl">Sign in or create an account</h2>
          <p className="mt-3 text-stone">Your account is managed by Fan Dress&apos;s secure Shopify customer accounts.</p>
          <a href={`${STORE.shopifyUrl}/account`} className="btn btn-primary mt-7 w-full">Continue to account</a>
        </div>
        <div className="rounded-3xl bg-sand p-8">
          <h2 className="text-2xl">Order help</h2>
          <p className="mt-3 text-stone">Track orders, update addresses and manage marketing preferences from your account.</p>
          <Link href="/contact" className="link-underline mt-7 inline-block font-semibold">Contact support</Link>
        </div>
      </div>
    ),
  },
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) return { title: "Page not found" };
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `${STORE.siteUrl}/${slug}` },
  };
}

export default async function ContentPage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title}>{page.description}</PageHero>
      <div className="container-fd py-16 md:py-24">{page.body}</div>
    </>
  );
}
