'use client';

interface RouteRibbonProps {
  cities: string[];
}

export default function RouteRibbon({ cities }: RouteRibbonProps) {
  if (!cities || cities.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-sky-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
        Your Journey Route
      </h3>
      <div className="flex items-center justify-center flex-wrap gap-2">
        {cities.map((city, index) => (
          <div key={index} className="flex items-center">
            {/* City Badge */}
            <div className="bg-white border-2 border-blue-400 rounded-full px-4 py-2 shadow-sm">
              <span className="text-sm font-bold text-blue-800">
                {index === 0 && '🛫 '}
                {city}
                {index === cities.length - 1 && ' 🛬'}
              </span>
            </div>
            
            {/* Arrow between cities */}
            {index < cities.length - 1 && (
              <div className="mx-2 text-blue-400 text-xl font-bold">→</div>
            )}
          </div>
        ))}
      </div>
      
      {/* Total cities counter */}
      <div className="text-center mt-4">
        <span className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
          {cities.length} {cities.length === 1 ? 'City' : 'Cities'}
        </span>
      </div>
    </div>
  );
}
