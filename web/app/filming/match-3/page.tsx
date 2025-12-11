'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Generic video backgrounds (free from Pexels/Pixabay)
const videoBackgrounds = {
  stadium: 'https://videos.pexels.com/video-files/2657261/2657261-uhd_2560_1440_24fps.mp4', // Aerial soccer match
  crowd: 'https://videos.pexels.com/video-files/3722209/3722209-hd_1920_1080_25fps.mp4', // Stadium packed with fans
  match: 'https://videos.pexels.com/video-files/4729195/4729195-hd_1920_1080_25fps.mp4', // Football match drone
};

// Stadium images - add your photos to /public/images/stadiums/[slug].jpg
const stadiumImages: Record<string, string> = {
  'toronto': '/images/stadiums/toronto.jpg',
  'mexico-city': '/images/stadiums/mexico-city.jpg',
  'los-angeles': '/images/stadiums/los-angeles.jpg',
  'new-york': '/images/stadiums/new-york.jpg',
  'miami': '/images/stadiums/miami.jpg',
  'houston': '/images/stadiums/houston.png',
  'dallas': '/images/stadiums/dallas.jpg',
  'atlanta': '/images/stadiums/atlanta.jpg',
  'boston': '/images/stadiums/boston.jpg',
  'philadelphia': '/images/stadiums/philadelphia.jpg',
  'seattle': '/images/stadiums/seattle.jpg',
  'san-francisco': '/images/stadiums/san-francisco.jpg',
  'kansas-city': '/images/stadiums/kansas-city.jpg',
  'guadalajara': '/images/stadiums/guadalajara.jpg',
  'monterrey': '/images/stadiums/monterrey.jpg',
  'vancouver': '/images/stadiums/vancouver.jpg',
};

// Match 3 Data
const matchData = {
  matchNumber: 3,
  date: 'June 12, 2026',
  time: '3:00 PM ET',
  city: 'Toronto',
  citySlug: 'toronto',
  stadium: 'BMO Field',
  capacity: '40,000+ (Expanded)',
  surface: 'Hybrid Grass',
  team1: {
    name: 'Canada',
    slug: 'canada',
    flagEmoji: '🇨🇦',
    nickname: 'Les Rouges',
    fifaRanking: 26,
    appearances: 2,
    bestFinish: 'Group Stage (1986, 2022)',
    coach: 'Jesse Marsch',
    primaryColor: '#FF0000',
    starPlayers: [
      { name: 'Alphonso Davies', position: 'Defender', club: 'Bayern Munich' },
      { name: 'Jonathan David', position: 'Forward', club: 'Lille' },
      { name: 'Cyle Larin', position: 'Forward', club: 'Mallorca' },
    ],
  },
  team2: {
    name: 'UEFA Playoff Winner A',
    slug: 'uefa-playoff-winner-a',
    flagEmoji: '🏳️',
    nickname: 'TBD',
    fifaRanking: null,
    appearances: null,
    bestFinish: 'TBD',
    coach: 'TBD',
    primaryColor: '#666666',
    starPlayers: [],
    isProvisional: true,
  },
};

const sections = [
  'intro',
  'venue',
  'team1-profile',
  'team1-players',
  'team2-profile',
  'preview',
  'endcard',
] as const;

type Section = (typeof sections)[number];

