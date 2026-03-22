"use client";

import PageAtmosphere from "@/components/ui/PageAtmosphere";
import SectionHeading from "@/components/ui/SectionHeading";
import PortfolioShowcase from "@/sections/portfolio/PortfolioShowcase";

export default function PortfolioPage() {
  return (
    <div className="relative -mt-24 overflow-x-clip md:-mt-28">
      <PageAtmosphere variant="portfolio" />
      <SectionHeading
        eyebrow="Portfolio"
        variant="portfolio"
        background={false}
        title={
          <>
            브랜드의 품격을
            <br />
            증명하는
            <br />
            큐레이션된
            <br />
            웹 케이스.
          </>
        }
        description="업종과 목적이 다른 프로젝트를 브랜드 전략, 메시지 품질, 전환 흐름 관점에서 정제해 보여드립니다."
      />
      <PortfolioShowcase />
    </div>
  );
}
