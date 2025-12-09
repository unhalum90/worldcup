import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import MatchPageTemplate from '@/components/matches/MatchPageTemplate';
import { groupStageMatches, type Match } from '@/lib/matchesData';
import { getCityByName } from '@/lib/cityData';
import { teams } from '@/lib/teamsData';

type Props = {
  params: Promise<{ slug: string }>;
};

// Helper to generate slug from match
function generateMatchSlug(match: Match): string {
  return `${match.team1.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-vs-${match.team2.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
}

// Helper to find match by slug
function findMatchBySlug(slug: string): Match | undefined {
  return groupStageMatches.find(match => generateMatchSlug(match) === slug);
}

// Helper to get team flag
function getTeamFlag(teamName: string): string {
  const team = teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
  return team?.flagEmoji || '🏳️';
}

// Generate static params for all 72 matches
export async function generateStaticParams() {
  return groupStageMatches.map(match => ({
    slug: generateMatchSlug(match),
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const match = findMatchBySlug(slug);

  if (!match) {
    return { title: 'Match Not Found' };
  }

  const city = getCityByName(match.city);
  const team1Flag = getTeamFlag(match.team1);
  const team2Flag = getTeamFlag(match.team2);

  return {
    title: `${match.team1} vs ${match.team2} | Match ${match.matchNumber} | ${match.city} - World Cup 2026`,
    description: `Complete travel guide for ${match.team1} vs ${match.team2} at ${match.stadium} in ${match.city}. Stadium info, transit options, where to stay, and fan tips for World Cup 2026.`,
    openGraph: {
      title: `${team1Flag} ${match.team1} vs ${match.team2} ${team2Flag}`,
      description: `Match ${match.matchNumber} at ${match.stadium} in ${match.city} on ${match.date}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${match.team1} vs ${match.team2} - World Cup 2026`,
      description: `${match.date} at ${match.stadium}, ${match.city}`,
    },
  };
}

export default async function MatchCityPage({ params }: Props) {
  const { slug } = await params;
  const match = findMatchBySlug(slug);

  if (!match) {
    notFound();
  }

  return <MatchPageTemplate match={match} />;
}
