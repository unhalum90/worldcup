import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from '@/lib/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "worldcup26fanzone — 2026 World Cup fan travel & community",
  description:
    "Pre‑launch landing: city guides, meetups, matchday planning, and a trip builder for 2026 World Cup fans. Join the waitlist and follow progress on the blog.",
  openGraph: {
    title: "worldcup26fanzone — 2026 World Cup fan travel & community",
    description:
      "City guides, meetups, matchday tips and a trip builder for 2026 World Cup fans. Pre‑launch waitlist now open.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <Analytics />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
