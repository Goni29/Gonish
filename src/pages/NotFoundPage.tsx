import BrandButton from "@/components/ui/BrandButton";

export default function NotFoundPage() {
  return (
    <section className="section-space">
      <div className="shell">
        <div className="panel rounded-[2rem] px-6 py-16 text-center md:px-10">
          <p className="eyebrow">404</p>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,6vw,5.4rem)] leading-[0.94] text-ink">
            찾으시는 페이지를
            <br />
            아직 준비하지 않았습니다.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-ink-muted md:text-lg">
            메인 페이지로 돌아가 Gonish의 브랜드 흐름부터 다시 살펴보세요.
          </p>
          <div className="mt-10 flex justify-center">
            <BrandButton to="/">메인으로 돌아가기</BrandButton>
          </div>
        </div>
      </div>
    </section>
  );
}
