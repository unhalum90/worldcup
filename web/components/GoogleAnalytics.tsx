'use client';

import Script from 'next/script';

export default function GoogleAnalytics() {
  // Hard-disable GA unless explicitly enabled via env flag
  const enabled = process.env.NEXT_PUBLIC_ENABLE_GA === 'true';
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!enabled || !measurementId) {
    // Silently do nothing when GA is disabled or missing config
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Helper function to track custom events
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', eventName, eventParams);
  }
};
