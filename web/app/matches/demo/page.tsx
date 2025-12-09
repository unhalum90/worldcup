'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { MapMarker } from '@/components/matches/MatchMap';

// Dynamically import map to avoid SSR issues
const MatchMap = dynamic(
  () => import('@/components/matches/MatchMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-72 w-full rounded-xl bg-gray-200 animate-pulse flex items-center justify-center">
        <span className="text-gray-500">Loading map...</span>
      </div>
    ),
  }
);

// Match 1 Data (from Airtable/Make.com)
const matchData = {
  match_number: 1,
  team1: { name: "South Africa", flag: "🇿🇦", code: "RSA" },
  team2: { name: "Mexico", flag: "🇲🇽", code: "MEX" },
  date: "June 11, 2026",
  time: "5:00 PM CDT",
  city: "Mexico City",
  stadium: "Estadio Azteca",
  venue: {
    lat: 19.3029,
    lng: -99.1505,
    transit: 'GOOD' as const,
    transitNote: 'Metro Line 2 to Tasqueña, then light rail to Estadio Azteca station.',
    capacity: 87523,
    city: 'Mexico City',
    stadium: 'Estadio Azteca',
    country: 'Mexico' as const,
  }
};

// Map markers for Mexico City
const mapMarkers: MapMarker[] = [
  { lat: 19.3029, lng: -99.1505, type: 'stadium', name: 'Estadio Azteca', description: '87,523 capacity' },
  { lat: 19.4361, lng: -99.0719, type: 'airport', name: 'MEX Airport', description: 'Benito Juárez International' },
  { lat: 19.4326, lng: -99.1332, type: 'fanFest', name: 'Zócalo Fan Festival', description: 'Plaza de la Constitución' },
  { lat: 19.4328, lng: -99.1936, type: 'lodging', name: 'Polanco', description: 'Luxury - $200-500+' },
  { lat: 19.4195, lng: -99.1619, type: 'lodging', name: 'Roma Norte', description: 'Trendy - $150-400' },
  { lat: 19.4115, lng: -99.1735, type: 'lodging', name: 'Condesa', description: 'Hip - $150-350' },
  { lat: 19.3500, lng: -99.1620, type: 'lodging', name: 'Coyoacán', description: 'Mid-range - $100-250' },
  { lat: 19.4326, lng: -99.1332, type: 'lodging', name: 'Centro Histórico', description: 'Historic - $80-300' },
];

