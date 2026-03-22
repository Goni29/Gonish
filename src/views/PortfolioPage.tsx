"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import SmartLineBreak from "@/components/ui/SmartLineBreak";
import PortfolioShowcase from "@/sections/portfolio/PortfolioShowcase";

export default function PortfolioPage() {
  return (
    <>
      <section className="-mt-24 overflow-hidden md:-mt-28">
        <SectionHeading
          eyebrow="Portfolio"
          variant="portfolio"
          title={<SmartLineBreak text="브랜드의 품격을 증명하는 큐레이션된 웹 케이스." />}
          description="업종과 목적이 다른 프로젝트를 브랜드 전략, 메시지 품질, 전환 흐름 관점에서 정제해 보여드립니다."
        />
      </section>
      <PortfolioShowcase />
    </>
  );
}
