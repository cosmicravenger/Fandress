"use client";

import { useState, type FormEvent } from "react";

/** Email + optional SMS signup. SMS consent is a separate, unchecked-by-default checkbox. */
export function NewsletterForm({ tone = "light", source = "footer" }: { tone?: "light" | "dark"; source?: string }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailConsent, setEmailConsent] = useState(true);
  const [smsConsent, setSmsConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const dark = tone === "dark";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!emailConsent && !smsConsent) {
      setStatus("error");
      setMessage("Choose at least one way to hear from us.");
      return;
    }
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, phone, emailConsent, smsConsent, source }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus("success");
      setMessage(data.message);
      setEmail("");
      setPhone("");
      setSmsConsent(false);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const labelClass = `text-sm leading-relaxed ${dark ? "text-white/80" : "text-stone"}`;

  return (
    <form onSubmit={onSubmit} noValidate className="w-full" aria-describedby={`nl-status-${source}`}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={`nl-email-${source}`} className="sr-only">Email address</label>
          <input
            id={`nl-email-${source}`}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className={`field h-14 rounded-full ${dark ? "border-white/20 bg-white/5 text-white placeholder:text-white/60" : ""}`}
          />
        </div>
        <button type="submit" disabled={status === "submitting"} className={`btn h-14 ${dark ? "btn-light" : "btn-primary"} sm:px-8`}>
          {status === "submitting" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <label className={`flex items-start gap-3 ${labelClass}`}>
          <input type="checkbox" checked={emailConsent} onChange={(e) => setEmailConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-ink" />
          <span>Email me new arrivals, exclusive offers and Fan Dress news.</span>
        </label>
        <label className={`flex items-start gap-3 ${labelClass}`}>
          <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-ink" />
          <span>Text me exclusive offers and product drops (optional).</span>
        </label>
        {smsConsent && (
          <div className="pl-7">
            <label htmlFor={`nl-phone-${source}`} className={`mb-2 block text-sm font-medium ${dark ? "text-white" : ""}`}>Mobile number</label>
            <input
              id={`nl-phone-${source}`}
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 555-0123"
              className={`field h-12 max-w-xs rounded-full ${dark ? "border-white/20 bg-white/5 text-white placeholder:text-white/60" : ""}`}
            />
          </div>
        )}
        <p className={`text-xs leading-relaxed ${dark ? "text-white/60" : "text-stone"}`}>
          {smsConsent
            ? "By checking the text box you agree to receive recurring automated marketing text messages from Fan Dress at the number provided. Consent is not a condition of purchase. Msg & data rates may apply. Reply STOP to cancel, HELP for help. "
            : ""}
          By subscribing you agree to our{" "}
          <a href="/privacy-policy" className="underline underline-offset-4">Privacy Policy</a> and{" "}
          <a href="/terms" className="underline underline-offset-4">Terms</a>. You can unsubscribe at any time.
        </p>
      </div>

      <p id={`nl-status-${source}`} role="status" aria-live="polite" className={`mt-3 min-h-5 text-sm font-medium ${status === "error" ? (dark ? "text-rose-200" : "text-rose") : dark ? "text-white" : "text-ink"}`}>
        {message}
      </p>
    </form>
  );
}
