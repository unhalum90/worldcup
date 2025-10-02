"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

type Interest = "home" | "hope" | "going";

export default function CTASignup() {
  const t = useTranslations("hero");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState<Interest>("home");
  const [consent, setConsent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // No-op submit for this phase
    // Placeholder: this is where we will later POST to Supabase or Formspree
    // eslint-disable-next-line no-console
    console.log("CTA submit (no-op)", {
      email,
      interest,
      consent,
      locale:
        typeof document !== "undefined" ? document.documentElement.lang : "en",
    });
    // Optional UX: simple success UI reset
    setEmail("");
    setInterest("home");
    setConsent(false);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-xl rounded-[var(--radius-lg)] border border-[color:var(--color-neutral-100)] p-4 sm:p-5 bg-white shadow-sm"
      aria-describedby="cta-helper"
    >
      <div className="flex flex-col gap-3">
        {/* Email */}
        <label className="text-sm font-medium" htmlFor="cta-email">
          {t("emailPlaceholder")}
        </label>
        <input
          id="cta-email"
          type="email"
          required
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-md px-3 py-2 border-[color:var(--color-neutral-100)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
        />

        {/* Interest segmented control */}
        <fieldset className="mt-2">
          <legend className="text-sm font-medium mb-2">{t("interestLabel")}</legend>
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
              <span className="block text-center px-3 py-2 rounded-md border border-[color:var(--color-neutral-100)] cursor-pointer peer-checked:border-[color:var(--color-primary)] peer-checked:bg-[color:var(--color-neutral-100)]">
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
              <span className="block text-center px-3 py-2 rounded-md border border-[color:var(--color-neutral-100)] cursor-pointer peer-checked:border-[color:var(--color-primary)] peer-checked:bg-[color:var(--color-neutral-100)]">
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
              <span className="block text-center px-3 py-2 rounded-md border border-[color:var(--color-neutral-100)] cursor-pointer peer-checked:border-[color:var(--color-primary)] peer-checked:bg-[color:var(--color-neutral-100)]">
                {t("interest.going")}
              </span>
            </label>
          </div>
        </fieldset>

        {/* Consent */}
        <label className="inline-flex items-center gap-2 mt-3 text-sm">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="h-4 w-4 accent-[color:var(--color-accent-green)]"
          />
          <span>
            {t("consent")}{" "}
            <span className="underline underline-offset-4 text-[color:var(--color-primary)]">
              Privacy
            </span>
          </span>
        </label>

        {/* Submit */}
        <div className="mt-4">
          <button
            type="submit"
            disabled={!consent || !email}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md font-semibold text-white bg-[color:var(--color-accent-red)] hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("cta")}
          </button>
        </div>

        <p id="cta-helper" className="sr-only">
          This form does not store your data yet. It is a visual placeholder.
        </p>
      </div>
    </form>
  );
}
