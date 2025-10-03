"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import CTASignup from "@/components/forms/CTASignup";

/**
 * Split hero layout with video on one side and content on the other.
 * Includes countdown timer and modal signup.
 */
export default function HeroSplit() {
  const t = useTranslations("hero");
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="container mt-8 sm:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Video */}
          <div className="order-2 md:order-1">
            <div className="rounded-[var(--radius-lg)] overflow-hidden border border-[color:var(--color-neutral-100)] shadow-lg bg-black">
              <video
                muted
                playsInline
                controls
                poster="/globe.svg"
                className="w-full h-auto"
              >
                <source src="/hero-video.mp4" type="video/mp4" />
                Your browser doesn&apos;t support video playback.
              </video>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 md:order-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-3">
              {t("title")}
            </h1>
            <p className="text-[color:var(--color-neutral-800)] text-base sm:text-lg mb-6">
              {t("subtitle")}
            </p>

            {/* CTA Button */}
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-[color:var(--color-accent-red)] hover:brightness-110 transition-all shadow-lg hover:shadow-xl"
            >
              {t("cta")}
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>

            {/* Secondary Links */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center text-sm font-medium underline underline-offset-4 text-[color:var(--color-primary)]"
              >
                {t("viewBlog")}
              </Link>

              {/* Social Proof */}
              <div className="flex items-center gap-2 text-[color:var(--color-neutral-800)] text-sm">
                <div className="flex -space-x-2">
                  {['🇺🇸', '🇲🇽', '🇨🇦', '🇧🇷', '🇩🇪'].map((flag, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-[color:var(--color-neutral-100)] border-2 border-white flex items-center justify-center text-xs shadow-sm"
                    >
                      {flag}
                    </div>
                  ))}
                </div>
                <span className="font-medium">Join fans worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Join the waitlist</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <CTASignup onSuccess={() => setShowModal(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
