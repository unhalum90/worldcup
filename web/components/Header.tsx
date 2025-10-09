"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";

export default function Header() {
  const t = useTranslations("nav");

  return (
    <header className="bg-white border-b border-[color:var(--color-neutral-100)]">
      <div className="container flex items-center justify-between py-3 gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-[color:var(--color-primary)]">
          {/* Wordmark placeholder */}
          <span>worldcup26fanzone</span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-6">
          <a
            href="https://wc26fanzone.beehiiv.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline underline-offset-4 text-[color:var(--color-neutral-800)]"
          >
            Newsletter
          </a>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
