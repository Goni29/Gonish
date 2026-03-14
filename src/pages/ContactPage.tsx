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
            title={<SmartLineBreak text="첫 대화부터, 브랜드 방향이 선명해지도록." />}
            description="아이디어가 완성되지 않아도 괜찮습니다. 현재 상황과 원하는 결과를 남겨주시면, 필요한 범위와 다음 단계를 정제된 제안으로 안내드립니다."
          />
        </div>
      </section>
      <ContactStage />
    </>
  );
}
