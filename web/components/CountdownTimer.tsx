"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useI18nFormatters } from "@/lib/i18nFormatters";

/**
 * Countdown timer to the opening match on June 11, 2026 at Estadio Azteca
 */
export default function CountdownTimer() {
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

  return (
    <div className="inline-flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-[color:var(--color-primary)] to-[color:var(--color-accent-green)] text-white shadow-lg">
      <div className="flex items-center gap-1">
        <span className="text-xl">⚽</span>
        <span className="text-xs sm:text-sm font-semibold">{t("kickoffBadge")}</span>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <TimeUnit value={timeLeft.days} label={t("labels.days")} />
        <Separator />
        <TimeUnit value={timeLeft.hours} label={t("labels.hours")} />
        <Separator />
        <TimeUnit value={timeLeft.minutes} label={t("labels.minutes")} />
        <Separator />
        <TimeUnit value={timeLeft.seconds} label={t("labels.seconds")} />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  const { number } = useI18nFormatters();
  return (
    <div className="flex flex-col items-center min-w-[2.5rem] sm:min-w-[3rem]">
      <div className="text-xl sm:text-2xl font-bold tabular-nums">
        {number(value, { minimumIntegerDigits: 2 })}
      </div>
      <div className="text-[0.6rem] sm:text-xs font-medium opacity-90 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function Separator() {
  return <div className="text-xl sm:text-2xl font-bold opacity-50">:</div>;
}
