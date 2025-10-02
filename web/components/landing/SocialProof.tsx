"use client";

import { useTranslations } from "next-intl";

export default function SocialProof() {
  const t = useTranslations("landing.social");

  return (
    <section className="container mt-10 sm:mt-14">
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-neutral-100)] bg-white p-5 sm:p-6 shadow-sm">
        <p className="text-sm sm:text-base text-[color:var(--color-neutral-800)]">
          <span className="font-semibold text-[color:var(--color-primary)]">
            {t("headline")}
          </span>{" "}
          {t("subhead")}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {/* Placeholder badges; replace with real partners/community logos later */}
          <span className="chip">{t("badges.0")}</span>
          <span className="chip">{t("badges.1")}</span>
          <span className="chip">{t("badges.2")}</span>
          <span className="chip">{t("badges.3")}</span>
        </div>
      </div>
    </section>
  );
}
