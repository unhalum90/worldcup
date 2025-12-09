'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import MatchPageTemplate from '@/components/matches/MatchPageTemplate';
import { groupStageMatches, type Match } from '@/lib/matchesData';

// Helper to generate slug from match
function generateMatchSlug(match: Match): string {
  return `${match.team1.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-vs-${match.team2.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
}

// Helper to find match by slug
function findMatchBySlug(slug: string): Match | undefined {
  return groupStageMatches.find(match => generateMatchSlug(match) === slug);
}

export default function CityMatchPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundMatch = findMatchBySlug(slug);
    if (foundMatch) {
      setMatch(foundMatch);
    }
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading match...</div>
      </div>
    );
  }

  if (!match) {
    return notFound();
  }

  return <MatchPageTemplate match={match} />;
}
