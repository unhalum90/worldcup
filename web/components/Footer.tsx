"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-white mt-16 border-t border-[color:var(--color-neutral-100)]">
      <div className="container py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[color:var(--color-neutral-800)]">
          © {new Date().getFullYear()} worldcup26fanzone — {t("footer.rights")}
        </p>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:underline underline-offset-4">
            {t("nav.home")}
          </Link>
          <Link href="/blog" className="hover:underline underline-offset-4">
            {t("nav.blog")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
