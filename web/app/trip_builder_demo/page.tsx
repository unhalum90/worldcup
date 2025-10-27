"use client";

import React from "react";
import demoItinerary from "@/data/trip_builder_demo.json" assert { type: "json" };
import ItineraryResults from "@/components/ItineraryResults";

export default function TripBuilderDemoPage() {
  const data = demoItinerary as any;
  const tripSummary = data?.tripSummary;

  const tripInput = tripSummary
    ? {
        originCity: tripSummary.origin,
        groupSize: tripSummary.travelers?.adults ?? undefined,
        children: tripSummary.travelers?.children ?? undefined,
        seniors: tripSummary.travelers?.seniors ?? undefined,
        startDate: tripSummary.dates?.start,
        endDate: tripSummary.dates?.end,
        citiesVisiting:
          data?.options?.[0]?.cities?.map((c: any) => c.cityName) ?? undefined,
      }
    : undefined;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <ItineraryResults itinerary={{ options: data.options || [] }} tripInput={tripInput} />
      </div>
    </main>
  );
}

