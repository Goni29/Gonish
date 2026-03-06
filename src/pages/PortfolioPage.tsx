import SectionHeading from "@/components/ui/SectionHeading";
import PortfolioShowcase from "@/sections/portfolio/PortfolioShowcase";

export default function PortfolioPage() {
  return (
    <>
      <section className="section-space-tight">
        <div className="shell">
          <SectionHeading
            eyebrow="Portfolio"
            title={
              <>
                프로젝트를 고르는 순간부터
                <br />
                하나의 경험이 되도록.
              </>
            }
            description="프로젝트 하나를 선택하고, 다시 디바이스별 뷰로 들어가는 흐름 자체가 큐레이션처럼 느껴지도록 설계했습니다."
          />
        </div>
      </section>
      <PortfolioShowcase />
    </>
  );
}
