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

  // Array of fact image filenames - update this when you add your PNG files
  const facts = [
    'fact_01.png',
    'fact_02.png',
    'fact_03.png',
    'fact_04.png',
    'fact_05.png',
    'fact_06.png',
    'fact_07.png',
    'fact_08.png',
    'fact_09.png',
    'fact_10.png',
    // Add more as you create them
  ];

  const totalFacts = facts.length;

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
          <Image
            src={`/did_you_know/${facts[currentIndex]}`}
            alt={`World Cup History Fact ${currentIndex + 1}`}
            fill
            className="object-contain p-8"
            priority={currentIndex === 0}
          />
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
