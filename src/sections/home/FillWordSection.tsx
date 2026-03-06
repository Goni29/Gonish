import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FillWordSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const fillMaskRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const fillMask = fillMaskRef.current;
    const copy = copyRef.current;
    const backdrop = backdropRef.current;

    if (!section || !fillMask || !copy || !backdrop) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.set(fillMask, { clipPath: "inset(100% 0% 0% 0%)" });

      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=1800",
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      })
        .to(backdrop, { yPercent: -12, ease: "none" }, 0)
        .to(fillMask, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }, 0.08)
        .fromTo(copy, { y: 40, autoAlpha: 0.4 }, { y: -28, autoAlpha: 1, ease: "none" }, 0);
    }, section);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[100svh] overflow-hidden">
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(243,29,91,0.12),transparent_38%),linear-gradient(180deg,#fffdfc_0%,#f6efee_100%)]"
      />

      <div className="shell relative flex h-full items-center">
        <div className="w-full space-y-12">
          <div className="max-w-xl space-y-4">
            <p className="eyebrow">Parallax text fill</p>
            <p className="text-base leading-7 text-ink-muted md:text-lg">
              비어 있던 윤곽이 아래에서부터 차오르며 완성되는 장면으로, 브랜드 컬러가 가장 강하게
              기억되는 순간을 만듭니다.
            </p>
          </div>

          <div className="relative">
            <p className="text-outline font-display text-[clamp(3.8rem,11vw,9.5rem)] leading-[0.92] tracking-[-0.04em]">
              Gonish에
              <br />
              의뢰하세요!
            </p>

            <div ref={fillMaskRef} className="absolute inset-0 overflow-hidden">
              <p className="brand-fill font-display text-[clamp(3.8rem,11vw,9.5rem)] leading-[0.92] tracking-[-0.04em]">
                Gonish에
                <br />
                의뢰하세요!
              </p>
            </div>
          </div>

          <div ref={copyRef} className="max-w-2xl rounded-[1.8rem] border border-black/10 bg-white/72 p-6 backdrop-blur-xl">
            <p className="font-display text-2xl leading-tight text-ink md:text-3xl">
              한 번 보고 잊히는 사이트보다,
              <br />
              다시 떠오르는 한 장면을 만듭니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
