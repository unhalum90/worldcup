'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface DidYouKnowCarouselProps {
  /** Optional: custom rotation interval in milliseconds (default: 6000) */
  intervalMs?: number;
}

export default function DidYouKnowCarousel({ intervalMs = 6000 }: DidYouKnowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [missing, setMissing] = useState<boolean[]>([]);
  // Track per-item file extension so we can fall back from PNG -> SVG automatically
  const [ext, setExt] = useState<Array<'png' | 'svg'>>([]);

  // Array of fact image basenames; we will try .png first then .svg for each
  const facts = [
    'fact_01',
    'fact_02',
    'fact_03',
    'fact_04',
    'fact_05',
    'fact_06',
    'fact_07',
    'fact_08',
    'fact_09',
    'fact_10',
    // Add more as you create them
  ];

  const totalFacts = facts.length;
  // Initialize missing flags once
  useEffect(() => {
    setMissing(new Array(totalFacts).fill(false));
    setExt(new Array(totalFacts).fill('png'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-rotate through facts
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [currentIndex, intervalMs]);

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % totalFacts);
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + totalFacts) % totalFacts);
      setIsTransitioning(false);
    }, 300);
  };

  const goToFact = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Main carousel container */}
      <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-blue-200 overflow-hidden">
        {/* Image display */}
        <div
          className={`relative w-full h-[500px] transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {missing[currentIndex] ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <span className="text-sm">Fact image unavailable</span>
            </div>
          ) : (
            <Image
              src={`/did_you_know/${facts[currentIndex]}.${ext[currentIndex] || 'png'}`}
              alt={`World Cup History Fact ${currentIndex + 1}`}
              fill
              className="object-contain p-8"
              priority={currentIndex === 0}
              unoptimized={(ext[currentIndex] || 'png') === 'svg'}
              onError={() => {
                // If PNG failed, try SVG once before declaring missing
                setExt((prev) => {
                  const next = prev.slice();
                  if ((next[currentIndex] || 'png') === 'png') {
                    next[currentIndex] = 'svg';
                  }
                  return next;
                });
                setMissing((prev) => {
                  const next = prev.slice();
                  // Mark missing only if we've already tried svg
                  if ((ext[currentIndex] || 'png') === 'svg') {
                    next[currentIndex] = true;
                  }
                  return next;
                });
              }}
            />
          )}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-blue-600 rounded-full p-3 shadow-lg transition-all hover:scale-110"
          aria-label="Previous fact"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-blue-600 rounded-full p-3 shadow-lg transition-all hover:scale-110"
          aria-label="Next fact"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Progress indicator */}
      <div className="text-center space-y-3">
        <p className="text-sm font-medium text-gray-600">
          Fact {currentIndex + 1} of {totalFacts}
        </p>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2">
          {facts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToFact(index)}
              className={`transition-all rounded-full ${
                index === currentIndex
                  ? 'w-8 h-3 bg-blue-600'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to fact ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Auto-rotation notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500 italic">
          💡 Did you know these facts rotate automatically every 6 seconds?
        </p>
      </div>
    </div>
  );
}
