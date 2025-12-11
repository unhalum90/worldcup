'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { groupStageMatches, type Match } from '@/lib/matchesData';
import { getCityByName, type CityData } from '@/lib/cityData';
import { teams, type Team } from '@/lib/teamsData';
import type { MapMarker } from '@/components/matches/MatchMap';
import SubscribeUpdatesModal from '@/components/matches/SubscribeUpdatesModal';

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

function isPlayoffTeam(teamName: string): boolean {
  const playoffPatterns = ['UEFA Playoff', 'FIFA Playoff', 'Playoff Winner', 'TBD'];
  return playoffPatterns.some(pattern => teamName.includes(pattern));
}

function getTeamData(teamName: string): Team | null {
  if (isPlayoffTeam(teamName)) return null;
  return teams.find(t => t.name.toLowerCase() === teamName.toLowerCase()) || null;
}

function getTeamFlag(teamName: string): string {
  if (isPlayoffTeam(teamName)) return '🏳️';
  const team = teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
  return team?.flagEmoji || '🏳️';
}

function buildMapMarkers(city: CityData): MapMarker[] {
  const markers: MapMarker[] = [
    { lat: city.stadiumLat, lng: city.stadiumLng, type: 'stadium', name: city.stadium, description: `${city.capacity.toLocaleString()} capacity` },
    { lat: city.airport.lat, lng: city.airport.lng, type: 'airport', name: `${city.airport.code} Airport`, description: city.airport.name },
  ];
  if (city.fanFest) {
    markers.push({ lat: city.fanFest.lat, lng: city.fanFest.lng, type: 'fanFest', name: 'Fan Festival', description: city.fanFest.name });
  }
  city.lodgingZones.forEach(zone => {
    markers.push({ lat: zone.lat, lng: zone.lng, type: 'lodging', name: zone.name, description: `${zone.tier} - ${zone.priceRange}` });
  });
  return markers;
}

interface MatchPageTemplateProps {
  match: Match;
}

