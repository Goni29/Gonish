import BrandButton from "@/components/ui/BrandButton";
import SmartLineBreak from "@/components/ui/SmartLineBreak";

export default function NotFoundPage() {
  return (
    <section className="section-space">
      <div className="shell">
        <div className="panel rounded-[2rem] px-6 py-16 text-center md:px-10">
          <p className="eyebrow">404</p>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,6vw,5.4rem)] leading-[0.94] text-ink">
            <SmartLineBreak text="요청하신 페이지는 현재 열람하실 수 없습니다." />
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-ink-muted md:text-lg">
            메인 페이지에서 Gonish의 브랜드 방향과 큐레이션된 포트폴리오를 이어서 살펴보실 수 있습니다.
          </p>
          <div className="mt-10 flex justify-center">
            <BrandButton to="/">메인 페이지로 이동</BrandButton>
          </div>
        </div>
      </div>
    </section>
  );
}
