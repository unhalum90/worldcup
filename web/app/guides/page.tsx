import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2026 World Cup Host City Guides | WC26 Fan Zone',
  description: 'Complete travel guides for all 16 FIFA World Cup 2026 host cities across USA, Canada, and Mexico. Stadium info, local tips, and fan essentials.',
  keywords: ['World Cup 2026', 'host cities', 'travel guides', 'FIFA', 'USA', 'Canada', 'Mexico', 'stadiums'],
};

const HOST_CITIES = [
  { name: 'Atlanta', country: 'USA', stadium: 'Mercedes-Benz Stadium' },
  { name: 'Boston', country: 'USA', stadium: 'Gillette Stadium' },
  { name: 'Dallas', country: 'USA', stadium: 'AT&T Stadium' },
  { name: 'Houston', country: 'USA', stadium: 'NRG Stadium' },
  { name: 'Kansas City', country: 'USA', stadium: 'Arrowhead Stadium' },
  { name: 'Los Angeles', country: 'USA', stadium: 'SoFi Stadium' },
  { name: 'Miami', country: 'USA', stadium: 'Hard Rock Stadium' },
  { name: 'New York', country: 'USA', stadium: 'MetLife Stadium' },
  { name: 'Philadelphia', country: 'USA', stadium: 'Lincoln Financial Field' },
  { name: 'San Francisco', country: 'USA', stadium: "Levi's Stadium" },
  { name: 'Seattle', country: 'USA', stadium: 'Lumen Field' },
  { name: 'Toronto', country: 'Canada', stadium: 'BMO Field' },
  { name: 'Vancouver', country: 'Canada', stadium: 'BC Place' },
  { name: 'Guadalajara', country: 'Mexico', stadium: 'Estadio Akron' },
  { name: 'Mexico City', country: 'Mexico', stadium: 'Estadio Azteca' },
  { name: 'Monterrey', country: 'Mexico', stadium: 'Estadio BBVA' },
];

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Explore 2026 Host City Guides
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Comprehensive travel guides for all 16 World Cup 2026 host cities — logistics, transport, lodging, safety, and fan experiences.
          </p>
          
          {/* Dallas CTA */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl">
            <div className="text-left">
              <p className="text-sm font-medium opacity-90 mb-1">FREE DOWNLOAD</p>
              <p className="text-2xl font-bold">Dallas Travel Guide</p>
            </div>
            <Link
              href="/cityguides"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md"
            >
              Download Now
            </Link>
          </div>

          <p className="text-gray-500 text-sm mt-6 max-w-2xl mx-auto">
            Most fans travel to 3–4 cities. Get your complete bundle after the Official Draw on December 5, 2025.
          </p>
        </div>
      </section>

      {/* City Grid */}
      <section className="container pb-16 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOST_CITIES.map((city, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300"
            >
              {/* Placeholder Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                <div className="relative text-6xl opacity-50 group-hover:scale-110 transition-transform duration-500">
                  🏟️
                </div>
                
                {/* City Name Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
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

                <Link
                  href={city.name === 'Dallas' ? '/cityguides' : '#'}
                  className={`inline-flex items-center gap-2 text-sm font-semibold ${
                    city.name === 'Dallas' 
                      ? 'text-blue-600 hover:text-blue-700' 
                      : 'text-gray-400 cursor-not-allowed'
                  } group-hover:gap-3 transition-all`}
                >
                  {city.name === 'Dallas' ? 'Download Free Guide' : 'Coming Soon'}
                  {city.name === 'Dallas' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container pb-16 sm:pb-24">
        <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Get Notified When All Guides Launch
          </h2>
          <p className="text-white/90 mb-6">
            Join our waitlist to receive all 16 city guides plus exclusive planning tools after the Official Draw.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Join Waitlist
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
