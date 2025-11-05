"use client";

import Link from 'next/link';
import { cityGuides, getCityGuidesByCountry } from '@/lib/cityGuidesData';
import { useState } from 'react';
import Image from 'next/image';
import { getCityMapPath } from '@/lib/cityMaps';

export default function GuidesPage() {
  const [countryFilter, setCountryFilter] = useState<'ALL' | 'USA' | 'CAN' | 'MEX'>('ALL');

  const filteredCities = countryFilter === 'ALL' 
    ? cityGuides 
    : getCityGuidesByCountry(countryFilter);
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container py-10 sm:py-14">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Explore 2026 Host City Guides
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6">
            Comprehensive travel guides for all 16 World Cup 2026 host cities — logistics, transport, lodging, safety, and fan experiences.
          </p>
          
          {/* Dallas CTA */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl">
            <div className="text-left">
              <p className="text-sm font-medium opacity-90 mb-1">FREE DOWNLOAD</p>
              <p className="text-2xl font-bold">Dallas Travel Guide</p>
            </div>
            <a
              href="https://fanzonenetwork.lemonsqueezy.com/buy/fac0321c-ed0b-4e68-89d1-a01fde5b4166"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md"
            >
              Download Now
            </a>
          </div>

          <p className="text-gray-500 text-sm mt-4 max-w-2xl mx-auto">
            Most fans travel to 3–4 cities. Get your complete bundle after the Official Draw on December 5, 2025.
          </p>
        </div>
      </section>

      {/* What's Inside Each Guide */}
      <section className="py-6 bg-gray-50">
        <div className="container">
          <h2 className="text-center text-2xl font-bold mb-4">What’s Inside Each Guide</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl">🗺️</div>
              <h3 className="font-semibold mt-2">Neighborhood Zones</h3>
              <p className="text-sm text-gray-600">Best areas to stay for convenience and price.</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl">🚇</div>
              <h3 className="font-semibold mt-2">Transport Tips</h3>
              <p className="text-sm text-gray-600">Metro, Uber, and stadium connections simplified.</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl">✈️</div>
              <h3 className="font-semibold mt-2">Flight Itineraries</h3>
              <p className="text-sm text-gray-600">Review which airports are best for your trip.</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl">💡</div>
              <h3 className="font-semibold mt-2">Local Insights</h3>
              <p className="text-sm text-gray-600">Safety, customs, and must-do experiences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* City Grid */}
      <section className="container pt-4 pb-16 sm:pb-20">
        {/* Country Filter */}
        <div className="flex justify-center gap-3 mb-4">
          {(['ALL', 'USA', 'CAN', 'MEX'] as const).map((country) => (
            <button
              key={country}
              onClick={() => setCountryFilter(country)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                countryFilter === country
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
              }`}
            >
              {country === 'ALL' ? 'All Cities' : country === 'USA' ? 'United States' : country === 'CAN' ? 'Canada' : 'Mexico'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCities.map((city, index) => (
            <Link
              key={index}
              href={`/guides/${city.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300"
            >
              {/* Visual (city map thumbnail with gradient overlay and fallback) */}
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
                {(() => {
                  const img = getCityMapPath(city.name);
                  return img ? (
                    <Image
                      src={img}
                      alt={`${city.name} World Cup map`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover scale-105 group-hover:scale-110 transition-transform duration-500"
                      priority={index < 2}
                    />
                  ) : (
                    <div className="relative text-6xl opacity-50 group-hover:scale-110 transition-transform duration-500">🏟️</div>
                  );
                })()}
                {/* gradient overlay for readability */}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Status Badge */}
                {city.isAvailable && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    FREE DOWNLOAD
                  </div>
                )}
                {!city.isAvailable && (
                  <div className="absolute top-3 right-3 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                    COMING SOON
                  </div>
                )}

                {/* City Name Overlay */}
                <div className="absolute inset-0 flex items-end p-4">
                  <div>
                    <h3 className="text-white text-xl font-bold">{city.name}</h3>
                    <p className="text-white/80 text-sm">{city.country}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {city.stadium}
                </p>

                <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 group-hover:text-blue-700 transition-all">
                  {city.isAvailable ? 'View Guide' : 'Learn More'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container pb-16 sm:pb-24">
        <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Join Fan Zone Insider
          </h2>
          <p className="text-white/90 mb-6">
            Our free weekly newsletter for World Cup 2026 fans. Get city updates, travel tips, and early access to new guides as they launch.
          </p>
          <button
            onClick={() => window.dispatchEvent(new Event('fz:open-subscribe'))}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[color:var(--color-accent-red)] text-white rounded-lg font-bold hover:brightness-110 transition-colors shadow-lg"
          >
            Subscribe Free
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
}
