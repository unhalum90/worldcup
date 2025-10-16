"use client";

import Image from "next/image";
import Link from "next/link";
import { cities, languages } from "@/src/data/city-guides";

export default function CityGuidesPage() {
  return (
    <main className="container py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">City Guides — PDF store</h1>
        <p className="text-[color:var(--color-neutral-700)] mb-8">
          Select a city on the left and click a language to purchase and download the city PDF guide on Gumroad.
        </p>

        <div className="bg-white rounded-[var(--radius-md)] shadow-sm border border-[color:var(--color-neutral-100)] overflow-hidden">
          {/* Header row */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b border-[color:var(--color-neutral-100)] items-center">
            <div className="col-span-6 text-sm font-medium text-[color:var(--color-neutral-700)]">City</div>
            <div className="col-span-6 text-sm font-medium text-right text-[color:var(--color-neutral-700)]">Languages</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[color:var(--color-neutral-100)]">
            {cities.map((city) => (
              <div key={city.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-4 sm:px-6 py-5 items-center">
                <div className="sm:col-span-6 flex items-center gap-4">
                  <div className="w-10 h-8 flex items-center justify-center rounded overflow-hidden shadow-sm bg-[color:var(--color-neutral-100)]">
                    <Image src={city.flag} alt={`${city.name} flag`} width={28} height={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{city.name}</div>
                    <div className="text-sm text-[color:var(--color-neutral-700)]">PDF guide</div>
                  </div>
                </div>

                <div className="sm:col-span-6 flex justify-end items-center gap-3">
                  <div className="flex gap-3 flex-wrap max-w-[520px] justify-end">
                    {languages.map((lang) => {
                      const url = city.products[lang.key as keyof typeof city.products];
                      const available = Boolean(url && url.length > 0);
                      return (
                        <Link
                          key={lang.key}
                          href={available ? url! : '#'}
                          target={available ? '_blank' : undefined}
                          rel={available ? 'noopener noreferrer' : undefined}
                          className={`inline-flex items-center justify-center px-4 py-2 rounded-full font-semibold text-sm transition-all min-w-[56px] text-center ${
                            available
                              ? 'bg-gradient-to-r from-[color:var(--color-primary)] to-[color:var(--color-accent-green)] text-white hover:brightness-95 shadow-lg'
                              : 'bg-[color:var(--color-neutral-100)] text-[color:var(--color-neutral-600)] cursor-not-allowed opacity-80'
                          }`}
                          aria-disabled={!available}
                          title={available ? `Buy ${city.name} guide (${lang.name})` : `${lang.name} not available`}
                        >
                          <span className="text-xs sm:text-sm">{lang.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
