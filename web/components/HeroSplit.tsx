"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import EmailCaptureModal from "@/components/EmailCaptureModal";
// Removed in favor of direct Beehiiv subscribe CTA

/**
 * Split hero layout with video on one side and content on the other.
 * Includes countdown timer and modal signup.
 */
export default function HeroSplit() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Try to autoplay muted video on mount. If the browser blocks it, ignore the error.
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      const p = v.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          // Autoplay prevented; user will see controls and can click play.
        });
      }
    }
  }, []);

  return (
    <>
      <section className="container mt-8 sm:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Video */}
          <div className="order-2 md:order-1 hidden md:block">
            <div className="rounded-[var(--radius-lg)] overflow-hidden border border-[color:var(--color-neutral-100)] shadow-lg bg-black">
              <video
                ref={videoRef}
                muted
                autoPlay
                playsInline
                controls
                poster="/globe.svg"
                className="w-full h-[280px] sm:h-[360px] md:h-[460px] lg:h-[560px] object-cover"
              >
                <source src="/hero-video.mp4" type="video/mp4" />
                Your browser doesn&apos;t support video playback.
              </video>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 md:order-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-3 sm:mb-4">
              <span className="text-[color:var(--color-accent-red)]">Dallas</span> Isn't in Dallas.{" "}
              <span className="text-[color:var(--color-accent-red)]">Boston</span> Isn't in Boston.{" "}
              <span className="text-[color:var(--color-accent-red)]">Miami</span> Isn't in Miami.
            </h1>
            
            <p className="text-[color:var(--color-neutral-800)] text-sm sm:text-base md:text-lg mb-3 sm:mb-4 font-medium">
              Many World Cup stadiums are 20+ miles from their host cities—
              with no trains, $600/night hotels, and logistics nightmares.
            </p>
            
            <p className="text-[color:var(--color-neutral-700)] text-xs sm:text-sm md:text-base mb-3 sm:mb-4">
              The 2026 World Cup spans <strong>16 cities, 3 countries, and 
              2 million square miles</strong>. We spent 200+ hours mapping every 
              stadium, transit line, and neighborhood quirk.
            </p>
            
            <p className="text-[color:var(--color-neutral-700)] text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
              Get personalized flights, lodging, and day-by-day plans 
              in <strong>60 seconds</strong>—plans that would take you <strong>20+ hours</strong> to research.
            </p>

            {/* Primary CTA with pulse animation */}
            <div className="mb-3 sm:mb-4">
              <button
                onClick={() => setShowEmailModal(true)}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-white bg-[color:var(--color-accent-red)] hover:brightness-110 transition-all animate-subtle-pulse hover:animate-none text-base sm:text-lg w-full sm:w-auto"
              >
                Plan My Trip Free
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
              <div className="text-xs sm:text-sm text-[color:var(--color-neutral-700)] mt-2 flex items-center gap-1.5 font-medium justify-center sm:justify-start">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                No credit card required
              </div>
            </div>

            {/* Secondary CTA */}
            <div className="mb-4 sm:mb-6">
              <button
                onClick={() => {
                  // Scroll to video or play video
                  videoRef.current?.scrollIntoView({ behavior: 'smooth' });
                  videoRef.current?.play();
                }}
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-[color:var(--color-neutral-800)] bg-white border-2 border-[color:var(--color-neutral-800)] hover:bg-[color:var(--color-neutral-800)] hover:text-white transition-all shadow-sm text-sm sm:text-base w-full sm:w-auto"
              >
                Watch How It Works (90 sec)
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Trust indicators */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 text-[color:var(--color-neutral-700)] text-xs sm:text-sm">
                <span className="text-lg sm:text-xl">🌍</span>
                <span><strong>500+ fans</strong> from <strong>15+ countries</strong></span>
              </div>
              
              <div className="flex items-start gap-2 text-[color:var(--color-neutral-700)] text-xs sm:text-sm">
                <span className="text-lg sm:text-xl mt-0.5">🌐</span>
                <span className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                  <span>Available in 5 languages:</span>
                  <span className="text-xs sm:text-sm mt-1 sm:mt-0 sm:ml-1">🇺🇸 English • 🇪🇸 Español • 🇧🇷 Português • 🇫🇷 Français • 🇸🇦 العربية</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Capture Modal */}
      <EmailCaptureModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} />
    </>
  );
}
