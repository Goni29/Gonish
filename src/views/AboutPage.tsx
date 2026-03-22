"use client";

import PageAtmosphere from "@/components/ui/PageAtmosphere";
import SectionHeading from "@/components/ui/SectionHeading";
import SmartLineBreak from "@/components/ui/SmartLineBreak";
import AboutStorySection from "@/sections/about/AboutStorySection";

export default function AboutPage() {
  return (
    <div className="relative -mt-24 overflow-x-clip md:-mt-28">
      <PageAtmosphere variant="about" />
      <SectionHeading
        eyebrow="About Me"
        variant="about"
        background={false}
        title={
          <SmartLineBreak
            text="브랜드의 품격을 고객의 선택으로 연결합니다."
            maxCharsPerLine={12}
            maxLines={3}
          />
        }
        description="Gonish는 단정한 미감과 명확한 설계를 바탕으로, 브랜드의 가치가 신뢰와 행동으로 이어지는 경험을 만듭니다."
      />
      <AboutStorySection />
    </div>
  );
}
