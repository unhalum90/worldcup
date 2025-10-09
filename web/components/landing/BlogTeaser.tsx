"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function BlogTeaser() {
  const t = useTranslations("landing.blogTeaser");

  return (
    <section className="container mt-12 sm:mt-16">
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-neutral-100)] bg-white p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">{t("title")}</h2>
          <p className="text-[color:var(--color-neutral-800)] mt-1">{t("desc")}</p>
        </div>
        <a
          href="https://wc26fanzone.beehiiv.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md font-semibold text-white bg-[color:var(--color-accent-red)] hover:brightness-95"
        >
          Newsletter
        </a>
      </div>
    </section>
  );
}
