"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  title?: string;
  height?: number | string;
};

// A tiny client component that lazy-loads an iframe when it scrolls into view.
export default function MapEmbed({ src, title = "City map", height = 320 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (visible) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className="w-full rounded-md overflow-hidden">
      {visible ? (
        <iframe
          src={src}
          title={title}
          className="w-full"
          style={{ height: typeof height === "number" ? `${height}px` : height }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="w-full h-48 bg-[color:var(--color-neutral-50)] flex items-center justify-center text-sm text-[color:var(--color-neutral-600)]">Map loading…</div>
      )}
    </div>
  );
}
