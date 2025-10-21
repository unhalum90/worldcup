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
      href: '/cityguides',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: t('forums.icon'),
      title: t('forums.title'),
      description: t('forums.description'),
      cta: t('forums.cta'),
      href: '/forums',
      gradient: 'from-green-500 to-green-600',
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-transparent hover:shadow-2xl transition-all duration-300"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            {/* Content */}
            <div className="relative p-8 flex flex-col h-full">
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                {feature.description}
              </p>

              {/* CTA Button */}
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
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
