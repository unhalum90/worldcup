"use client";

import { useTranslations } from "next-intl";

export default function FAQ() {
  const t = useTranslations("landing.faq");
  const items = t.raw("items") as { q: string; a: string }[];

  return (
    <section id="faq" className="container mt-12 sm:mt-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">{t("title")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {items.map((it, idx) => (
          <div
            key={idx}
            className="rounded-[var(--radius-lg)] border border-[color:var(--color-neutral-100)] bg-white p-5 sm:p-6 shadow-sm"
          >
            <h3 className="font-semibold text-[color:var(--color-primary)]">{it.q}</h3>
            <p className="mt-2 text-[color:var(--color-neutral-800)]">{it.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
