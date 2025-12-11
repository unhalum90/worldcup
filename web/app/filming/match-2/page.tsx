'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const videoBackgrounds = {
  stadium: 'https://videos.pexels.com/video-files/2657261/2657261-uhd_2560_1440_24fps.mp4',
  crowd: 'https://videos.pexels.com/video-files/3722209/3722209-hd_1920_1080_25fps.mp4',
  match: 'https://videos.pexels.com/video-files/4729195/4729195-hd_1920_1080_25fps.mp4',
};

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

// Match 2 Data - South Korea vs UEFA Playoff Winner D
const matchData = {
  matchNumber: 2,
  date: 'June 11, 2026',
  time: '10:00 PM ET',
  city: 'Guadalajara',
  citySlug: 'guadalajara',
  stadium: 'Estadio Akron',
  capacity: '49,850',
  surface: 'Hybrid Grass',
  team1: {
    name: 'South Korea',
    slug: 'south-korea',
    flagEmoji: '🇰🇷',
    nickname: 'Taegeuk Warriors',
    fifaRanking: 23,
    appearances: 11,
    bestFinish: 'Fourth Place (2002)',
    coach: 'Jürgen Klinsmann',
    primaryColor: '#CD2E3A',
    starPlayers: [
      { name: 'Son Heung-min', position: 'Forward', club: 'Tottenham' },
      { name: 'Lee Kang-in', position: 'Midfielder', club: 'Paris Saint-Germain' },
      { name: 'Kim Min-jae', position: 'Defender', club: 'Bayern Munich' },
    ],
  },
  team2: {
    name: 'UEFA Playoff Winner D',
    slug: 'uefa-playoff-winner-d',
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

  const currentIndex = sections.indexOf(currentSection);

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
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      >
        <source src={videoBackgrounds.stadium} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-red-900/40" />

      <div className="relative z-10 min-h-screen flex flex-col">
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
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1 bg-gray-800 rounded text-sm hover:bg-gray-700"
          >
            {isFullscreen ? 'Exit FS' : 'Fullscreen (F)'}
          </button>
        </nav>

        <main className="flex-1 flex items-center justify-center pt-20 pb-20">
          {currentSection === 'intro' && <IntroSection match={matchData} />}
          {currentSection === 'venue' && <VenueSection match={matchData} />}
          {currentSection === 'team1-profile' && <TeamProfileSection team={matchData.team1} />}
          {currentSection === 'team1-players' && <PlayersSection team={matchData.team1} />}
          {currentSection === 'team2-profile' && <TeamProfileSection team={matchData.team2} isProvisional />}
          {currentSection === 'preview' && <PreviewSection match={matchData} />}
          {currentSection === 'endcard' && <EndCardSection match={matchData} />}
        </main>

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
        <div>
          <h2 className="text-2xl font-bold text-red-500 mb-4 tracking-wider">THE VENUE</h2>
          <h3 className="text-5xl md:text-6xl font-black mb-6">
            {match.stadium}
            <span className="block text-red-500 text-3xl mt-2">{match.city}</span>
          </h3>

          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            The stage is set in {match.city} for a thrilling encounter.{' '}
            {match.stadium} will be packed with fans creating an electric atmosphere.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold text-red-400">{match.capacity}</div>
              <div className="text-gray-400">Capacity</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold text-red-400">{match.surface}</div>
              <div className="text-gray-400">Surface</div>
            </div>
          </div>
        </div>

        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
          {stadiumImage && !imageError ? (
            <Image
              src={stadiumImage}
              alt={match.stadium}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900/50 to-black">
              <div className="text-center">
                <div className="text-6xl mb-4">🏟️</div>
                <div className="text-2xl font-bold">{match.stadium}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamProfileSection({ team, isProvisional = false }: { 
  team: {
    name: string;
    slug: string;
    flagEmoji: string;
    nickname: string;
    fifaRanking: number | null;
    appearances: number | null;
    bestFinish: string;
    coach: string;
    primaryColor: string;
    starPlayers: { name: string; position: string; club: string; }[];
  }; 
  isProvisional?: boolean 
}) {
  if (isProvisional) {
    return (
      <div className="text-center px-8 animate-fadeIn max-w-4xl mx-auto">
        <div className="text-9xl mb-6">{team.flagEmoji}</div>
        <h2 className="text-5xl md:text-7xl font-black mb-4">{team.name}</h2>
        <p className="text-2xl text-gray-400 mb-8">To be determined via UEFA Playoffs</p>
        <div className="bg-white/10 rounded-xl p-8">
          <p className="text-xl text-gray-300">
            This team will be determined through the UEFA playoff system.
            Stay tuned for updates as the tournament approaches!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center px-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="text-9xl mb-6">{team.flagEmoji}</div>
      
      <h2 className="text-5xl md:text-7xl font-black mb-4">{team.name}</h2>
      
      {team.nickname && (
        <p className="text-2xl text-red-400 mb-8 italic">&ldquo;{team.nickname}&rdquo;</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-3xl font-bold text-red-400">#{team.fifaRanking}</div>
          <div className="text-gray-400 text-sm">FIFA Ranking</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-3xl font-bold text-red-400">{team.appearances}</div>
          <div className="text-gray-400 text-sm">WC Appearances</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-xl font-bold text-red-400">{team.bestFinish}</div>
          <div className="text-gray-400 text-sm">Best Finish</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-xl font-bold text-red-400">{team.coach}</div>
          <div className="text-gray-400 text-sm">Manager</div>
        </div>
      </div>
    </div>
  );
}

function PlayersSection({ team }: { team: typeof matchData.team1 }) {
  if (!team.starPlayers || team.starPlayers.length === 0) {
    return null;
  }

  return (
    <div className="text-center px-8 animate-fadeIn max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-red-500 mb-2 tracking-wider">KEY PLAYERS</h2>
      <h3 className="text-5xl font-black mb-8">
        {team.flagEmoji} {team.name}
      </h3>

      <div className="grid md:grid-cols-3 gap-8">
        {team.starPlayers.map((player, idx) => (
          <div key={idx} className="bg-white/10 rounded-xl p-6 text-left">
            <div className="text-4xl mb-4">⭐</div>
            <h4 className="text-2xl font-bold mb-2">{player.name}</h4>
            <p className="text-red-400 text-lg mb-1">{player.position}</p>
            <p className="text-gray-400">{player.club}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewSection({ match }: { match: typeof matchData }) {
  return (
    <div className="text-center px-8 animate-fadeIn max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-red-500 mb-4 tracking-wider">MATCH PREVIEW</h2>

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
