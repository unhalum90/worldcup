import HeroSplit from "@/components/HeroSplit";
import WorldCupTimeline from "@/components/landing/WorldCupTimeline";
// Other landing sections removed for staged rebuild: FeatureChunks, GalleryCarousel, RoadmapTimeline, BlogTeaser, FAQ

export default function Home() {
  return (
    <>
      <HeroSplit />
      {/* Page intentionally trimmed: only the hero is shown */}
      {/* Restored: interactive timeline */}
      <WorldCupTimeline />
    </>
  );
}
