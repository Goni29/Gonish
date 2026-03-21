"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import SmartLineBreak from "@/components/ui/SmartLineBreak";
import ContactStage from "@/sections/contact/ContactStage";

export default function ContactPage() {
  return (
    <>
      <section className="section-space-tight">
        <div className="shell">
          <SectionHeading
            eyebrow="Contact Me"
            title={<SmartLineBreak text="편하게 이야기해 주세요. 방향은 함께 잡아갈게요." />}
            description="아이디어가 아직 정리되지 않아도 괜찮아요. 지금 상황과 원하는 결과만 알려주시면, 다음 단계를 함께 정리해드릴게요."
          />
        </div>
      </section>
      <ContactStage />
    </>
  );
}
