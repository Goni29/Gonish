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
                감도는 섬세하게,
                <br />
                성장은 분명하게.
              </>
            }
            description="부트캠프를 거치며 기본기를 다졌고, 지금은 빠른 흡수력과 디테일 중심의 태도로 한 사람의 브랜드에 맞는 결과를 만드는 연습을 계속하고 있습니다."
          />
        </div>
      </section>
      <AboutStorySection />
    </>
  );
}
