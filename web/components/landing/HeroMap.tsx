"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslations } from "next-intl";
import CountdownTimer from "@/components/CountdownTimer";
import { venues } from "@/data/venues";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function HeroMap() {
  const t = useTranslations('landing.heroMap');
  const points = venues.map((v) => ({
    city: v.city,
    stadium: v.stadium,
    lat: v.lat,
    lng: v.lng,
  }));

  return (
    <section className="relative bg-gradient-to-b from-white to-blue-50">
      {/* subtle depth overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-transparent" />
      <div className="container py-3 sm:py-5 relative">
        <div className="rounded-[28px] bg-blue-50/70 p-5 sm:p-7 md:p-9 border border-blue-100 shadow-sm">
          {/* Title leads */}
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-[-0.015em] text-neutral-900">
              {t('title.line1')}
              <br className="hidden sm:block" />
              {t('title.line2')}
            </h1>
          </div>

          {/* Host Cities Map */}
          <div className="mt-4 sm:mt-6 rounded-3xl overflow-hidden border border-neutral-200 bg-white shadow-md">
            <Map points={points} height={440} forceCenter={[39, -98]} forceZoom={3} />
          </div>

          {/* Subtitle */}
          <p className="mt-5 text-center text-lg sm:text-xl text-neutral-800 font-semibold">
            {t('subtitle')}
          </p>

          {/* Actions row: CTA • Countdown • Watch */}
          <div className="mt-6 sm:mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 md:gap-4">
            <Link
              href="/planner"
              className="cta-white inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent-red)] px-8 py-3 text-white hover:text-white visited:text-white focus-visible:text-white active:text-white font-bold shadow-md hover:brightness-110 transition"
            >
              {t('ctaPlan')}
            </Link>

            <CountdownTimer compact />

            <a
              href="#how-it-works"
              className="cta-white inline-flex items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-3 text-white hover:text-white visited:text-white focus-visible:text-white active:text-white font-semibold shadow-sm hover:opacity-95 transition"
              aria-label={t('ctaWatchAria')}
            >
              {t('ctaWatch')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
