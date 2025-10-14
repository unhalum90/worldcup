"use client";

import { useTranslations } from "next-intl";

export default function Features() {
  const t = useTranslations("features");
  // Simplified coming soon layout - we intentionally do not render images here

  return (
    <section className="coming-soon container mt-12 sm:mt-16">
      <h2 className="coming-soon__title">Coming soon</h2>

      <div className="coming-soon__items">
        <div className="coming-soon__item">
          <h3 className="coming-soon__feature">City Guide</h3>
          <p className="coming-soon__desc">
            A complete Boston guide with neighborhood tips, transit, stadium access, and verified recommendations.
          </p>
        </div>

        <div className="coming-soon__item">
          <h3 className="coming-soon__feature">Forums</h3>
          <p className="coming-soon__desc">
            City-specific forums with pinned "Start Here" threads, matchday live threads, and community Q&A.
          </p>
        </div>

        <div className="coming-soon__item">
          <h3 className="coming-soon__feature">AI Travel Builder</h3>
          <p className="coming-soon__desc">
            Generate personalized day-by-day itineraries for matches, including transport, dining, and alternatives.
          </p>
        </div>
      </div>
    </section>
  );
}
