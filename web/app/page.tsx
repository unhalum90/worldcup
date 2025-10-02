import HeroSplit from "@/components/HeroSplit";
import SocialProof from "@/components/landing/SocialProof";
import FeatureChunks from "@/components/landing/FeatureChunks";
import GalleryCarousel from "@/components/landing/GalleryCarousel";
import RoadmapTimeline from "@/components/landing/RoadmapTimeline";
import BlogTeaser from "@/components/landing/BlogTeaser";
import FAQ from "@/components/landing/FAQ";

export default function Home() {
  return (
    <>
      <HeroSplit />
      <SocialProof />
      <FeatureChunks />
      <GalleryCarousel />
      <RoadmapTimeline />
      <BlogTeaser />
      <FAQ />
    </>
  );
}