export default function FilmingPage() {
  const [currentSection, setCurrentSection] = useState<Section>('intro');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stadiumImageExists, setStadiumImageExists] = useState(true);

  const currentIndex = sections.indexOf(currentSection);

  // Check if stadium image exists
  useEffect(() => {
    const img = new window.Image();
    img.src = stadiumImages[matchData.citySlug] || '';
    img.onload = () => setStadiumImageExists(true);
    img.onerror = () => setStadiumImageExists(false);
  }, []);

  const goNext = () => {
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1]);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1]);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key >= '1' && e.key <= '7') {
        const idx = parseInt(e.key) - 1;
        if (idx < sections.length) {
          setCurrentSection(sections[idx]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background Video - Generic soccer footage */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      >
        <source src={videoBackgrounds.stadium} type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-red-900/40" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation Bar (hidden during filming with ?film=true) */}
        <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-between z-50">
          <div className="flex items-center gap-4">
            <span className="text-red-500 font-bold">FILMING MODE</span>
            <span className="text-gray-400">Match {matchData.matchNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            {sections.map((section, idx) => (
              <button
                key={section}
                onClick={() => setCurrentSection(section)}
                className={`w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  currentSection === section
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1 bg-gray-800 rounded text-sm hover:bg-gray-700"
            >
              {isFullscreen ? 'Exit FS' : 'Fullscreen (F)'}
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 flex items-center justify-center pt-20 pb-20">
          {currentSection === 'intro' && <IntroSection match={matchData} />}
          {currentSection === 'venue' && <VenueSection match={matchData} />}
          {currentSection === 'team1-profile' && <TeamProfileSection team={matchData.team1} />}
          {currentSection === 'team1-players' && <PlayersSection team={matchData.team1} />}
          {currentSection === 'team2-profile' && <TeamProfileSection team={matchData.team2} isProvisional />}
          {currentSection === 'preview' && <PreviewSection match={matchData} />}
          {currentSection === 'endcard' && <EndCardSection match={matchData} />}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="px-6 py-2 bg-gray-800 rounded-lg disabled:opacity-30 hover:bg-gray-700 transition-all"
          >
            ← Previous
          </button>
          <div className="text-center">
            <span className="text-gray-400">
              {currentIndex + 1} / {sections.length}
            </span>
            <span className="mx-4 text-gray-600">|</span>
            <span className="text-gray-500 text-sm">Arrow keys or Space to navigate</span>
          </div>
          <button
            onClick={goNext}
            disabled={currentIndex === sections.length - 1}
            className="px-6 py-2 bg-red-600 rounded-lg disabled:opacity-30 hover:bg-red-700 transition-all"
          >
            Next →
          </button>
        </nav>
      </div>
    </div>
  );
}

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

function IntroSection({ match }: { match: typeof matchData }) {
  return (
    <div className="text-center px-8 animate-fadeIn">
      <div className="mb-8">
        <span className="inline-block px-6 py-2 bg-red-600/80 rounded-full text-lg font-bold tracking-wider">
          MATCH {match.matchNumber}
        </span>
      </div>

      <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight">
        <span className="text-7xl md:text-9xl">{match.team1.flagEmoji}</span>
        <span className="mx-6 text-gray-500">vs</span>
        <span className="text-7xl md:text-9xl">{match.team2.flagEmoji}</span>
      </h1>

      <h2 className="text-4xl md:text-5xl font-bold mb-6">
        {match.team1.name} <span className="text-red-500">vs</span> {match.team2.name}
      </h2>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-xl text-gray-300">
        <div className="flex items-center gap-2">
          <span className="text-red-500">📍</span>
          <span>{match.city}</span>
        </div>
        <div className="hidden md:block text-gray-600">|</div>
        <div className="flex items-center gap-2">
          <span className="text-red-500">🏟️</span>
          <span>{match.stadium}</span>
        </div>
        <div className="hidden md:block text-gray-600">|</div>
        <div className="flex items-center gap-2">
          <span className="text-red-500">📅</span>
          <span>{match.date}</span>
        </div>
        <div className="hidden md:block text-gray-600">|</div>
        <div className="flex items-center gap-2">
          <span className="text-red-500">⏰</span>
          <span>{match.time}</span>
        </div>
      </div>
    </div>
  );
}

function VenueSection({ match }: { match: typeof matchData }) {
  const stadiumImage = stadiumImages[match.citySlug];
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="w-full max-w-6xl mx-auto px-8 animate-fadeIn">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Info */}
        <div>
          <h2 className="text-2xl font-bold text-red-500 mb-4 tracking-wider">THE VENUE</h2>
          <h3 className="text-5xl md:text-6xl font-black mb-6">
            {match.stadium}
            <span className="block text-red-500 text-3xl mt-2">{match.city}</span>
          </h3>

          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            The stage is set in {match.city} for a thrilling encounter.{' '}
            {match.stadium} will be packed with fans creating an electric atmosphere
            for this historic World Cup match.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🏟️</span>
              <div>
                <span className="text-gray-400 text-sm block">Capacity</span>
                <span className="text-xl font-bold">{match.capacity}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-3xl">🌿</span>
              <div>
                <span className="text-gray-400 text-sm block">Surface</span>
                <span className="text-xl font-bold">{match.surface}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Stadium Image or Video Fallback */}
        <div className="relative aspect-video rounded-2xl overflow-hidden border-4 border-white/20">
          {stadiumImage && !imageError ? (
            <>
              <Image
                src={stadiumImage}
                alt={`${match.stadium} in ${match.city}`}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
              <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded text-sm">
                📍 {match.stadium}, {match.city}
              </div>
            </>
          ) : (
            <>
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={videoBackgrounds.crowd} type="video/mp4" />
              </video>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">🏟️</span>
                  <p className="text-xl font-bold">{match.stadium}</p>
                  <p className="text-gray-400">Add image: /images/stadiums/{match.citySlug}.jpg</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamProfileSection({
  team,
  isProvisional = false,
}: {
  team: typeof matchData.team1 | typeof matchData.team2;
  isProvisional?: boolean;
}) {
  if (isProvisional) {
    return (
      <div className="text-center px-8 animate-fadeIn">
        <h2 className="text-2xl font-bold text-red-500 mb-4 tracking-wider">THE OPPONENT</h2>
        <h3 className="text-5xl md:text-7xl font-black mb-6">{team.name}</h3>
        <div className="w-24 h-1 bg-red-600 mx-auto mb-8" />
        <p className="text-2xl text-gray-400 max-w-2xl mx-auto">
          Team to be determined via upcoming playoffs
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-8 animate-fadeIn">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-2 h-16 bg-red-600" />
        <h2 className="text-4xl md:text-5xl font-black">
          TEAM PROFILE: {team.name.toUpperCase()}
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Identity Card */}
        <div className="bg-gray-900/60 backdrop-blur rounded-2xl p-8 border border-gray-700">
          <h3 className="text-red-500 font-bold text-xl mb-6 flex items-center gap-2">
            <span>🚩</span> IDENTITY
          </h3>
          <div className="space-y-4">
            <div>
              <span className="text-gray-400">Nickname:</span>
              <span className="ml-2 text-xl font-semibold">{team.nickname}</span>
            </div>
            <div>
              <span className="text-gray-400">World Ranking:</span>
              <span className="ml-2 text-xl font-semibold">#{team.fifaRanking}</span>
            </div>
            <div>
              <span className="text-gray-400">Head Coach:</span>
              <span className="ml-2 text-xl font-semibold">{team.coach}</span>
            </div>
          </div>
        </div>

        {/* History Card */}
        <div className="bg-gray-900/60 backdrop-blur rounded-2xl p-8 border border-gray-700">
          <h3 className="text-red-500 font-bold text-xl mb-6 flex items-center gap-2">
            <span>🏆</span> HISTORY
          </h3>
          <div className="space-y-4">
            <div>
              <span className="text-gray-400">World Cup Appearances:</span>
              <span className="ml-2 text-xl font-semibold">{team.appearances}</span>
            </div>
            <div>
              <span className="text-gray-400">Best Finish:</span>
              <span className="ml-2 text-xl font-semibold">{team.bestFinish}</span>
            </div>
            {'isProvisional' in team && !team.isProvisional && (
              <p className="text-gray-400 mt-4 italic">
                The hosts are looking to make history on home soil.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayersSection({ team }: { team: typeof matchData.team1 }) {
  return (
    <div className="w-full max-w-6xl mx-auto px-8 animate-fadeIn">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-2 h-16 bg-red-600" />
        <h2 className="text-4xl md:text-5xl font-black">PLAYERS TO WATCH</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {team.starPlayers.map((player, idx) => (
          <div
            key={player.name}
            className="bg-gray-900/60 backdrop-blur rounded-2xl overflow-hidden border border-gray-700 hover:border-red-500 transition-all"
          >
            {/* Player Image Placeholder */}
            <div
              className="aspect-square flex items-center justify-center text-9xl"
              style={{ backgroundColor: `${team.primaryColor}20` }}
            >
              {team.flagEmoji}
            </div>

            {/* Player Info */}
            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-2">{player.name}</h3>
              <p className="text-gray-400 uppercase tracking-wider text-sm">
                {player.position} / {player.club}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewSection({ match }: { match: typeof matchData }) {
  return (
    <div className="text-center px-8 animate-fadeIn max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-red-500 mb-6 tracking-wider">MATCH PREVIEW</h2>

      <h3 className="text-4xl md:text-5xl font-black mb-8">
        This {match.city} showdown promises to be a thrilling encounter
      </h3>

      <div className="w-24 h-1 bg-red-600 mx-auto mb-8" />

      <p className="text-xl text-gray-300 leading-relaxed mb-8">
        {match.stadium} will be packed with fans from both nations, creating an
        electric atmosphere for this historic World Cup clash.
      </p>

      <div className="inline-flex items-center gap-4 text-2xl">
        <span className="text-6xl">{match.team1.flagEmoji}</span>
        <span className="text-red-500 font-bold">VS</span>
        <span className="text-6xl">{match.team2.flagEmoji}</span>
      </div>
    </div>
  );
}

function EndCardSection({ match }: { match: typeof matchData }) {
  return (
    <div className="text-center px-8 animate-fadeIn">
      <div className="mb-8">
        <span className="inline-block px-6 py-2 bg-red-600 rounded-full text-lg font-bold tracking-wider">
          MATCH {match.matchNumber}
        </span>
      </div>

      <h2 className="text-4xl md:text-6xl font-black mb-6">
        {match.team1.name} vs {match.team2.name}
      </h2>

      <div className="flex flex-col items-center gap-2 text-xl text-gray-300 mb-12">
        <span>{match.city} | {match.date} | {match.time}</span>
      </div>

      <div className="w-24 h-1 bg-red-600 mx-auto mb-8" />

      <div className="text-3xl md:text-4xl font-bold text-red-500">
        worldcup26fanzone.com
      </div>

      <p className="mt-4 text-gray-400">
        Travel guides • Lodging • Fan fests • Everything you need
      </p>
    </div>
  );
}
