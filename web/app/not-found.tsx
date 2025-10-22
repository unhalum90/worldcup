import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
        <div className="text-6xl mb-6">🏟️</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Looks like this page hasn't qualified for the 2026 World Cup. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Go Home
          </Link>
          <Link
            href="/teams"
            className="px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors border-2 border-gray-300"
          >
            View Teams
          </Link>
          <Link
            href="/guides"
            className="px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors border-2 border-gray-300"
          >
            City Guides
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <Link
            href="/planner"
            className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🗺️</div>
            <div className="font-semibold text-gray-900">Travel Planner</div>
            <div className="text-sm text-gray-600">Plan your trip</div>
          </Link>
          <Link
            href="/forums"
            className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">💬</div>
            <div className="font-semibold text-gray-900">Forums</div>
            <div className="text-sm text-gray-600">Join discussions</div>
          </Link>
          <Link
            href="/contact"
            className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">📧</div>
            <div className="font-semibold text-gray-900">Contact</div>
            <div className="text-sm text-gray-600">Get in touch</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
