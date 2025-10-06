"use client";

import React from "react";

type WireframeProps = {
  variant: "schedule" | "trip" | "city" | "community";
};

export default function Wireframe({ variant }: WireframeProps) {
  // Simple SVG/HTML wireframes matching brand colors and rounded mockup frame
  const commonWrapper = "rounded-2xl overflow-hidden shadow-2xl bg-white p-6 border border-[color:var(--color-neutral-100)]";

  if (variant === "schedule") {
    return (
      <div className={commonWrapper} style={{ maxWidth: 320 }}>
        <div className="bg-black rounded-lg h-[520px] flex items-center justify-center text-white font-bold text-sm">
          Match Schedule Wireframe
        </div>
      </div>
    );
  }

  if (variant === "trip") {
    return (
      <div className={commonWrapper} style={{ maxWidth: 320 }}>
        <div className="bg-gradient-to-br from-[color:var(--color-primary)] to-[color:var(--color-accent-green)] rounded-lg h-[520px] flex flex-col p-4 text-white">
          <div className="h-8 w-32 bg-white/20 rounded-md mb-4" />
          <div className="flex-1 rounded-md bg-white/10 grid grid-rows-4 gap-3 p-3">
            <div className="bg-white/20 rounded h-8" />
            <div className="bg-white/20 rounded h-8" />
            <div className="bg-white/20 rounded h-8" />
            <div className="bg-white/20 rounded h-8" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "city") {
    return (
      <div className={commonWrapper} style={{ maxWidth: 320 }}>
        <div className="bg-white rounded-lg h-[520px] flex flex-col p-4">
          <div className="h-40 bg-gray-100 rounded mb-4 flex items-center justify-center text-sm font-semibold">Map / Hero</div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="bg-gray-100 rounded h-24" />
            <div className="bg-gray-100 rounded h-24" />
            <div className="bg-gray-100 rounded h-24 col-span-2" />
            <div className="bg-gray-100 rounded h-24 col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  // community
  return (
    <div className={commonWrapper} style={{ maxWidth: 320 }}>
      <div className="bg-white rounded-lg h-[520px] flex flex-col p-4">
        <div className="h-12 bg-gray-100 rounded mb-3" />
        <div className="flex-1 overflow-auto space-y-3">
          <div className="h-12 bg-gray-100 rounded" />
          <div className="h-12 bg-gray-100 rounded" />
          <div className="h-12 bg-gray-100 rounded" />
          <div className="h-12 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}
