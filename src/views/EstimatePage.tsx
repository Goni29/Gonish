"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import SmartLineBreak from "@/components/ui/SmartLineBreak";
import EstimateConversation from "@/sections/estimate/EstimateConversation";

export default function EstimatePage() {
  return (
    <>
      <section className="section-space-tight">
        <div className="shell">
          <SectionHeading
            eyebrow="Estimate"
            title={
              <SmartLineBreak
                text="복잡한 용어 없이, 필요한 범위를 함께 정리해볼게요."
                maxCharsPerLine={13}
                maxLines={3}
              />
            }
            description="몇 가지 질문에 답하시면 대략적인 제작 범위와 상담에서 함께 확인할 내용을 먼저 정리해드립니다. 개발을 몰라도 괜찮습니다."
          />
        </div>
      </section>
      <EstimateConversation />
    </>
  );
}
