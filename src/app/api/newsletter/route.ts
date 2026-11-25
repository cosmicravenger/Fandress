import { NextResponse } from "next/server";
import { z } from "zod";
// No local database: signups are forwarded to Klaviyo only.

export const dynamic = "force-dynamic";

const CONSENT_EMAIL =
  "By signing up you agree to receive marketing emails from Fan Dress. You can unsubscribe at any time.";
const CONSENT_SMS =
  "By checking this box you agree to receive recurring automated marketing text messages from Fan Dress at the number provided. Consent is not a condition of purchase. Msg & data rates may apply. Reply STOP to cancel, HELP for help. See our Privacy Policy and Terms.";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(254),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((v) => (v ? v.replace(/[^\d+]/g, "") : undefined)),
  smsConsent: z.boolean().default(false),
  emailConsent: z.boolean().default(true),
  source: z.string().max(40).default("footer"),
});

/**
 * Stores the signup with explicit, timestamped consent. When KLAVIYO_PRIVATE_API_KEY
 * and KLAVIYO_LIST_ID are configured, the profile is also subscribed in Klaviyo
 * (email always; SMS only when the SMS consent box was checked separately).
 */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid submission." },
      { status: 400 },
    );
  }
  const data = parsed.data;
  if (data.smsConsent && (!data.phone || data.phone.replace(/\D/g, "").length < 10)) {
    return NextResponse.json(
      { ok: false, error: "Add a valid mobile number to receive text messages." },
      { status: 400 },
    );
  }
  const smsConsent = Boolean(data.smsConsent && data.phone);

  const klaviyo = await subscribeInKlaviyo({
    email: data.email,
    phone: smsConsent ? data.phone : undefined,
    smsConsent,
  });

  // Consent text kept for the Klaviyo subscription record (see CONSENT_* constants above).
  void (smsConsent ? `${CONSENT_EMAIL} ${CONSENT_SMS}` : CONSENT_EMAIL);

  return NextResponse.json({
    ok: true,
    message: klaviyo.status === "subscribed"
      ? "You're in. Watch your inbox for your welcome note."
      : "Thanks for signing up. You're on the list.",
    klaviyo: klaviyo.status,
  });
}

async function subscribeInKlaviyo({
  email,
  phone,
  smsConsent,
}: {
  email: string;
  phone?: string;
  smsConsent: boolean;
}): Promise<{ status: "subscribed" | "not_configured" | "failed" }> {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;
  if (!apiKey || !listId) return { status: "not_configured" };

  const now = new Date().toISOString();
  const subscriptions: Record<string, unknown> = {
    email: { marketing: { consent: "SUBSCRIBED", consent_timestamp: now } },
  };
  if (smsConsent && phone) {
    subscriptions.sms = { marketing: { consent: "SUBSCRIBED", consent_timestamp: now } };
  }

  try {
    const res = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        revision: process.env.KLAVIYO_REVISION || "2024-10-15",
        Authorization: `Klaviyo-API-Key ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            profiles: {
              data: [
                {
                  type: "profile",
                  attributes: {
                    email,
                    ...(smsConsent && phone ? { phone_number: phone } : {}),
                    subscriptions,
                  },
                },
              ],
            },
          },
          relationships: { list: { data: { type: "list", id: listId } } },
        },
      }),
    });
    return { status: res.ok ? "subscribed" : "failed" };
  } catch {
    return { status: "failed" };
  }
}
