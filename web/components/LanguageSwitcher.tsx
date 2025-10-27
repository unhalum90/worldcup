"use client";

import { useEffect, useState } from "react";
import { locales, activeLocales, Locale } from "@/i18n";

/**
 * LanguageSwitcher sets NEXT_LOCALE cookie and reloads.
 * Works with next-intl middleware (localePrefix: 'never').
 */
export default function LanguageSwitcher() {
  const [current, setCurrent] = useState<Locale>("en");

  useEffect(() => {
    if (typeof document !== "undefined") {
      const lang = (document.documentElement.lang || "en") as Locale;
      setCurrent(locales.includes(lang) ? lang : "en");
    }
  }, []);

  function changeLocale(next: string) {
    // Persist for 1 year
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    // Simple reload to re-render with new messages and dir
    window.location.reload();
  }

  // Language labels
  const languageLabels: Record<string, string> = {
    en: "English",
    es: "Español",
    pt: "Português"
  };

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="sr-only">Language</span>
      <select
        value={current}
        onChange={(e) => changeLocale(e.target.value)}
        className="border border-[color:var(--color-neutral-100)] rounded-md px-2 py-1 bg-white text-[color:var(--color-neutral-800)]"
        aria-label="Language"
      >
        {activeLocales.map((lc) => (
          <option key={lc} value={lc}>
            {languageLabels[lc] || lc.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
