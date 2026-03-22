"use client";

import PageAtmosphere from "@/components/ui/PageAtmosphere";
import SectionHeading from "@/components/ui/SectionHeading";
import SmartLineBreak from "@/components/ui/SmartLineBreak";
import EstimateConversation from "@/sections/estimate/EstimateConversation";

export default function EstimatePage() {
  return (
    <div className="relative -mt-24 overflow-x-clip md:-mt-28">
      <PageAtmosphere variant="estimate" />
      <SectionHeading
        eyebrow="Estimate"
        variant="estimate"
        background={false}
        title={
          <SmartLineBreak
            text="복잡한 용어 없이, 필요한 범위를 함께 정리해볼게요."
            maxCharsPerLine={13}
            maxLines={3}
          />
        }
        description="몇 가지 질문에 답해주시면 대략적인 범위와 비용을 먼저 정리해드려요. 개발을 몰라도 전혀 괜찮아요."
      />
      <EstimateConversation />
    </div>
  );
}
