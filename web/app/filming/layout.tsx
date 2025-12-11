import type { Metadata } from 'next';
import './filming.css';

export const metadata: Metadata = {
  title: 'Filming Mode | World Cup 2026',
  robots: 'noindex, nofollow', // Never index these pages
};

export default function FilmingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black filming-mode">
      {children}
    </div>
  );
}
