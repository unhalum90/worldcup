"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useI18nFormatters } from "@/lib/i18nFormatters";

type Props = {
  target: string | number | Date;
  label?: string;
  className?: string;
};

/**
 * A compact, subtle countdown showing only days remaining until a target date.
 * Hides itself after the date passes.
 */
export default function MiniCountdown({ target, label, className = "" }: Props) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const { number } = useI18nFormatters();
  const t = useTranslations("landing.countdown");

  useEffect(() => {
    const targetTime = new Date(target).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = targetTime - now;
      if (diff <= 0) {
        setDaysLeft(0);
        return;
      }
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDaysLeft(days);
    };

    tick();
    const id = setInterval(tick, 60_000); // update every minute; seconds precision unnecessary here
    return () => clearInterval(id);
  }, [target]);

  if (daysLeft === null || daysLeft <= 0) return null;

  const resolvedLabel = label ?? t("mini.defaultLabel");
  const formattedCount = number(daysLeft, { maximumFractionDigits: 0 });

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-200 text-sm font-semibold ${className}`}>
      <span aria-hidden>🗓️</span>
      <span>
        {t("mini.pill", { count: daysLeft, formattedCount, label: resolvedLabel })}
      </span>
    </div>
  );
}
