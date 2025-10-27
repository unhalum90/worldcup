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
          These aren’t your average Google-search summaries. Every guide combines months of fan feedback, local scouting, and World Cup-specific research—so you can plan your trip like someone who actually lives there.
        </p>

        <div className="bg-white rounded-[var(--radius-md)] shadow-sm border border-[color:var(--color-neutral-100)] overflow-hidden">
          {/* Header row */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b border-[color:var(--color-neutral-100)] items-center">
            <div className="col-span-4 text-sm font-medium text-[color:var(--color-neutral-700)]">City</div>
            <div className="col-span-8 text-sm font-medium text-right text-[color:var(--color-neutral-700)]">Languages</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[color:var(--color-neutral-100)]">
            {cities.map((city, idx) => (
              <div key={city.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 px-4 sm:px-6 py-4 items-center">
                <div className="sm:col-span-4 flex items-center gap-3">
                  <div className="w-10 h-8 flex items-center justify-center rounded overflow-hidden shadow-sm bg-[color:var(--color-neutral-100)]">
                    <Image src={city.flag} alt={`${city.name} flag`} width={28} height={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-base">{city.name}</div>
                    <div className="text-xs text-[color:var(--color-neutral-700)]">PDF guide</div>
                  </div>
                </div>

                <div className="sm:col-span-8 flex justify-start sm:justify-start items-center sm:pl-8">
                  <div className="flex gap-3 flex-wrap">
                    {languages.map((lang, langIdx) => {
                      const url = city.products[lang.key as keyof typeof city.products];
                      const available = Boolean(url && url.length > 0);
                      
                      // Same colors for all cities - cycle through 5 colors (always show colors, never grey)
                      const colors = [
                        { border: 'border-[#2A398D]', text: 'text-[#2A398D]', bg: 'bg-white', hoverBg: 'hover:bg-[#2A398D]', hoverText: 'hover:text-white' },
                        { border: 'border-[#E61D25]', text: 'text-[#E61D25]', bg: 'bg-white', hoverBg: 'hover:bg-[#E61D25]', hoverText: 'hover:text-white' },
                        { border: 'border-[#0066CC]', text: 'text-[#0066CC]', bg: 'bg-white', hoverBg: 'hover:bg-[#0066CC]', hoverText: 'hover:text-white' },
                        { border: 'border-[#FF8C00]', text: 'text-[#FF8C00]', bg: 'bg-white', hoverBg: 'hover:bg-[#FF8C00]', hoverText: 'hover:text-white' },
                        { border: 'border-[#3CAC3B]', text: 'text-[#3CAC3B]', bg: 'bg-white', hoverBg: 'hover:bg-[#3CAC3B]', hoverText: 'hover:text-white' },
                      ];
                      const colorStyle = colors[langIdx % colors.length];
                      
                      return (
                        <Link
                          key={lang.key}
                          href={available ? url! : '#'}
                          target={available ? '_blank' : undefined}
                          rel={available ? 'noopener noreferrer' : undefined}
                          className={`group inline-flex items-center justify-center px-5 py-2.5 rounded-full font-semibold text-base transition-all border-2 min-w-[68px] ${colorStyle.border} ${colorStyle.text} ${colorStyle.bg} ${colorStyle.hoverBg} ${
                            !available ? 'cursor-not-allowed' : ''
                          }`}
                          aria-disabled={!available}
                          title={available ? `Buy ${city.name} guide (${lang.name})` : `${lang.name} coming soon`}
                          onClick={available ? undefined : (e) => e.preventDefault()}
                        >
                          <span className="text-sm font-bold uppercase group-hover:text-white transition-colors">{lang.label}</span>
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
