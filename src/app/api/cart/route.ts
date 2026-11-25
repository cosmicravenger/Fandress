import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { findVariant } from "@/lib/catalog";
import { CART_COOKIE, applyAction, parseCart, readCart, serializeCart } from "@/lib/cart";

export const dynamic = "force-dynamic";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("add"), variantId: z.string().min(1).max(40), quantity: z.number().int().min(1).max(20).default(1) }),
  z.object({ action: z.literal("update"), variantId: z.string().min(1).max(40), quantity: z.number().int().min(0).max(20) }),
  z.object({ action: z.literal("remove"), variantId: z.string().min(1).max(40) }),
]);

export async function GET() {
  const raw = (await cookies()).get(CART_COOKIE)?.value;
  return NextResponse.json({ ok: true, cart: readCart(parseCart(raw)) });
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid cart request." }, { status: 400 });
  }
  const input = parsed.data;

  if (input.action === "add") {
    const hit = findVariant(input.variantId);
    if (!hit) return NextResponse.json({ ok: false, error: "That size is no longer available." }, { status: 404 });
    if (!hit.variant.available) return NextResponse.json({ ok: false, error: "Sorry, this size is sold out." }, { status: 409 });
  }

  const quantity = input.action === "remove" ? 0 : input.quantity;
  const raw = (await cookies()).get(CART_COOKIE)?.value;
  const next = applyAction(parseCart(raw), input.action, input.variantId, quantity);

  const response = NextResponse.json({ ok: true, cart: readCart(next) });
  response.cookies.set(CART_COOKIE, serializeCart(next), cookieOptions);
  return response;
}
