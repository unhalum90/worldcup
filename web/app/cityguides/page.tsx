"use client";

import Image from "next/image";
import Link from "next/link";
import { cities, languages } from "@/src/data/city-guides";

export default function CityGuidesPage() {
  return (
    <main className="container py-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">City Guides — PDF store</h1>
        <p className="text-sm text-gray-600 mb-5">
          Every guide combines months of fan feedback, local scouting, and World Cup-specific research.
        </p>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div>
            {cities.map((city, idx) => (
              <div key={city.id} className={`flex items-center justify-between px-4 py-3 ${idx % 2 === 1 ? 'bg-gray-100' : ''}`}>
                <div className="flex items-center gap-3">
                  <Image src={city.flag} alt="" width={28} height={18} className="rounded-sm" />
                  <span className="font-semibold text-xl">{city.name}</span>
                </div>

                <div className="flex gap-2">
                  {languages.map((lang) => {
                    const url = city.products[lang.key as keyof typeof city.products];
                    const available = Boolean(url && url.length > 0);
                    const isEN = lang.key === 'en';
                    
                    return (
                      <Link
                        key={lang.key}
                        href={available ? url! : '#'}
                        target={available ? '_blank' : undefined}
                        rel={available ? 'noopener noreferrer' : undefined}
                        className={`inline-flex items-center justify-center w-14 py-1.5 rounded-full text-sm font-bold uppercase transition-all border-2 ${
                          isEN 
                            ? 'border-[#2A398D] text-[#2A398D] hover:bg-[#2A398D] hover:text-white' 
                            : 'border-[#E61D25] text-[#E61D25] hover:bg-[#E61D25] hover:text-white'
                        } ${!available ? 'opacity-40 cursor-not-allowed' : ''}`}
                        aria-disabled={!available}
                        title={available ? `Buy ${city.name} guide (${lang.name})` : `${lang.name} coming soon`}
                        onClick={available ? undefined : (e) => e.preventDefault()}
                      >
                        {lang.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