export default function MatchPageTemplate({ match }: MatchPageTemplateProps) {
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const searchParams = useSearchParams();
  const filmingMode = searchParams.get('filming') === 'true';
  
  const city = getCityByName(match.city);
  if (!city) {
    return <div>City data not found for {match.city}</div>;
  }

  const mapMarkers = buildMapMarkers(city);
  const team1Flag = getTeamFlag(match.team1);
  const team2Flag = getTeamFlag(match.team2);
  const team1Data = getTeamData(match.team1);
  const team2Data = getTeamData(match.team2);
  const team1IsPlayoff = isPlayoffTeam(match.team1);
  const team2IsPlayoff = isPlayoffTeam(match.team2);

  const centerLat = mapMarkers.reduce((sum, m) => sum + m.lat, 0) / mapMarkers.length;
  const centerLng = mapMarkers.reduce((sum, m) => sum + m.lng, 0) / mapMarkers.length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-500/50 via-blue-400/50 to-blue-500/50 text-gray-900 py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block bg-white/50 backdrop-blur-sm rounded-full px-5 py-2 text-base md:text-lg font-bold mb-5 border-[3px] border-black/30">
              ⚽ MATCH {match.matchNumber} • GROUP STAGE
            </div>
            
            <div className="flex items-center justify-center gap-8 md:gap-16 mb-6">
              <div className="text-center">
                <div className="text-6xl md:text-8xl mb-2">{team1Flag}</div>
                <div className="text-2xl md:text-3xl font-bold">{match.team1}</div>
              </div>
              <div className="text-4xl md:text-5xl font-bold opacity-60">VS</div>
              <div className="text-center">
                <div className="text-6xl md:text-8xl mb-2">{team2Flag}</div>
                <div className="text-2xl md:text-3xl font-bold">{match.team2}</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-base md:text-lg">
              <span className="bg-white/50 px-4 py-2 rounded-full border-[3px] border-black/30">📅 {match.date}</span>
              <span className="bg-white/50 px-4 py-2 rounded-full border-[3px] border-black/30">⏰ {match.time} ET</span>
              <span className="bg-white/50 px-4 py-2 rounded-full border-[3px] border-black/30">🏟️ {city.stadium}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        
        {/* TEAM PROFILES - Shown first in filming mode */}
        {filmingMode && (team1Data || team2Data) && (
          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-green-300/50 rounded-2xl p-6 text-gray-900 shadow-lg border-[3px] border-black/30">
              <h2 className="text-2xl font-bold mb-4">{team1Flag} {match.team1}</h2>
              {team1IsPlayoff ? (
                <div className="bg-green-200/50 border-[3px] border-black/30 rounded-xl p-4 text-center py-8">
                  <div className="text-4xl mb-3">⏳</div>
                  <h3 className="font-bold text-lg mb-2">Playoff Team - TBD</h3>
                  <p className="text-sm">This team will be determined after the March 2026 playoffs.</p>
                </div>
              ) : team1Data ? (
                <div className="space-y-4">
                  <div className="bg-green-200/50 border-[3px] border-black/30 rounded-xl p-4">
                    <h3 className="font-semibold mb-2">📊 Quick Stats</h3>
                    <ul className="text-sm space-y-1">
                      {team1Data.fifaRanking && <li>• <strong>FIFA Ranking:</strong> #{team1Data.fifaRanking}</li>}
                      {team1Data.appearances && <li>• <strong>WC Appearances:</strong> {team1Data.appearances}</li>}
                      {team1Data.bestFinish && <li>• <strong>Best Finish:</strong> {team1Data.bestFinish}</li>}
                      {team1Data.coach && <li>• <strong>Coach:</strong> {team1Data.coach}</li>}
                      <li>• <strong>Confederation:</strong> {team1Data.confederation}</li>
                    </ul>
                  </div>
                  {team1Data.starPlayers && team1Data.starPlayers.length > 0 && (
                    <div className="bg-green-200/50 border-[3px] border-black/30 rounded-xl p-4">
                      <h3 className="font-semibold mb-2">⭐ Key Players</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {team1Data.starPlayers.slice(0, 4).map((player, i) => (
                          <div key={i} className="bg-white/50 border-[3px] border-black/30 rounded-lg p-2 text-center">
                            <div className="font-bold">{player.name}</div>
                            <div>{player.position}</div>
                            <div className="text-[10px]">{player.club}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {team1Data.fanCulture && (
                    <div className="bg-green-200/50 border-[3px] border-black/30 rounded-xl p-4">
                      <h3 className="font-semibold mb-2">🎉 Fan Culture</h3>
                      <p className="text-sm">{team1Data.fanCulture.traditions}</p>
                      {team1Data.fanCulture.famous_chant && (
                        <p className="text-xs mt-2 italic">🎵 &quot;{team1Data.fanCulture.famous_chant}&quot;</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-green-200/50 border-[3px] border-black/30 rounded-xl p-4">
                  <p className="text-sm">Detailed team profile coming soon...</p>
                </div>
              )}
            </section>

            <section className="bg-red-300/50 rounded-2xl p-6 text-gray-900 shadow-lg border-[3px] border-black/30">
              <h2 className="text-2xl font-bold mb-4">{team2Flag} {match.team2}</h2>
              {team2IsPlayoff ? (
                <div className="bg-red-200/50 border-[3px] border-black/30 rounded-xl p-4 text-center py-8">
                  <div className="text-4xl mb-3">⏳</div>
                  <h3 className="font-bold text-lg mb-2">Playoff Team - TBD</h3>
                  <p className="text-sm">This team will be determined after the March 2026 playoffs.</p>
                </div>
              ) : team2Data ? (
                <div className="space-y-4">
                  <div className="bg-red-200/50 border-[3px] border-black/30 rounded-xl p-4">
                    <h3 className="font-semibold mb-2">📊 Quick Stats</h3>
                    <ul className="text-sm space-y-1">
                      {team2Data.fifaRanking && <li>• <strong>FIFA Ranking:</strong> #{team2Data.fifaRanking}</li>}
                      {team2Data.appearances && <li>• <strong>WC Appearances:</strong> {team2Data.appearances}</li>}
                      {team2Data.bestFinish && <li>• <strong>Best Finish:</strong> {team2Data.bestFinish}</li>}
                      {team2Data.coach && <li>• <strong>Coach:</strong> {team2Data.coach}</li>}
                      <li>• <strong>Confederation:</strong> {team2Data.confederation}</li>
                    </ul>
                  </div>
                  {team2Data.starPlayers && team2Data.starPlayers.length > 0 && (
                    <div className="bg-red-200/50 border-[3px] border-black/30 rounded-xl p-4">
                      <h3 className="font-semibold mb-2">⭐ Key Players</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {team2Data.starPlayers.slice(0, 4).map((player, i) => (
                          <div key={i} className="bg-white/50 border-[3px] border-black/30 rounded-lg p-2 text-center">
                            <div className="font-bold">{player.name}</div>
                            <div>{player.position}</div>
                            <div className="text-[10px]">{player.club}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {team2Data.fanCulture && (
                    <div className="bg-red-200/50 border-[3px] border-black/30 rounded-xl p-4">
                      <h3 className="font-semibold mb-2">🎉 Fan Culture</h3>
                      <p className="text-sm">{team2Data.fanCulture.traditions}</p>
                      {team2Data.fanCulture.famous_chant && (
                        <p className="text-xs mt-2 italic">🎵 &quot;{team2Data.fanCulture.famous_chant}&quot;</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-200/50 border-[3px] border-black/30 rounded-xl p-4">
                  <p className="text-sm">Detailed team profile coming soon...</p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* MAP SECTION - Blue */}
        <section className="bg-blue-300/50 rounded-2xl p-6 text-gray-900 shadow-lg border-[3px] border-black/30">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            📍 {city.city} - Key Locations
          </h2>
          <div className="bg-white rounded-xl overflow-hidden border-[3px] border-black/30">
            <MatchMap 
              markers={mapMarkers} 
              center={{ lat: centerLat, lng: centerLng }}
              zoom={11}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-200/50 border-[3px] border-black/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{city.capacity.toLocaleString()}</div>
              <div className="text-xs">Capacity</div>
            </div>
            <div className="bg-blue-200/50 border-[3px] border-black/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{city.transit}</div>
              <div className="text-xs">Transit Rating</div>
            </div>
            <div className="bg-blue-200/50 border-[3px] border-black/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{city.airport.code}</div>
              <div className="text-xs">Airport</div>
            </div>
            <div className="bg-blue-200/50 border-[3px] border-black/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{city.country}</div>
              <div className="text-xs">Country</div>
            </div>
          </div>
        </section>

        {/* TEAM PROFILES - Normal position (hidden in filming mode) */}
        {!filmingMode && (team1Data || team2Data) && (
          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-green-300/50 rounded-2xl p-6 text-gray-900 shadow-lg border-[3px] border-black/30">
              <h2 className="text-2xl font-bold mb-4">{team1Flag} {match.team1}</h2>
              {team1IsPlayoff ? (
                <div className="bg-green-200/50 border-[3px] border-black/30 rounded-xl p-4 text-center py-8">
                  <div className="text-4xl mb-3">⏳</div>
                  <h3 className="font-bold text-lg mb-2">Playoff Team - TBD</h3>
                  <p className="text-sm">This team will be determined after the March 2026 playoffs.</p>
                </div>
              ) : team1Data ? (
                <div className="space-y-4">
                  <div className="bg-green-200/50 border-[3px] border-black/30 rounded-xl p-4">
                    <h3 className="font-semibold mb-2">📊 Quick Stats</h3>
                    <ul className="text-sm space-y-1">
                      {team1Data.fifaRanking && <li>• <strong>FIFA Ranking:</strong> #{team1Data.fifaRanking}</li>}
                      {team1Data.appearances && <li>• <strong>WC Appearances:</strong> {team1Data.appearances}</li>}
                      {team1Data.bestFinish && <li>• <strong>Best Finish:</strong> {team1Data.bestFinish}</li>}
                      {team1Data.coach && <li>• <strong>Coach:</strong> {team1Data.coach}</li>}
                      <li>• <strong>Confederation:</strong> {team1Data.confederation}</li>
                    </ul>
                  </div>
                  {team1Data.starPlayers && team1Data.starPlayers.length > 0 && (
                    <div className="bg-green-200/50 border-[3px] border-black/30 rounded-xl p-4">
                      <h3 className="font-semibold mb-2">⭐ Key Players</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {team1Data.starPlayers.slice(0, 4).map((player, i) => (
                          <div key={i} className="bg-white/50 border-[3px] border-black/30 rounded-lg p-2 text-center">
                            <div className="font-bold">{player.name}</div>
                            <div>{player.position}</div>
                            <div className="text-[10px]">{player.club}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {team1Data.fanCulture && (
                    <div className="bg-green-200/50 border-[3px] border-black/30 rounded-xl p-4">
                      <h3 className="font-semibold mb-2">🎉 Fan Culture</h3>
                      <p className="text-sm">{team1Data.fanCulture.traditions}</p>
                      {team1Data.fanCulture.famous_chant && (
                        <p className="text-xs mt-2 italic">🎵 &quot;{team1Data.fanCulture.famous_chant}&quot;</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-green-200/50 border-[3px] border-black/30 rounded-xl p-4">
                  <p className="text-sm">Detailed team profile coming soon...</p>
                </div>
              )}
            </section>

            <section className="bg-red-300/50 rounded-2xl p-6 text-gray-900 shadow-lg border-[3px] border-black/30">
              <h2 className="text-2xl font-bold mb-4">{team2Flag} {match.team2}</h2>
              {team2IsPlayoff ? (
                <div className="bg-red-200/50 border-[3px] border-black/30 rounded-xl p-4 text-center py-8">
                  <div className="text-4xl mb-3">⏳</div>
                  <h3 className="font-bold text-lg mb-2">Playoff Team - TBD</h3>
                  <p className="text-sm">This team will be determined after the March 2026 playoffs.</p>
                </div>
              ) : team2Data ? (
                <div className="space-y-4">
                  <div className="bg-red-200/50 border-[3px] border-black/30 rounded-xl p-4">
                    <h3 className="font-semibold mb-2">📊 Quick Stats</h3>
                    <ul className="text-sm space-y-1">
                      {team2Data.fifaRanking && <li>• <strong>FIFA Ranking:</strong> #{team2Data.fifaRanking}</li>}
                      {team2Data.appearances && <li>• <strong>WC Appearances:</strong> {team2Data.appearances}</li>}
                      {team2Data.bestFinish && <li>• <strong>Best Finish:</strong> {team2Data.bestFinish}</li>}
                      {team2Data.coach && <li>• <strong>Coach:</strong> {team2Data.coach}</li>}
                      <li>• <strong>Confederation:</strong> {team2Data.confederation}</li>
                    </ul>
                  </div>
                  {team2Data.starPlayers && team2Data.starPlayers.length > 0 && (
                    <div className="bg-red-200/50 border-[3px] border-black/30 rounded-xl p-4">
                      <h3 className="font-semibold mb-2">⭐ Key Players</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {team2Data.starPlayers.slice(0, 4).map((player, i) => (
                          <div key={i} className="bg-white/50 border-[3px] border-black/30 rounded-lg p-2 text-center">
                            <div className="font-bold">{player.name}</div>
                            <div>{player.position}</div>
                            <div className="text-[10px]">{player.club}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {team2Data.fanCulture && (
                    <div className="bg-red-200/50 border-[3px] border-black/30 rounded-xl p-4">
                      <h3 className="font-semibold mb-2">🎉 Fan Culture</h3>
                      <p className="text-sm">{team2Data.fanCulture.traditions}</p>
                      {team2Data.fanCulture.famous_chant && (
                        <p className="text-xs mt-2 italic">🎵 &quot;{team2Data.fanCulture.famous_chant}&quot;</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-200/50 border-[3px] border-black/30 rounded-xl p-4">
                  <p className="text-sm">Detailed team profile coming soon...</p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* GOING TO THIS MATCH CTA */}
        <section className="bg-gradient-to-r from-amber-200/60 via-yellow-200/60 to-amber-200/60 rounded-2xl p-6 text-gray-900 shadow-lg border-[3px] border-amber-500/50">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">🎟️ Going to this match?</h2>
            <p className="text-sm mb-4 max-w-lg mx-auto">
              Get everything you need in one place - complete travel guide, transit tips, lodging recommendations, and more.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link 
                href="/cityguides" 
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2 rounded-full text-sm transition-colors border-[3px] border-amber-700/50"
              >
                📄 Get the City Guide PDF - $3.99
              </Link>
              <Link 
                href="/planner" 
                className="bg-white hover:bg-gray-100 text-gray-900 font-bold px-5 py-2 rounded-full text-sm transition-colors border-[3px] border-black/30"
              >
                ⭐ Full Access Membership
              </Link>
            </div>
          </div>
        </section>

        {/* GETTING TO THE STADIUM - Teal */}
        <section className="bg-teal-300/50 rounded-2xl p-6 text-gray-900 shadow-lg border-[3px] border-black/30">
          <h2 className="text-2xl font-bold mb-4">🚇 Getting to {city.stadium}</h2>
          
          <div className="bg-teal-200/50 border-[3px] border-black/30 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-sm font-bold border-[3px] ${
                city.transit === 'EXCELLENT' ? 'bg-green-300/60 border-green-600/50' :
                city.transit === 'GOOD' ? 'bg-blue-300/60 border-blue-600/50' :
                city.transit === 'LIMITED' ? 'bg-yellow-300/60 border-yellow-600/50' :
                'bg-red-300/60 border-red-600/50'
              }`}>
                {city.transit} TRANSIT
              </span>
            </div>
            <p className="text-sm">{city.transitNote}</p>
          </div>

          {city.transit === 'EXCELLENT' || city.transit === 'GOOD' ? (
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-green-300/50 border-[3px] border-black/30 rounded-xl p-4">
                <div className="text-lg font-bold mb-2">✅ RECOMMENDED</div>
                <h3 className="font-semibold">Public Transit</h3>
                <p className="text-sm mt-2">{city.transitNote}</p>
              </div>
              <div className="bg-yellow-200/50 border-[3px] border-black/30 rounded-xl p-4">
                <div className="text-lg font-bold mb-2">⚠️ USE CAUTION</div>
                <h3 className="font-semibold">Rideshare (Uber/Lyft)</h3>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Surge pricing on match days</li>
                  <li>• Long waits post-match</li>
                </ul>
              </div>
              <div className="bg-red-300/50 border-[3px] border-black/30 rounded-xl p-4">
                <div className="text-lg font-bold mb-2">❌ NOT RECOMMENDED</div>
                <h3 className="font-semibold">Driving</h3>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Heavy traffic</li>
                  <li>• Limited parking</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-yellow-200/50 border-[3px] border-black/30 rounded-xl p-4">
                <div className="text-lg font-bold mb-2">⚠️ RIDESHARE</div>
                <h3 className="font-semibold">Uber/Lyft/DiDi</h3>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Book early</li>
                  <li>• Expect surge pricing</li>
                  <li>• Allow extra time</li>
                </ul>
              </div>
              <div className="bg-blue-300/50 border-[3px] border-black/30 rounded-xl p-4">
                <div className="text-lg font-bold mb-2">🚗 DRIVING</div>
                <h3 className="font-semibold">Drive & Park</h3>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Pre-book parking if possible</li>
                  <li>• Arrive 2+ hours early</li>
                  <li>• Expect delays leaving</li>
                </ul>
              </div>
            </div>
          )}

          <div className="bg-teal-200/50 border-[3px] border-black/30 rounded-xl p-4">
            <h3 className="font-semibold mb-2">💡 Pro Tips</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>• Arrive 2+ hours before kickoff</div>
              <div>• Check weather - {city.weatherNote.split('.')[0]}</div>
              <div>• Have backup transportation plan</div>
              <div>• Download transit apps in advance</div>
            </div>
          </div>
        </section>

        {/* WHERE TO STAY - Rose */}
        <section className="bg-rose-300/50 rounded-2xl p-6 text-gray-900 shadow-lg border-[3px] border-black/30">
          <h2 className="text-2xl font-bold mb-4">🏨 Where to Stay in {city.city}</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {city.lodgingZones.filter(z => z.tier === 'luxury').slice(0, 1).map(zone => (
              <div key={zone.name} className="bg-amber-200/50 border-[3px] border-amber-600/50 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wide mb-1">💎 LUXURY</div>
                <h3 className="font-bold text-lg">{zone.name}</h3>
                <div className="text-2xl font-bold my-2">{zone.priceRange}</div>
                <p className="text-sm">{zone.description}</p>
              </div>
            ))}
            {city.lodgingZones.filter(z => z.tier === 'midrange').slice(0, 1).map(zone => (
              <div key={zone.name} className="bg-white/70 border-[3px] border-black/30 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wide mb-1 text-rose-600">⭐ MID-RANGE</div>
                <h3 className="font-bold text-lg">{zone.name}</h3>
                <div className="text-2xl font-bold my-2">{zone.priceRange}</div>
                <p className="text-sm">{zone.description}</p>
              </div>
            ))}
            {city.lodgingZones.filter(z => z.tier === 'budget').slice(0, 1).map(zone => (
              <div key={zone.name} className="bg-rose-200/50 border-[3px] border-black/30 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wide mb-1">💰 BUDGET</div>
                <h3 className="font-bold text-lg">{zone.name}</h3>
                <div className="text-2xl font-bold my-2">{zone.priceRange}</div>
                <p className="text-sm">{zone.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-rose-200/50 border-[3px] border-black/30 rounded-xl p-4">
            <h3 className="font-semibold mb-2">📍 All Lodging Areas</h3>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              {city.lodgingZones.map(zone => (
                <div key={zone.name}>
                  <strong>{zone.name}</strong>
                  <div>{zone.priceRange}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stay22 Lodging Widget */}
          {(() => {
            const stay22Embeds: Record<string, string> = {
              'Houston': '69387c5667173ecf386132b2',
              'Toronto': '69388209f30a4998429650ce',
              'Boston': '693a6a59f30a499842993d3f',
              'New York / New Jersey': '693a6b33f30a499842993e6e',
              'Philadelphia': '693a6b5bf30a499842993eab',
              'Atlanta': '693a6c06f30a499842993fbc',
              'Miami': '693a6c3cf30a49984299404b',
              'Dallas': '693a6c6e67173ecf3864331e',
              'Kansas City': '693a6ca067173ecf3864338f',
              'Mexico City': '693a6ce4f30a49984299419d',
              'Guadalajara': '693a6d7067173ecf386434f6',
              'Monterrey': '693a6dc467173ecf3864363b',
              'Los Angeles': '693a6dec67173ecf386436b8',
              'San Francisco Bay Area': '693a6e1167173ecf3864372c',
              'Seattle': '693a6e36f30a499842994543',
              'Vancouver': '693a6e7b67173ecf386437de',
            };
            const embedId = stay22Embeds[city.city];
            if (!embedId) return null;
            return (
              <div className="mt-4 bg-white/70 border-[3px] border-black/30 rounded-xl p-4">
                <h3 className="font-semibold mb-3">🔍 Search Available Lodging in {city.city}</h3>
                <iframe 
                  id="stay22-widget" 
                  width="100%" 
                  height="428" 
                  src={`https://www.stay22.com/embed/${embedId}`}
                  frameBorder="0"
                  title={`${city.city} Lodging Search`}
                  className="rounded-lg"
                />
              </div>
            );
          })()}
        </section>

        {/* WEATHER & SAFETY - Indigo */}
        <section className="bg-indigo-300/50 rounded-2xl p-6 text-gray-900 shadow-lg border-[3px] border-black/30">
          <h2 className="text-2xl font-bold mb-4">🌤️ Weather & Safety</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-indigo-200/50 border-[3px] border-black/30 rounded-xl p-4">
              <h3 className="font-semibold mb-2">☀️ Weather</h3>
              <p className="text-sm">{city.weatherNote}</p>
            </div>
            <div className="bg-indigo-200/50 border-[3px] border-black/30 rounded-xl p-4">
              <h3 className="font-semibold mb-2">🛡️ Safety Tips</h3>
              <ul className="text-sm space-y-1">
                {city.safetyTips.map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAN FEST - Orange */}
        {city.fanFest && (
          <section className="bg-orange-200/50 rounded-2xl p-6 text-gray-900 shadow-lg border-[3px] border-black/30">
            <h2 className="text-2xl font-bold mb-4">🎉 Fan Festival</h2>
            <div className="bg-orange-100/50 border-[3px] border-black/30 rounded-xl p-4">
              <h3 className="text-xl font-bold mb-2">{city.fanFest.name}</h3>
              <p className="text-sm">
                Official FIFA Fan Festival location in {city.city}. Watch matches on big screens, 
                enjoy live entertainment, food, and connect with fans from around the world.
              </p>
            </div>
          </section>
        )}

        {/* OTHER MATCHES IN THIS CITY */}
        <section className="bg-gray-300/50 rounded-2xl p-6 text-gray-900 shadow-lg border-[3px] border-black/30">
          <h2 className="text-2xl font-bold mb-4">📅 Other Matches in {city.city}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {groupStageMatches
              .filter(m => m.city === match.city && m.matchNumber !== match.matchNumber)
              .slice(0, 6)
              .map(m => (
                <Link 
                  key={m.matchNumber}
                  href={`/matches/view/${m.team1.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-vs-${m.team2.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                  className="bg-white/50 border-[3px] border-black/30 rounded-xl p-3 hover:bg-white/70 transition-colors"
                >
                  <div className="font-bold">Match {m.matchNumber}</div>
                  <div className="text-sm">{getTeamFlag(m.team1)} {m.team1} vs {getTeamFlag(m.team2)} {m.team2}</div>
                  <div className="text-xs">{m.date} • {m.time} ET</div>
                </Link>
              ))}
          </div>
        </section>

        {/* PHASE 2 / UPDATES SECTION */}
        <section className="bg-gradient-to-b from-slate-200/70 to-slate-300/70 rounded-2xl p-8 text-gray-900 shadow-lg border-[3px] border-slate-400/50">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-block bg-slate-100 rounded-full px-4 py-1 text-sm font-bold mb-4 border-[3px] border-slate-400/50">
              📅 PHASE 2 / UPDATES
            </div>
            <h2 className="text-2xl font-bold mb-4">This page will be updated</h2>
            <p className="text-sm mb-6 leading-relaxed">
              This site contains all the known information to date as of <strong>December 2025</strong>. 
              We will be updating these pages in <strong>March 2026</strong> after the qualifier playoffs 
              and again in <strong>May 2026</strong> when all the official and unofficial fan fest 
              activities are published.
            </p>
            <p className="text-sm mb-6 font-medium">
              Subscribe to make sure you are alerted as soon as updates are published.
            </p>
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={() => setShowSubscribeModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full text-base transition-colors shadow-lg border-[3px] border-blue-800/50"
              >
                🔔 Subscribe for Updates
              </button>
              <p className="text-xs text-gray-600">Free • No spam • Just World Cup updates</p>
            </div>
          </div>
        </section>

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link href="/matches/view" className="text-blue-600 hover:underline font-semibold">
            ← Back to All Matches
          </Link>
        </div>
      </div>

      {/* Subscribe Modal */}
      <SubscribeUpdatesModal 
        isOpen={showSubscribeModal} 
        onClose={() => setShowSubscribeModal(false)} 
      />
    </div>
  );
}
