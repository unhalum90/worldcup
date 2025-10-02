"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

export default function FeatureChunks() {
  const t = useTranslations("landing.chunks");
  const items = t.raw("items") as {
    title: string;
    desc: string;
    bullets: string[];
  }[];

  // Map features to their corresponding mockup images
  const featureImages = [
    "/mockups/mobile_mockup_match_schedule.png", // Matchday Planning
    "/mockups/mobile_mockup_travel_plan.png",    // Trip Builder
    "/mockups/mobile_mockup_city_guide.png",     // City Guide
    "/mockups/mobile_mockup_community.png",      // Community
  ];

  return (
    <section className="container mt-16 sm:mt-24 mb-16">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
          {t("title")}
        </h2>
        <p className="text-lg text-[color:var(--color-neutral-700)] max-w-2xl mx-auto">
          Everything you need to plan and enjoy the FIFA World Cup 2026
        </p>
      </div>

      <div className="flex flex-col gap-16 sm:gap-24">
        {items.map((it, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <article
              key={idx}
              className={`flex flex-col ${
                isEven ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-8 lg:gap-12`}
            >
              {/* Text Content */}
              <div className="flex-1 space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-[color:var(--color-accent-red)]/10 text-[color:var(--color-accent-red)] text-sm font-semibold mb-2">
                  Feature {idx + 1}
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {it.title}
                </h3>
                <p className="text-lg text-[color:var(--color-neutral-700)]">
                  {it.desc}
                </p>

                <ul className="space-y-3 mt-6">
                  {it.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-[color:var(--color-accent-red)] flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-[color:var(--color-neutral-800)]">
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-2">
                  <a
                    href="#signup"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-[color:var(--color-accent-red)] hover:brightness-95 transition-all shadow-lg hover:shadow-xl"
                  >
                    {t("cta")}
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Image/Mockup */}
              <div className="flex-1 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-8">
                  {featureImages[idx] && (
                    <div className="relative w-full max-w-[300px] mx-auto">
                      <Image
                        src={featureImages[idx]}
                        alt={it.title}
                        width={300}
                        height={600}
                        className="w-full h-auto"
                        priority={idx === 0}
                      />
                    </div>
                  )}
                </div>
                {/* Decorative element */}
                <div
                  className={`absolute -z-10 w-72 h-72 bg-[color:var(--color-accent-red)]/5 rounded-full blur-3xl ${
                    isEven ? "-right-20 -top-20" : "-left-20 -bottom-20"
                  }`}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
