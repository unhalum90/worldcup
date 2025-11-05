"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useI18nFormatters } from "@/lib/i18nFormatters";

/**
 * Countdown timer to the opening match on June 11, 2026 at Estadio Azteca
 */
export default function CountdownTimer({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const t = useTranslations("landing.countdown");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Opening match: June 11, 2026 at Estadio Azteca, Mexico City
    // Assuming kickoff at 8:00 PM Mexico City time (CDT/CST)
    const targetDate = new Date("2026-06-11T20:00:00-05:00").getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  const containerClasses = [
    "inline-flex items-center text-white shadow-lg bg-gradient-to-r from-[color:var(--color-primary)] to-[color:var(--color-accent-green)]",
    compact ? "gap-2 px-5 py-2.5 rounded-full" : "gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-xl",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      <div className="flex items-center gap-1">
        <span className={compact ? "text-base" : "text-xl"}>⚽</span>
        <span className={compact ? "text-[10px] sm:text-xs font-semibold" : "text-xs sm:text-sm font-semibold"}>{t("kickoffBadge")}</span>
      </div>
      
      <div className={compact ? "flex items-center gap-2" : "flex items-center gap-2 sm:gap-3"}>
        <TimeUnit value={timeLeft.days} label={t("labels.days")} compact={compact} />
        <Separator compact={compact} />
        <TimeUnit value={timeLeft.hours} label={t("labels.hours")} compact={compact} />
        <Separator compact={compact} />
        <TimeUnit value={timeLeft.minutes} label={t("labels.minutes")} compact={compact} />
        <Separator compact={compact} />
        <TimeUnit value={timeLeft.seconds} label={t("labels.seconds")} compact={compact} />
      </div>
    </div>
  );
}

function TimeUnit({ value, label, compact }: { value: number; label: string; compact?: boolean }) {
  const { number } = useI18nFormatters();
  return (
    <div className={compact ? "flex flex-col items-center min-w-[2.2rem]" : "flex flex-col items-center min-w-[2.5rem] sm:min-w-[3rem]"}>
      <div className={compact ? "text-base sm:text-lg font-bold tabular-nums" : "text-xl sm:text-2xl font-bold tabular-nums"}>
        {number(value, { minimumIntegerDigits: 2 })}
      </div>
      <div className={compact ? "text-[9px] sm:text-[10px] font-medium opacity-90 uppercase tracking-wide" : "text-[0.6rem] sm:text-xs font-medium opacity-90 uppercase tracking-wide"}>
        {label}
      </div>
    </div>
  );
}

function Separator({ compact }: { compact?: boolean }) {
  return <div className={compact ? "text-lg font-bold opacity-50" : "text-xl sm:text-2xl font-bold opacity-50"}>:</div>;
}
