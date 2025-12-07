import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExitIntentModal from "@/components/ExitIntentModal";
import SubscribeModal from "@/components/SubscribeModal";
import GlobalAuthLauncher from "@/components/GlobalAuthLauncher";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { AuthProvider } from '@/lib/AuthContext';
import LanguageModal from '@/components/LanguageModal';
import { WebVitals } from '@/components/WebVitals';
import ScrollToTop from '@/components/ScrollToTop';
import CookieConsent from "@/components/CookieConsent";
import { createClient } from '@/lib/supabase/server';

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
    "City guides, fan forums, and an AI trip builder for 2026 World Cup fans. Join Fan Zone Insider — our free weekly newsletter for city updates, travel tips, and early access to new guides.",
  openGraph: {
    title: "worldcup26fanzone — 2026 World Cup fan travel & community",
    description:
      "City guides, meetups, matchday tips and a trip builder for 2026 World Cup fans. Subscribe free to Fan Zone Insider for updates.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const locale = await getLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  
  // Feature flag: hide first-visit language selection modal unless explicitly enabled
  const showLanguageModal = process.env.NEXT_PUBLIC_ENABLE_LANGUAGE_MODAL === 'true';

  // Prefetch authenticated user and minimal profile on server for instant header render
  // Use cookie-aware client to read session from request cookies
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialProfile: any = null;
  if (user) {
    try {
      const { data: prof } = await (supabase as any)
        .from('user_profile')
        .select('user_id,name,favorite_team,avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
      initialProfile = prof ?? null;
    } catch {
      initialProfile = null;
    }
  }
  
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Beehiiv attribution / embedded forms support */}
        <Script src="https://subscribe-forms.beehiiv.com/attribution.js" strategy="lazyOnload" />
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <WebVitals />
            {showLanguageModal && <LanguageModal />}
            <Header />
            <main>{children}</main>
            <SubscribeModal />
            <ExitIntentModal />
            <GlobalAuthLauncher />
            <Footer />
            <ScrollToTop />
            <CookieConsent />
            <Analytics />
            <SpeedInsights />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
