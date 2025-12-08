import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { groupStageMatches } from '@/lib/matchesData';
import { getTeamBySlug, teams } from '@/lib/teamsData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type Props = {
  params: Promise<{ slug: string }>;
};

interface RedditQuote {
  quote: string;
  username: string;
  subreddit: string;
}

interface MatchPage {
  id: string;
  match_number: number;
  slug: string;
  team1: string;
  team2: string;
  match_date: string;
  match_time: string;
  city: string;
  stadium: string;
  status: 'draft' | 'published';
  youtube_url: string | null;
  team1_storyline: string | null;
  team2_storyline: string | null;
  rivalry_context: string | null;
  fan_experience: string | null;
  infographic_url: string | null;
  map_embed_url: string | null;
  reddit_quotes: RedditQuote[];
  seo_title: string | null;
  seo_description: string | null;
}

async function getMatchBySlug(slug: string): Promise<MatchPage | null> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from('match_pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateStaticParams() {
  // Generate params for all matches
  return groupStageMatches.map((match) => {
    const slug = `${match.team1.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-vs-${match.team2.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
    return { slug };
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const match = await getMatchBySlug(slug);

  if (!match) {
    return { title: 'Match Not Found' };
  }

  const title = match.seo_title || `Match ${match.match_number}: ${match.team1} vs ${match.team2} - ${match.city} Travel Guide`;
  const description = match.seo_description || `Everything you need to know about ${match.team1} vs ${match.team2} at ${match.stadium} in ${match.city}. Travel tips, stadium info, and fan experience.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://worldcup26fanzone.com/matches/${match.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://worldcup26fanzone.com/matches/${match.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// Helper to find team info
function findTeamInfo(teamName: string) {
  const normalizedName = teamName.toLowerCase();
  return teams.find(t => 
    t.name.toLowerCase() === normalizedName ||
    t.name.toLowerCase().includes(normalizedName) ||
    normalizedName.includes(t.name.toLowerCase())
  );
}

// Helper to get other matches for a team
function getTeamOtherMatches(teamName: string, currentMatchNumber: number) {
  const normalizedTeam = teamName.toLowerCase();
  return groupStageMatches.filter(match => {
    if (match.matchNumber === currentMatchNumber) return false;
    const t1 = match.team1.toLowerCase();
    const t2 = match.team2.toLowerCase();
    return t1.includes(normalizedTeam) || normalizedTeam.includes(t1) ||
           t2.includes(normalizedTeam) || normalizedTeam.includes(t2);
  });
}

// Helper to extract YouTube video ID
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

// Helper to render markdown (simple version)
function renderMarkdown(text: string | null): string {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}

export default async function MatchPage({ params }: Props) {
  const { slug } = await params;
  const match = await getMatchBySlug(slug);

  if (!match) {
    notFound();
  }

  const team1Info = findTeamInfo(match.team1);
  const team2Info = findTeamInfo(match.team2);
  const team1OtherMatches = getTeamOtherMatches(match.team1, match.match_number);
  const team2OtherMatches = getTeamOtherMatches(match.team2, match.match_number);
  const youtubeEmbedUrl = match.youtube_url ? getYouTubeEmbedUrl(match.youtube_url) : null;

  // City slug for linking
  const citySlug = match.city.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace('new-yorknew-jersey', 'new-york')
    .replace('san-francisco-bay-area', 'san-francisco');

  // Schema.org structured data
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": `${match.team1} vs ${match.team2}`,
    "description": match.seo_description || `World Cup 2026 Group Stage Match ${match.match_number}`,
    "startDate": `2026-${match.match_date.includes('June') ? '06' : '07'}-${match.match_date.match(/\d+/)?.[0]?.padStart(2, '0')}`,
    "location": {
      "@type": "StadiumOrArena",
      "name": match.stadium,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": match.city
      }
    },
    "competitor": [
      { "@type": "SportsTeam", "name": match.team1 },
      { "@type": "SportsTeam", "name": match.team2 }
    ],
    "sport": "Soccer",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/matches" className="text-white/80 hover:text-white flex items-center text-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Matches
            </Link>
          </div>

          {/* Match Header */}
          <div className="text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-1 text-sm font-semibold mb-4">
              Match {match.match_number} • Group Stage
            </div>
            
            <div className="flex items-center justify-center gap-8 mb-6">
              {/* Team 1 */}
              <div className="text-center">
                {team1Info && (
                  <Link href={`/teams/${team1Info.slug}`}>
                    <div className="text-6xl md:text-8xl mb-2">{team1Info.flagEmoji}</div>
                  </Link>
                )}
                <div className="text-2xl md:text-3xl font-bold">{match.team1}</div>
              </div>

              {/* VS */}
              <div className="text-3xl md:text-4xl font-bold text-white/60">vs</div>

              {/* Team 2 */}
              <div className="text-center">
                {team2Info && (
                  <Link href={`/teams/${team2Info.slug}`}>
                    <div className="text-6xl md:text-8xl mb-2">{team2Info.flagEmoji}</div>
                  </Link>
                )}
                <div className="text-2xl md:text-3xl font-bold">{match.team2}</div>
              </div>
            </div>

            {/* Match Details */}
            <div className="flex flex-wrap justify-center gap-6 text-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {match.match_date}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {match.match_time} ET
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <Link href={`/guides/${citySlug}`} className="hover:underline">
                  {match.stadium}, {match.city}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* YouTube Video */}
            {youtubeEmbedUrl && (
              <section className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={`${match.team1} vs ${match.team2} Video`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </section>
            )}

            {/* Team Storylines */}
            {(match.team1_storyline || match.team2_storyline) && (
              <section className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Storylines</h2>
                
                {match.team1_storyline && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      {team1Info && <span className="text-2xl">{team1Info.flagEmoji}</span>}
                      {match.team1}
                    </h3>
                    <div 
                      className="prose prose-gray max-w-none"
                      dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(match.team1_storyline)}</p>` }}
                    />
                  </div>
                )}

                {match.team2_storyline && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      {team2Info && <span className="text-2xl">{team2Info.flagEmoji}</span>}
                      {match.team2}
                    </h3>
                    <div 
                      className="prose prose-gray max-w-none"
                      dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(match.team2_storyline)}</p>` }}
                    />
                  </div>
                )}
              </section>
            )}

            {/* Rivalry Context */}
            {match.rivalry_context && (
              <section className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Historical Context</h2>
                <div 
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(match.rivalry_context)}</p>` }}
                />
              </section>
            )}

            {/* Infographic */}
            {match.infographic_url && (
              <section className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Match Preview</h2>
                <img 
                  src={match.infographic_url} 
                  alt={`${match.team1} vs ${match.team2} infographic`}
                  className="w-full rounded-lg"
                />
              </section>
            )}

            {/* Fan Experience */}
            {match.fan_experience && (
              <section className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Fan Experience</h2>
                <div 
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(match.fan_experience)}</p>` }}
                />
              </section>
            )}

            {/* Reddit Quotes */}
            {match.reddit_quotes && match.reddit_quotes.length > 0 && (
              <section className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What Fans Are Saying</h2>
                <div className="space-y-4">
                  {match.reddit_quotes.map((quote, index) => (
                    <blockquote key={index} className="bg-gray-50 rounded-lg p-6 border-l-4 border-orange-500">
                      <p className="text-gray-800 italic text-lg">&ldquo;{quote.quote}&rdquo;</p>
                      <footer className="mt-3 text-sm text-gray-600">
                        — u/{quote.username} on{' '}
                        <a 
                          href={`https://reddit.com/r/${quote.subreddit}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:underline"
                        >
                          r/{quote.subreddit}
                        </a>
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </section>
            )}

            {/* Map */}
            {match.map_embed_url && (
              <section className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-900">Stadium Location</h2>
                </div>
                <div className="aspect-video">
                  <iframe
                    src={match.map_embed_url}
                    title={`${match.stadium} location`}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-md p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Planning to attend?</h3>
              <p className="text-blue-100 mb-4">
                Get personalized travel recommendations for this match.
              </p>
              <Link 
                href="/membership"
                className="block w-full bg-white text-blue-800 text-center py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Build Your Trip →
              </Link>
            </div>

            {/* City Guide Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">📍 {match.city} Travel Guide</h3>
              <p className="text-gray-600 mb-4">
                Everything you need to know about traveling to {match.city} for the World Cup.
              </p>
              <Link 
                href={`/guides/${citySlug}`}
                className="block w-full bg-gray-100 text-gray-800 text-center py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                View City Guide →
              </Link>
            </div>

            {/* Team's Other Matches */}
            {team1OtherMatches.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  {team1Info && <span className="text-xl">{team1Info.flagEmoji}</span>}
                  {match.team1}&apos;s Other Matches
                </h3>
                <div className="space-y-3">
                  {team1OtherMatches.map(m => {
                    const opponent = m.team1.toLowerCase().includes(match.team1.toLowerCase()) 
                      ? m.team2 : m.team1;
                    const matchSlug = `${m.team1.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-vs-${m.team2.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
                    return (
                      <Link 
                        key={m.matchNumber}
                        href={`/matches/${matchSlug}`}
                        className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-medium text-gray-900">vs {opponent}</div>
                        <div className="text-sm text-gray-600">{m.date} • {m.city}</div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {team2OtherMatches.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  {team2Info && <span className="text-xl">{team2Info.flagEmoji}</span>}
                  {match.team2}&apos;s Other Matches
                </h3>
                <div className="space-y-3">
                  {team2OtherMatches.map(m => {
                    const opponent = m.team1.toLowerCase().includes(match.team2.toLowerCase()) 
                      ? m.team2 : m.team1;
                    const matchSlug = `${m.team1.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-vs-${m.team2.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
                    return (
                      <Link 
                        key={m.matchNumber}
                        href={`/matches/${matchSlug}`}
                        className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-medium text-gray-900">vs {opponent}</div>
                        <div className="text-sm text-gray-600">{m.date} • {m.city}</div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