export default function MatchDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-green-600/70 via-green-500/70 to-red-500/70 text-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 text-sm font-bold mb-3">
              ⚽ MATCH {matchData.match_number} • OPENING MATCH
            </div>
            
            <div className="flex items-center justify-center gap-6 md:gap-12 mb-4">
              <div className="text-center">
                <div className="text-5xl md:text-7xl mb-1">{matchData.team1.flag}</div>
                <div className="text-xl md:text-2xl font-bold">{matchData.team1.name}</div>
              </div>
              <div className="text-3xl md:text-4xl font-bold opacity-60">VS</div>
              <div className="text-center">
                <div className="text-5xl md:text-7xl mb-1">{matchData.team2.flag}</div>
                <div className="text-xl md:text-2xl font-bold">{matchData.team2.name}</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
              <span className="bg-white/20 px-3 py-1 rounded-full">📅 {matchData.date}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">⏰ {matchData.time}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">🏟️ {matchData.stadium}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        
        {/* MAP SECTION - Blue */}
        <section className="bg-blue-500/70 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            📍 Stadium & Key Locations
          </h2>
          <div className="bg-white rounded-xl overflow-hidden">
            <MatchMap 
              markers={mapMarkers} 
              center={{ lat: 19.38, lng: -99.15 }}
              zoom={11}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-400/40 border border-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{matchData.venue.capacity.toLocaleString()}</div>
              <div className="text-xs opacity-80">Capacity</div>
            </div>
            <div className="bg-blue-400/40 border border-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">GOOD</div>
              <div className="text-xs opacity-80">Transit Rating</div>
            </div>
            <div className="bg-blue-400/40 border border-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">2,240m</div>
              <div className="text-xs opacity-80">Altitude</div>
            </div>
            <div className="bg-blue-400/40 border border-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">1966</div>
              <div className="text-xs opacity-80">Built</div>
            </div>
          </div>
        </section>

        {/* WHY THIS MATCH MATTERS - Purple */}
        <section className="bg-purple-500/70 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-4">🔥 Why This Match Matters</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-purple-400/40 border border-black/20 rounded-xl p-4">
              <div className="text-lg font-semibold mb-2">🏆 Official World Cup Opener</div>
              <p className="text-sm opacity-90">First match of the 2026 FIFA World Cup at the iconic Estadio Azteca</p>
            </div>
            <div className="bg-purple-400/40 border border-black/20 rounded-xl p-4">
              <div className="text-lg font-semibold mb-2">🔁 2010 Rematch</div>
              <p className="text-sm opacity-90">Poetic rematch of the 2010 World Cup opener in Johannesburg (1-1 draw)</p>
            </div>
            <div className="bg-purple-400/40 border border-black/20 rounded-xl p-4">
              <div className="text-lg font-semibold mb-2">🇲🇽 Host Nation Pressure</div>
              <p className="text-sm opacity-90">Mexico must exorcise ghosts of 2022 group stage exit</p>
            </div>
            <div className="bg-purple-400/40 border border-black/20 rounded-xl p-4">
              <div className="text-lg font-semibold mb-2">🇿🇦 16-Year Return</div>
              <p className="text-sm opacity-90">South Africa's first World Cup since hosting in 2010</p>
            </div>
          </div>
        </section>

        {/* HEAD TO HEAD - Orange */}
        <section className="bg-orange-400/70 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-4">⚔️ Head-to-Head Record</h2>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-white/15 border border-black/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">4</div>
              <div className="text-xs">Total Matches</div>
            </div>
            <div className="bg-green-400/60 border border-black/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">1</div>
              <div className="text-xs">{matchData.team1.code} Wins</div>
            </div>
            <div className="bg-gray-400/60 border border-black/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">1</div>
              <div className="text-xs">Draws</div>
            </div>
            <div className="bg-red-400/60 border border-black/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">2</div>
              <div className="text-xs">{matchData.team2.code} Wins</div>
            </div>
          </div>
          <div className="bg-white/15 border border-black/20 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Notable Meetings:</h3>
            <ul className="text-sm space-y-1">
              <li>• <strong>2010 World Cup:</strong> South Africa 1-1 Mexico (Group Stage)</li>
              <li>• <strong>2005 Gold Cup:</strong> South Africa 2-1 Mexico</li>
              <li>• <strong>2000 Friendly:</strong> Mexico 2-0 South Africa</li>
              <li>• <strong>1993 Friendly:</strong> Mexico 3-1 South Africa</li>
            </ul>
          </div>
        </section>

        {/* TEAM PROFILES - Two columns */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* South Africa - Green */}
          <section className="bg-green-500/70 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              {matchData.team1.flag} {matchData.team1.name}
            </h2>
            
            <div className="space-y-4">
              <div className="bg-green-400/40 border border-black/20 rounded-xl p-4">
                <h3 className="font-semibold mb-2">📊 Quick Stats</h3>
                <ul className="text-sm space-y-1">
                  <li>• <strong>FIFA Ranking:</strong> ~59th</li>
                  <li>• <strong>WC Appearances:</strong> 3 (1998, 2002, 2010)</li>
                  <li>• <strong>Best Finish:</strong> Group Stage</li>
                  <li>• <strong>Coach:</strong> Hugo Broos (Belgium)</li>
                  <li>• <strong>Formation:</strong> 4-2-3-1</li>
                </ul>
              </div>
              
              <div className="bg-green-400/40 border border-black/20 rounded-xl p-4">
                <h3 className="font-semibold mb-2">⭐ Key Players</h3>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white/20 border border-black/20 rounded-lg p-2">
                    <div className="font-bold">Williams</div>
                    <div className="opacity-70">GK</div>
                  </div>
                  <div className="bg-white/20 border border-black/20 rounded-lg p-2">
                    <div className="font-bold">Mokoena</div>
                    <div className="opacity-70">MID</div>
                  </div>
                  <div className="bg-white/20 border border-black/20 rounded-lg p-2">
                    <div className="font-bold">Percy Tau</div>
                    <div className="opacity-70">FWD</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-400/40 border border-black/20 rounded-xl p-4">
                <h3 className="font-semibold mb-2">📖 Tournament Story</h3>
                <p className="text-sm opacity-90">
                  Bafana Bafana return after 16 years. Their iconic moment: Siphiwe Tshabalala's thunderous opening goal vs Mexico in 2010. 
                  Recent form improved with 2023 AFCON bronze medal.
                </p>
              </div>

              <div className="bg-yellow-400/60 border border-black/20 rounded-xl p-4">
                <h3 className="font-semibold mb-2">🎺 Fan Culture</h3>
                <p className="text-sm">
                  Vuvuzelas + Makarapa hardhats = unforgettable atmosphere
                </p>
              </div>
            </div>
          </section>

          {/* Mexico - Red */}
          <section className="bg-red-500/70 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              {matchData.team2.flag} {matchData.team2.name}
            </h2>
            
            <div className="space-y-4">
              <div className="bg-red-400/40 border border-black/20 rounded-xl p-4">
                <h3 className="font-semibold mb-2">📊 Quick Stats</h3>
                <ul className="text-sm space-y-1">
                  <li>• <strong>FIFA Ranking:</strong> ~17th</li>
                  <li>• <strong>WC Appearances:</strong> 17</li>
                  <li>• <strong>Best Finish:</strong> Quarter-finals (1970, 1986)</li>
                  <li>• <strong>Coach:</strong> Javier Aguirre (3rd tenure)</li>
                  <li>• <strong>Formation:</strong> 4-3-3</li>
                </ul>
              </div>
              
              <div className="bg-red-400/40 border border-black/20 rounded-xl p-4">
                <h3 className="font-semibold mb-2">⭐ Key Players</h3>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white/20 border border-black/20 rounded-lg p-2">
                    <div className="font-bold">Malagón</div>
                    <div className="opacity-70">GK</div>
                  </div>
                  <div className="bg-white/20 border border-black/20 rounded-lg p-2">
                    <div className="font-bold">E. Álvarez</div>
                    <div className="opacity-70">CDM</div>
                  </div>
                  <div className="bg-white/20 border border-black/20 rounded-lg p-2">
                    <div className="font-bold">Giménez</div>
                    <div className="opacity-70">ST</div>
                  </div>
                </div>
              </div>

              <div className="bg-red-400/40 border border-black/20 rounded-xl p-4">
                <h3 className="font-semibold mb-2">📖 Tournament Story</h3>
                <p className="text-sm opacity-90">
                  El Tri's 7-tournament Round of 16 streak snapped in 2022. As hosts, they auto-qualified. 
                  History of home success: both QF appearances came on Mexican soil.
                </p>
              </div>

              <div className="bg-green-400/60 border border-black/20 rounded-xl p-4">
                <h3 className="font-semibold mb-2">🎵 Fan Culture</h3>
                <p className="text-sm">
                  Sea of green jerseys + sombreros singing "Cielito Lindo"
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* GETTING TO THE STADIUM - Teal */}
        <section className="bg-teal-500/70 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-4">🚇 Getting to Estadio Azteca</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-500/70 border border-black/20 rounded-xl p-4">
              <div className="text-lg font-bold mb-2">✅ RECOMMENDED</div>
              <h3 className="font-semibold">Metro + Light Rail</h3>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Metro Line 2 (Blue) → Tasqueña</li>
                <li>• Transfer to Tren Ligero</li>
                <li>• Exit: Estadio Azteca station</li>
                <li>• <strong>Time:</strong> 1-1.5 hours</li>
                <li>• <strong>Cost:</strong> ~$0.50 USD</li>
              </ul>
            </div>
            
            <div className="bg-yellow-400/70 border border-gray-400/50 rounded-xl p-4 text-gray-900">
              <div className="text-lg font-bold mb-2">⚠️ USE CAUTION</div>
              <h3 className="font-semibold">Rideshare (Uber/DiDi)</h3>
              <ul className="text-sm mt-2 space-y-1">
                <li>• <strong>Time:</strong> 2+ hours</li>
                <li>• Expect heavy surge pricing</li>
                <li>• AVOID for post-match</li>
                <li>• Gridlock guaranteed</li>
              </ul>
            </div>
            
            <div className="bg-red-500/70 border border-black/20 rounded-xl p-4">
              <div className="text-lg font-bold mb-2">❌ NOT RECOMMENDED</div>
              <h3 className="font-semibold">Driving</h3>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Severe congestion</li>
                <li>• Limited parking</li>
                <li>• Stressful navigation</li>
                <li>• High costs</li>
              </ul>
            </div>
          </div>

          <div className="bg-teal-400/40 border border-black/20 rounded-xl p-4">
            <h3 className="font-semibold mb-2">💡 Pro Tips</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>• Buy & load a Metro Card on arrival (skip queues)</div>
              <div>• Wait 30-45 min post-match to avoid crush</div>
              <div>• June = rainy season (bring umbrella)</div>
              <div>• No re-entry policy at stadium</div>
            </div>
          </div>
        </section>

        {/* WHERE TO STAY - Pink/Rose */}
        <section className="bg-rose-500/70 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-4">🏨 Where to Stay</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {/* Luxury */}
            <div className="bg-amber-400 border border-amber-600/50 rounded-xl p-4 text-gray-900">
              <div className="text-xs font-bold uppercase tracking-wide mb-1">💎 LUXURY</div>
              <h3 className="font-bold text-lg">Polanco / Roma Norte</h3>
              <div className="text-2xl font-bold my-2">$200-500+</div>
              <ul className="text-sm space-y-1">
                <li>• Upscale shopping & dining</li>
                <li>• Trendy nightlife scene</li>
                <li>• 30-60 min to stadium</li>
              </ul>
            </div>
            
            {/* Mid-Range */}
            <div className="bg-white border border-gray-300 rounded-xl p-4 text-gray-900">
              <div className="text-xs font-bold uppercase tracking-wide mb-1 text-rose-600">⭐ MID-RANGE</div>
              <h3 className="font-bold text-lg">Coyoacán / Centro</h3>
              <div className="text-2xl font-bold my-2">$100-350</div>
              <ul className="text-sm space-y-1">
                <li>• Historic & bohemian vibe</li>
                <li>• Near major landmarks</li>
                <li>• 15-60 min to stadium</li>
              </ul>
            </div>
            
            {/* Budget */}
            <div className="bg-rose-400/40 border border-black/20 rounded-xl p-4">
              <div className="text-xs font-bold uppercase tracking-wide mb-1">💰 BUDGET</div>
              <h3 className="font-bold text-lg">Narvarte / Del Valle</h3>
              <div className="text-2xl font-bold my-2">$80-200</div>
              <ul className="text-sm space-y-1">
                <li>• Residential & authentic</li>
                <li>• Local eateries</li>
                <li>• 20-35 min to stadium</li>
              </ul>
            </div>
          </div>

          <div className="bg-rose-400/40 border border-black/20 rounded-xl p-4">
            <h3 className="font-semibold mb-2">🚗 Alternative Cities (Lower Costs)</h3>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div>
                <strong>Toluca</strong>
                <div className="opacity-80">1.5-2 hr commute • Closest option</div>
              </div>
              <div>
                <strong>Puebla</strong>
                <div className="opacity-80">3-4 hr commute • Great food scene</div>
              </div>
              <div>
                <strong>Querétaro</strong>
                <div className="opacity-80">4-5 hr commute • Historic charm</div>
              </div>
            </div>
          </div>
        </section>

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link href="/matches" className="text-blue-600 hover:underline">
            ← Back to All Matches
          </Link>
        </div>
      </div>
    </div>
  );
}
