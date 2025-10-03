import HeroSplit from "@/components/HeroSplit";
import CountdownTimer from "@/components/CountdownTimer";
import WorldCupTimeline from "@/components/landing/WorldCupTimeline";
import FeatureChunks from "@/components/landing/FeatureChunks";
import GalleryCarousel from "@/components/landing/GalleryCarousel";
import RoadmapTimeline from "@/components/landing/RoadmapTimeline";
import BlogTeaser from "@/components/landing/BlogTeaser";
import FAQ from "@/components/landing/FAQ";

export default function Home() {
  return (
    <>
      <HeroSplit />
      
      {/* Countdown Section */}
      <section className="container mt-8 sm:mt-10 flex justify-center">
        <CountdownTimer />
      </section>

      {/* World Cup Timeline */}
      <WorldCupTimeline />

      <FeatureChunks />
      <GalleryCarousel />
      <RoadmapTimeline />
      <BlogTeaser />
      <FAQ />
    </>
  );
}
