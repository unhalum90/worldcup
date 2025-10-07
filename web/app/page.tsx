import HeroSplit from "@/components/HeroSplit";
import CountdownTimer from "@/components/CountdownTimer";
import WorldCupTimeline from "@/components/landing/WorldCupTimeline";
import BostonDemo from "@/components/landing/BostonDemo";
import PricingTimeline from "@/components/landing/PricingTimeline";
// Other landing sections removed for staged rebuild: FeatureChunks, GalleryCarousel, RoadmapTimeline, BlogTeaser, FAQ

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

    {/* Boston demo exemplar (page cleared below this section for staged rebuild) */}
    <BostonDemo />
    </>
  );
}
