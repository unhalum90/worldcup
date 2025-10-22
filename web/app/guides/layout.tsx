import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2026 World Cup Host City Guides | WC26 Fan Zone',
  description: 'Complete travel guides for all 16 FIFA World Cup 2026 host cities across USA, Canada, and Mexico. Stadium info, transportation, lodging, and local tips.',
  keywords: ['World Cup 2026', 'host cities', 'travel guides', 'FIFA', 'USA', 'Canada', 'Mexico', 'stadiums', 'city guides'],
  alternates: {
    canonical: 'https://worldcup26fanzone.com/guides',
  },
  openGraph: {
    title: '2026 World Cup Host City Guides',
    description: 'Complete travel guides for all 16 FIFA World Cup 2026 host cities',
    url: 'https://worldcup26fanzone.com/guides',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '2026 World Cup Host City Guides',
    description: 'Complete travel guides for all 16 FIFA World Cup 2026 host cities',
  },
};

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
