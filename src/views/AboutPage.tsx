"use client";

import PageAtmosphere from "@/components/ui/PageAtmosphere";
import SectionHeading from "@/components/ui/SectionHeading";
import AboutProcessSection from "@/sections/about/AboutProcessSection";
import AboutStorySection from "@/sections/about/AboutStorySection";

export default function AboutPage() {
  return (
    <div className="relative -mt-24 overflow-x-clip md:-mt-28">
      <PageAtmosphere variant="about" />
      <SectionHeading
        eyebrow="About Gonish"
        variant="about"
        background={false}
        title={
          <>
            당신의 브랜드가
            <br />
            빛날 수 있도록
          </>
        }
        description="Gonish는 품격 있는 첫인상과 단단한 신뢰, 망설임 없는 흐름으로 브랜드가 자연스럽게 선택되는 웹 경험을 설계합니다."
      />
      <AboutStorySection />
      <AboutProcessSection />
    </div>
  );
}
