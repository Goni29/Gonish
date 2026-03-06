import ClosingSection from "@/sections/home/ClosingSection";
import FillWordSection from "@/sections/home/FillWordSection";
import HeroSection from "@/sections/home/HeroSection";
import SignatureSection from "@/sections/home/SignatureSection";
import StoryScrollSection from "@/sections/home/StoryScrollSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SignatureSection />
      <StoryScrollSection />
      <FillWordSection />
      <ClosingSection />
    </>
  );
}
