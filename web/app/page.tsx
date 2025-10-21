import HeroSplit from "@/components/HeroSplit";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import DemoSection from "@/components/landing/DemoSection";
import WorldCupTimeline from "@/components/landing/WorldCupTimeline";
import QualifiedTeamsSection from "@/components/landing/QualifiedTeamsSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'WC26 Fan Zone | Your Ultimate 2026 FIFA World Cup Guide',
  description: 'Plan your perfect World Cup 2026 experience. City travel guides, fan forums, and AI-powered trip planning for all 16 host cities across USA, Canada, and Mexico.',
  keywords: ['World Cup 2026', 'FIFA', 'travel planner', 'host cities', 'fan guide', 'USA', 'Canada', 'Mexico'],
  openGraph: {
    title: 'WC26 Fan Zone | Your Ultimate 2026 FIFA World Cup Guide',
    description: 'City guides, fan forums, and AI trip planner for World Cup 2026',
    type: 'website',
    locale: 'en_US',
  },
};

export default function Home() {
  return (
    <>
      <HeroSplit />
      <FeatureShowcase />
      <QualifiedTeamsSection />
      <DemoSection />
      <WorldCupTimeline />
    </>
  );
}
