"use client";

import ClosingSection from "@/sections/home/ClosingSection";
import FillWordSection from "@/sections/home/FillWordSection";
import HeroSection from "@/sections/home/HeroSection";
import SignatureSection from "@/sections/home/SignatureSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SignatureSection />
      <FillWordSection />
      <ClosingSection />
    </>
  );
}
