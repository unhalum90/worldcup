"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

type Interest = "home" | "hope" | "going";

interface CTASignupProps {
  onSuccess?: () => void;
}

export default function CTASignup({ onSuccess }: CTASignupProps) {
  const t = useTranslations("hero");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState<Interest>("home");
  const [consent, setConsent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Post to our subscribe API
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        interest,
        source: 'hero',
        tags: [interest]
      })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to subscribe');
        // success UI
        setEmail('');
        setInterest('home');
        setConsent(false);
        // analytics event (optional)
        if (typeof window !== 'undefined' && (window as any).gtag) {
          try { (window as any).gtag('event', 'subscribe', { method: 'hero' }); } catch {}
        }
        if (onSuccess) onSuccess();
      })
      .catch((err) => {
        console.error(err);
        alert('Sorry, we could not subscribe your email. Please try again later.');
      });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full"
      aria-describedby="cta-helper"
    >
      <div className="flex flex-col gap-4">
        {/* Email */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block" htmlFor="cta-email">
            {t("emailPlaceholder")}
          </label>
          <input
            id="cta-email"
            type="email"
            required
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 rounded-xl px-4 py-3 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-transparent transition-all"
          />
        </div>

        {/* Interest segmented control */}
        <fieldset className="mt-1">
          <legend className="text-sm font-semibold text-gray-700 mb-3">{t("interestLabel")}</legend>
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="flex-1">
              <input
                type="radio"
                name="interest"
                value="home"
                checked={interest === "home"}
                onChange={() => setInterest("home")}
                className="peer sr-only"
              />
              <span className="block text-center text-sm px-3 py-2.5 rounded-lg border-2 border-gray-200 cursor-pointer transition-all peer-checked:border-[color:var(--color-primary)] peer-checked:bg-[color:var(--color-primary)] peer-checked:text-white font-medium hover:border-gray-300">
                {t("interest.home")}
              </span>
            </label>
            <label className="flex-1">
              <input
                type="radio"
                name="interest"
                value="hope"
                checked={interest === "hope"}
                onChange={() => setInterest("hope")}
                className="peer sr-only"
              />
              <span className="block text-center text-sm px-3 py-2.5 rounded-lg border-2 border-gray-200 cursor-pointer transition-all peer-checked:border-[color:var(--color-primary)] peer-checked:bg-[color:var(--color-primary)] peer-checked:text-white font-medium hover:border-gray-300">
                {t("interest.hope")}
              </span>
            </label>
            <label className="flex-1">
              <input
                type="radio"
                name="interest"
                value="going"
                checked={interest === "going"}
                onChange={() => setInterest("going")}
                className="peer sr-only"
              />
              <span className="block text-center text-sm px-3 py-2.5 rounded-lg border-2 border-gray-200 cursor-pointer transition-all peer-checked:border-[color:var(--color-primary)] peer-checked:bg-[color:var(--color-primary)] peer-checked:text-white font-medium hover:border-gray-300">
                {t("interest.going")}
              </span>
            </label>
          </div>
        </fieldset>

        {/* Consent */}
        <label className="inline-flex items-start gap-3 mt-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="h-5 w-5 mt-0.5 rounded accent-[color:var(--color-accent-green)] cursor-pointer"
          />
          <span>
            {t("consent")}{" "}
            <span className="underline underline-offset-4 text-[color:var(--color-primary)] font-medium">
              Privacy
            </span>
          </span>
        </label>

        {/* Submit */}
        <div className="mt-2">
          <button
            type="submit"
            disabled={!consent || !email}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-[color:var(--color-accent-red)] hover:brightness-110 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base shadow-lg"
          >
            {t("cta")}
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>

        <p id="cta-helper" className="sr-only">
          This form does not store your data yet. It is a visual placeholder.
        </p>
      </div>
    </form>
  );
}
