"use client";

import { useTranslations } from "next-intl";

export default function RoadmapTimeline() {
  const t = useTranslations("landing.roadmap");

  const groups = t.raw("groups") as {
    label: string;
    items: string[];
  }[];

  return (
    <section className="container mt-12 sm:mt-16">
      <header className="mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold">{t("title")}</h2>
        <p className="text-[color:var(--color-neutral-800)]">{t("desc")}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {groups.map((g, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-lg)] border border-[color:var(--color-neutral-100)] bg-white p-5 sm:p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-[color:var(--color-primary)]">
              {g.label}
            </h3>
            <ul className="mt-2 list-disc pl-5 text-[color:var(--color-neutral-800)] space-y-1">
              {g.items.map((it, idx) => (
                <li key={idx}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
