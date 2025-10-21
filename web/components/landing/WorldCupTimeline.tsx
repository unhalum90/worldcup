"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Timeline of key World Cup 2026 dates and milestones
 * Compact view with hover interactions to reveal details
 */
export default function WorldCupTimeline() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const t = useTranslations("timeline");

  const events = [
    {
      date: t('events.visaLottery.date'),
      title: t('events.visaLottery.title'),
      desc: t('events.visaLottery.desc'),
      details: t('events.visaLottery.details'),
      phase: "past",
      icon: "🎟️",
      alwaysShow: true,
    },
    {
      date: t('events.generalSales.date'),
      title: t('events.generalSales.title'),
      desc: t('events.generalSales.desc'),
      details: t('events.generalSales.details'),
      phase: "upcoming",
      icon: "🎫",
    },
    {
      date: t('events.finalDraw.date'),
      title: t('events.finalDraw.title'),
      desc: t('events.finalDraw.desc'),
      details: t('events.finalDraw.details'),
      phase: "upcoming",
      icon: "⚡",
    },
    {
      date: t('events.lastMinute.date'),
      title: t('events.lastMinute.title'),
      desc: t('events.lastMinute.desc'),
      details: t('events.lastMinute.details'),
      phase: "upcoming",
      icon: "🏆",
    },
    {
      date: t('events.openingMatch.date'),
      title: t('events.openingMatch.title'),
      desc: t('events.openingMatch.desc'),
      details: t('events.openingMatch.details'),
      phase: "tournament",
      icon: "⚽",
      highlight: true,
    },
    {
      date: t('events.groupStage.date'),
      title: t('events.groupStage.title'),
      desc: t('events.groupStage.desc'),
      details: t('events.groupStage.details'),
      phase: "tournament",
      icon: "🌍",
    },
    {
      date: t('events.round32.date'),
      title: t('events.round32.title'),
      desc: t('events.round32.desc'),
      details: t('events.round32.details'),
      phase: "tournament",
      icon: "🔥",
    },
    {
      date: t('events.round16.date'),
      title: t('events.round16.title'),
      desc: t('events.round16.desc'),
      details: t('events.round16.details'),
      phase: "tournament",
      icon: "🎯",
    },
    {
      date: t('events.quarterFinals.date'),
      title: t('events.quarterFinals.title'),
      desc: t('events.quarterFinals.desc'),
      details: t('events.quarterFinals.details'),
      phase: "tournament",
      icon: "🌟",
    },
    {
      date: t('events.semiFinals.date'),
      title: t('events.semiFinals.title'),
      desc: t('events.semiFinals.desc'),
      details: t('events.semiFinals.details'),
      phase: "tournament",
      icon: "🏃",
    },
    {
      date: t('events.thirdPlace.date'),
      title: t('events.thirdPlace.title'),
      desc: t('events.thirdPlace.desc'),
      details: t('events.thirdPlace.details'),
      phase: "tournament",
      icon: "🥉",
    },
    {
      date: t('events.final.date'),
      title: t('events.final.title'),
      desc: t('events.final.desc'),
      details: t('events.final.details'),
      phase: "tournament",
      icon: "🏆",
      highlight: true,
      alwaysShow: true,
    },
  ];

  return (
    <section className="container mt-12 sm:mt-16 mb-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
          {t('title')}
        </h2>
        <p className="text-sm sm:text-base text-[color:var(--color-neutral-700)] max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Always use compact horizontal timeline for a cleaner, modern look */}
      <div className="relative">
        <div className="relative overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-3 min-w-max px-4 relative">
            {/* Horizontal line for mobile */}
            <div className="absolute top-[20px] left-0 right-0 h-1 bg-gradient-to-r from-[color:var(--color-primary)] via-[color:var(--color-accent-green)] to-[color:var(--color-accent-red)]" />
            
            {events.map((event, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center min-w-[100px] relative z-10"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Icon */}
                <div
                  className={`flex items-center justify-center border-3 border-white shadow-lg rounded-full transition-all duration-300 cursor-pointer ${
                    hoveredIdx === idx ? "scale-125 shadow-2xl" : ""
                  } ${
                    event.highlight
                      ? "w-11 h-11 text-lg bg-[color:var(--color-accent-red)] text-white"
                      : "w-10 h-10 text-base " +
                        (event.phase === "past"
                          ? "bg-gray-300"
                          : event.phase === "upcoming"
                          ? "bg-[color:var(--color-primary)] text-white"
                          : "bg-[color:var(--color-accent-green)] text-white")
                  }`}
                >
                  {event.icon}
                </div>

                {/* Hover Tooltip - Desktop */}
                {hoveredIdx === idx && (
                  <div className="hidden md:block absolute top-14 left-1/2 -translate-x-1/2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50 animate-fadeIn">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
                    <div className="text-xs font-bold text-[color:var(--color-primary)] mb-1">
                      {event.date}
                    </div>
                    <div className="text-sm font-bold mb-2">{event.title}</div>
                    <div className="text-xs text-gray-600 leading-relaxed">
                      {event.details}
                    </div>
                  </div>
                )}

                {/* Content - Always visible on mobile */}
                <div className="text-center mt-3">
                  <div className="text-[10px] font-bold text-[color:var(--color-primary)] mb-0.5">
                    {event.date}
                  </div>
                  <div className="text-xs font-bold mb-0.5 leading-tight">{event.title}</div>
                  <div className="text-[10px] text-[color:var(--color-neutral-700)] leading-tight">
                    {event.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="text-center mt-4">
          <p className="text-[10px] text-[color:var(--color-neutral-700)] font-medium">
            {t('swipeHint')}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-gray-300 border-2 border-white shadow" />
          <span className="text-[color:var(--color-neutral-700)] font-medium">{t('legend.past')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[color:var(--color-primary)] border-2 border-white shadow" />
          <span className="text-[color:var(--color-neutral-700)] font-medium">{t('legend.upcoming')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[color:var(--color-accent-green)] border-2 border-white shadow" />
          <span className="text-[color:var(--color-neutral-700)] font-medium">{t('legend.tournament')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[color:var(--color-accent-red)] border-2 border-white shadow" />
          <span className="text-[color:var(--color-neutral-700)] font-medium">{t('legend.highlight')}</span>
        </div>
      </div>
    </section>
  );
}
