"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

const files = [
  // Desktop
  "/mockups/desktop_mockup_home.png",
  "/mockups/desktop_mockup_city_guide.png",
  "/mockups/desktop_mockup_match_schedule.png",
  "/mockups/desktop_mockup_travel_plan.png",
  "/mockups/desktop_mockup_community.png",
  // Mobile
  "/mockups/mobile_mockup_home.png",
  "/mockups/mobile_mockup_city_guide.png",
  "/mockups/mobile_mockup_match_schedule.png",
  "/mockups/mobile_mockup_travel_plan.png",
  "/mockups/mobile_mockup_community.png",
];

export default function GalleryCarousel() {
  const t = useTranslations("landing.gallery");

  return (
    <section className="container mt-12 sm:mt-16">
      <header className="mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold">{t("title")}</h2>
        <p className="text-[color:var(--color-neutral-800)]">{t("desc")}</p>
      </header>

      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-neutral-100)] bg-white p-3 sm:p-4 shadow-sm">
        <div className="relative overflow-x-auto">
          <div
            className="flex gap-3 sm:gap-4 snap-x snap-mandatory overflow-x-auto pb-2"
            role="region"
            aria-label={t("title")}
          >
            {files.map((src, i) => (
              <figure
                key={src + i}
                className="min-w-[260px] sm:min-w-[360px] snap-center rounded-md overflow-hidden border border-[color:var(--color-neutral-100)] bg-white"
              >
                <Image
                  src={src}
                  alt={t("imageAlt")}
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                />
              </figure>
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs sm:text-sm text-[color:var(--color-neutral-800)]">
          {t("caption")}
        </p>
      </div>
    </section>
  );
}
