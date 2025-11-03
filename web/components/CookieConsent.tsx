"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const STORAGE_KEY = "cookie_consent";
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-S72D3YZ9LZ";

const ensureGtag = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    ((...args: unknown[]) => {
      window.dataLayer?.push(args);
    });
};

const CookieConsent = () => {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "true") {
      setHasConsent(true);
      ensureGtag();
    }
  }, []);

  const handleAccept = () => {
    setHasConsent(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
      ensureGtag();
      window.gtag?.("js", new Date());
      window.gtag?.("config", GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
      });
    }
  };

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      {hasConsent && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
            `}
          </Script>
        </>
      )}

      {!hasConsent && (
        <div className="fixed inset-x-0 bottom-0 z-[1000] bg-neutral-900/95 text-white shadow-lg">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="leading-6 text-neutral-100">
              We use cookies to analyze site traffic and improve your experience.
              By clicking Accept, you agree to enable Google Analytics.
            </p>
            <button
              type="button"
              onClick={handleAccept}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900"
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
