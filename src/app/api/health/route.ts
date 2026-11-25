export const dynamic = "force-dynamic";

/** Health check. Does not depend on any database. */
export async function GET() {
  return Response.json({ ok: true });
}
