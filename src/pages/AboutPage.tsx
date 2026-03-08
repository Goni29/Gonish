import SectionHeading from "@/components/ui/SectionHeading";
import AboutStorySection from "@/sections/about/AboutStorySection";

export default function AboutPage() {
  return (
    <>
      <section className="section-space-tight">
        <div className="shell">
          <SectionHeading
            eyebrow="About Me"
            title={
              <>
                브랜드의 품격을
                <br />
                고객의 선택으로 연결합니다.
              </>
            }
            description="Gonish는 단정한 미감과 명확한 설계를 바탕으로, 브랜드의 가치가 신뢰와 행동으로 이어지는 경험을 만듭니다."
          />
        </div>
      </section>
      <AboutStorySection />
    </>
  );
}
