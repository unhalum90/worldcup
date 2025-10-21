import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Travel Planner | WC26 Fan Zone',
  description: 'Plan your perfect World Cup 2026 trip with our AI-powered travel planner. Get personalized itineraries, lodging recommendations, and route optimization across host cities.',
  keywords: ['World Cup planner', 'AI travel planner', '2026 trip planning', 'FIFA itinerary', 'host cities'],
};

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
