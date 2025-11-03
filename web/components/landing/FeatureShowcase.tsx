'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function FeatureShowcase() {
  const t = useTranslations('featureShowcase');
  
  const features = [
    {
      icon: t('cityGuides.icon'),
      title: t('cityGuides.title'),
      description: t('cityGuides.description'),
      cta: t('cityGuides.cta'),
      href: 'https://fanzonenetwork.lemonsqueezy.com/buy/fac0321c-ed0b-4e68-89d1-a01fde5b4166',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: t('aiPlanner.icon'),
      title: t('aiPlanner.title'),
      description: t('aiPlanner.description'),
      cta: t('aiPlanner.cta'),
      href: '/planner',
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <section id="features-section" className="container py-16 sm:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
          {t('title')}
        </h2>
        <p className="text-[color:var(--color-neutral-700)] text-lg max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group relative bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-transparent hover:shadow-2xl transition-all duration-300"
          >
            {/* Gradient Header */}
            <div className={`bg-gradient-to-r ${feature.gradient} p-6 text-white`}>
              <div className="text-4xl mb-2">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-1">{feature.title}</h3>
              <p className="text-white/90 text-sm">{feature.description}</p>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* CTA Button */}
              {feature.href.startsWith('http') ? (
                <a
                  href={feature.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${feature.gradient} hover:brightness-110 transition-all shadow-md hover:shadow-lg group-hover:scale-105`}
                >
                  {feature.cta}
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
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
              ) : (
                <Link
                  href={feature.href}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${feature.gradient} hover:brightness-110 transition-all shadow-md hover:shadow-lg group-hover:scale-105`}
                >
                  {feature.cta}
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
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
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
