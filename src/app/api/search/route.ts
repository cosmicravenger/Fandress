import { NextResponse } from "next/server";
import { searchCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/** Predictive search: returns up to 8 matching products (title, tags, team). */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ ok: true, items: [] });
  const items = await searchCatalog(q.slice(0, 80));
  return NextResponse.json({
    ok: true,
    items: items.map((p) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      teamName: p.teamName,
      priceCents: p.priceCents,
      available: p.available,
      image: p.image ? { url: p.image.url, alt: p.image.alt } : null,
    })),
  });
}
