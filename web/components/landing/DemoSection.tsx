'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function DemoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const t = useTranslations('landing.demo');

  return (
    <section className="container py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            {t('title')}
          </h2>
          <p className="text-[color:var(--color-neutral-700)] text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Video Player Placeholder */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-900 to-purple-900 aspect-video">
          {!isPlaying ? (
            <>
              {/* Placeholder Background with Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
              
              <div className="relative h-full flex flex-col items-center justify-center p-8 text-center text-white">
                {/* Play Button */}
                <button
                  onClick={() => setIsPlaying(true)}
                  className="group mb-6 w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-300 shadow-xl"
                  aria-label={t('playButton')}
                >
                  <svg
                    className="w-10 h-10 text-white ml-1 group-hover:scale-110 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>

                <h3 className="text-2xl font-bold mb-3">
                  {t('watchDemo')}
                </h3>
                <p className="text-white/80 max-w-md">
                  {t('demoDescription')}
                </p>

                {/* Duration Badge */}
                <div className="mt-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium">
                  {t('duration')}
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-8 right-8 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
              <div className="absolute bottom-8 left-8 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <video
                controls
                autoPlay
                className="w-full h-full"
                poster="/demo-thumbnail.jpg"
              >
                <source src="/demo-video.mp4" type="video/mp4" />
                {t('videoError')}
              </video>
            </div>
          )}
        </div>

        {/* Call-out Message */}
        <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <p className="text-center text-gray-800">
            <span className="font-bold">{t('callout')}</span> — {t('launchDate')}
          </p>
        </div>
      </div>
    </section>
  );
}
