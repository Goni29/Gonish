"use client";

import BrandButton from "@/components/ui/BrandButton";
import SmartLineBreak from "@/components/ui/SmartLineBreak";

export default function NotFoundPage() {
  return (
    <section className="section-space">
      <div className="shell">
        <div className="panel rounded-[2rem] px-6 py-16 text-center md:px-10">
          <p className="eyebrow">404</p>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,6vw,5.4rem)] leading-[0.94] text-ink">
            <SmartLineBreak text="앗, 이 페이지는 찾을 수 없어요." />
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-ink-muted md:text-lg">
            메인 페이지에서 Gonish의 작업물과 브랜드 이야기를 확인하실 수 있어요.
          </p>
          <div className="mt-10 flex justify-center">
            <BrandButton to="/">메인 페이지로 이동</BrandButton>
          </div>
        </div>
      </div>
    </section>
  );
}
