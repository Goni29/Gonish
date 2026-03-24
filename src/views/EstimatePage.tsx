"use client";

import PageAtmosphere from "@/components/ui/PageAtmosphere";
import SectionHeading from "@/components/ui/SectionHeading";
import EstimateConversation from "@/sections/estimate/EstimateConversation";

export default function EstimatePage() {
  return (
    <div className="relative -mt-24 md:-mt-28">
      <PageAtmosphere variant="estimate" />
      <SectionHeading
        eyebrow="Estimate"
        variant="estimate"
        background={false}
        title={
          <>
            필요한 범위를
            <br />
            함께 정리해볼게요.
          </>
        }
        description="몇 가지 질문에 답해주시면 필요한 범위와 예상 금액을 함께 정리해드릴게요. 모든 견적은 템플릿 재활용이 아닌 커스텀 제작 기준이며, 최종 금액은 기능 범위와 난이도에 따라 달라질 수 있어요."
      />
      <EstimateConversation />
    </div>
  );
}
