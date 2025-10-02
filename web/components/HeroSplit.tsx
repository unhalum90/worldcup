"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import CTASignup from "@/components/forms/CTASignup";

/**
 * Split hero layout with image on one side and content on the other.
 * Mirrors horizontally in RTL via the 'flip-rtl' utility (see globals.css).
 */
export default function HeroSplit() {
  const t = useTranslations("hero");

  return (
    <section className="container mt-8 sm:mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center flip-rtl">
        {/* Visual (map placeholder) */}
        <div className="order-2 md:order-1">
          <div className="rounded-[var(--radius-lg)] overflow-hidden border border-[color:var(--color-neutral-100)] shadow-sm bg-white">
            <Image
              src="/globe.svg"
              alt="World map placeholder"
              width={1200}
              height={800}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        {/* Copy + CTA */}
        <div className="order-1 md:order-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3">
            {t("title")}
          </h1>
          <p className="text-[color:var(--color-neutral-800)] text-base sm:text-lg mb-6">
            {t("subtitle")}
          </p>

          <div id="signup">
            <CTASignup />
          </div>

          <div className="mt-4">
            <Link
              href="/blog"
              className="inline-flex items-center text-sm font-medium underline underline-offset-4 text-[color:var(--color-primary)]"
            >
              {t("viewBlog")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
