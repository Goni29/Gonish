"use client";

import PageAtmosphere from "@/components/ui/PageAtmosphere";
import SectionHeading from "@/components/ui/SectionHeading";
import SmartLineBreak from "@/components/ui/SmartLineBreak";
import ContactStage from "@/sections/contact/ContactStage";

export default function ContactPage() {
  return (
    <div className="relative -mt-24 overflow-x-clip md:-mt-28">
      <PageAtmosphere variant="contact" />
      <SectionHeading
        eyebrow="Contact Me"
        variant="contact"
        background={false}
        title={<SmartLineBreak text="편하게 이야기해 주세요. 방향은 함께 잡아갈게요." />}
        description="아이디어가 아직 정리되지 않아도 괜찮아요. 지금 상황과 원하는 결과만 알려주시면, 다음 단계를 함께 정리해드릴게요."
      />
      <ContactStage />
    </div>
  );
}
