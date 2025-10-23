import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCityGuideBySlug, cityGuides } from '@/lib/cityGuidesData';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return cityGuides.map((city) => ({
    slug: city.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityGuideBySlug(slug);

  if (!city) {
    return {
      title: 'City Guide Not Found',
    };
  }

  return {
    title: `${city.name} Travel Guide - 2026 World Cup | WC26 Fan Zone`,
    description: `Complete travel guide for ${city.name}, ${city.country}. ${city.stadium} logistics, transportation, lodging, and fan tips for World Cup 2026.`,
    keywords: [`${city.name}`, `${city.stadium}`, 'World Cup 2026', city.country, 'travel guide', 'FIFA'],
  };
}

export default async function CityGuidePage({ params }: Props) {
  const { slug } = await params;
  const city = getCityGuideBySlug(slug);

  if (!city) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Sticky Navigation */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <Link 
              href="/guides" 
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back to All Guides</span>
              <span className="sm:hidden">Guides</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{city.country}</span>
              <span className="font-bold text-gray-900 text-sm sm:text-base">{city.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-20 overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {city.country}
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
              {city.name}
            </h1>
            <p className="text-2xl md:text-3xl text-white/90 mb-2">
              {city.stadium}
            </p>
            <p className="text-lg text-white/80">
              Capacity: {city.capacity.toLocaleString()}
            </p>
          </div>

          {/* Status Badge & CTA */}
          <div className="text-center">
            {city.isAvailable ? (
              <Link
                href={city.downloadUrl || '#'}
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-xl text-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Free Guide
              </Link>
            ) : (
              <div className="inline-block">
                <div className="bg-yellow-500 text-yellow-900 px-6 py-3 rounded-lg font-bold text-lg mb-2">
                  🗓️ Coming Soon
                </div>
                {city.releaseDate && (
                  <p className="text-sm text-white/80">
                    Available after Group Draw: {new Date(city.releaseDate).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Description */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">About {city.name}</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {city.description}
          </p>
        </div>

        {/* Highlights */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-4xl mr-3">✨</span>
            Highlights
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {city.highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-3 bg-white/60 p-4 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transportation */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-4xl mr-3">✈️</span>
            Transportation
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900 mb-2">Airport</h3>
              <p className="text-gray-700 mb-1">{city.transportation.airport}</p>
              <p className="text-sm text-gray-500">({city.transportation.airportCode})</p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Distance to Stadium:</strong> {city.transportation.distanceToStadium}
              </p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <h3 className="font-bold text-gray-900 mb-2">Public Transit</h3>
              <p className="text-gray-700">{city.transportation.publicTransit}</p>
            </div>
          </div>
        </div>

        {/* Lodging */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-4xl mr-3">🏨</span>
            Lodging
          </h2>
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 mb-2">Average Cost</h3>
            <p className="text-2xl text-blue-600 font-bold">{city.lodging.averageCost}</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Recommended Areas</h3>
            <div className="flex flex-wrap gap-2">
              {city.lodging.recommendedAreas.map((area, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-4xl mr-3">🗺️</span>
            Location
          </h2>
          <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg p-12 border-2 border-dashed border-gray-300 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-600 font-semibold mb-2">Interactive Map Coming Soon</p>
            <p className="text-sm text-gray-500">
              Coordinates: {city.coordinates.lat}, {city.coordinates.lng}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${city.coordinates.lat},${city.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Open in Google Maps
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            {city.isAvailable ? 'Download the Full Guide' : 'Get Notified When Available'}
          </h2>
          <p className="text-white/90 mb-6">
            {city.isAvailable 
              ? `Get the complete ${city.name} travel guide with detailed maps, accommodation tips, and local insights.`
              : `Join our waitlist to receive the ${city.name} guide as soon as it's released after the Official Draw.`
            }
          </p>
          {city.isAvailable ? (
            <Link
              href={city.downloadUrl || '#'}
              className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Free Guide
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Join Waitlist
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
