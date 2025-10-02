"use client";

import { useTranslations } from "next-intl";

export default function Features() {
  const t = useTranslations("features");
  const items = t.raw("items") as { title: string; desc: string }[];

  return (
    <section className="container mt-12 sm:mt-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">{t("title")}</h2>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, idx) => (
          <div
            key={idx}
            className="rounded-[var(--radius-md)] border border-[color:var(--color-neutral-100)] bg-white p-4 sm:p-5 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-2">{it.title}</h3>
            <p className="text-[color:var(--color-neutral-800)] text-sm">
              {it.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
