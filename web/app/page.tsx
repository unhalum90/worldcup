import HeroSplit from "@/components/HeroSplit";
import CountdownTimer from "@/components/CountdownTimer";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import DemoSection from "@/components/landing/DemoSection";
import WorldCupTimeline from "@/components/landing/WorldCupTimeline";
import QualifiedTeamsSection from "@/components/landing/QualifiedTeamsSection";
import SectionDivider from "@/components/SectionDivider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'WC26 Fan Zone | Your Ultimate 2026 FIFA World Cup Guide',
  description: 'Plan your perfect World Cup 2026 experience. City travel guides, fan forums, and AI-powered trip planning for all 16 host cities across USA, Canada, and Mexico.',
  keywords: ['World Cup 2026', 'FIFA', 'travel planner', 'host cities', 'fan guide', 'USA', 'Canada', 'Mexico', 'travel guides', 'fan forums'],
  authors: [{ name: 'WC26 Fan Zone' }],
  creator: 'WC26 Fan Zone',
  publisher: 'WC26 Fan Zone',
  alternates: {
    canonical: 'https://worldcup26fanzone.com',
  },
  openGraph: {
    title: 'WC26 Fan Zone | Your Ultimate 2026 FIFA World Cup Guide',
    description: 'City guides, fan forums, and AI trip planner for World Cup 2026',
    url: 'https://worldcup26fanzone.com',
    siteName: 'WC26 Fan Zone',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['es_ES', 'fr_FR', 'pt_BR', 'ar_AR'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WC26 Fan Zone | Your Ultimate 2026 FIFA World Cup Guide',
    description: 'City guides, fan forums, and AI trip planner for World Cup 2026',
    creator: '@wc26fanzone',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function Home() {
  return (
    <>
      <HeroSplit />
      <div className="flex justify-center py-6">
        <CountdownTimer />
      </div>
      {/* Alternating backgrounds with subtle dividers for better rhythm */}
      <section className="bg-white">
        <FeatureShowcase />
      </section>
      <SectionDivider />
      <section className="bg-gray-50">
        <DemoSection />
      </section>
      <SectionDivider />
      <section className="bg-white">
        <WorldCupTimeline />
      </section>
      <SectionDivider />
      <section className="bg-gray-50">
        <QualifiedTeamsSection />
      </section>
      {/* One more divider to separate the last section from the footer */}
      <SectionDivider className="mt-8" />
    </>
  );
}
