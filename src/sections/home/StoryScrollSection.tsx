import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { homeStoryPhrases } from "@/data/siteContent";

gsap.registerPlugin(ScrollTrigger);

export default function StoryScrollSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const phraseRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const phrases = phraseRefs.current.filter(Boolean) as HTMLParagraphElement[];

    if (!section || phrases.length === 0) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.set(phrases, { autoAlpha: 0, yPercent: 12 });
      gsap.set(phrases[0], { autoAlpha: 1, yPercent: 0 });

      gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=2200",
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      })
        .to({}, { duration: 0.8 })
        .to(phrases[0], { autoAlpha: 0, yPercent: -12, duration: 0.8 }, 0.85)
        .fromTo(phrases[1], { autoAlpha: 0, yPercent: 12 }, { autoAlpha: 1, yPercent: 0, duration: 0.8 }, 0.85)
        .to({}, { duration: 0.8 })
        .to(phrases[1], { autoAlpha: 0, yPercent: -12, duration: 0.8 }, 1.85)
        .fromTo(phrases[2], { autoAlpha: 0, yPercent: 12 }, { autoAlpha: 1, yPercent: 0, duration: 0.8 }, 1.85)
        .to({}, { duration: 0.85 });
    }, section);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[100svh] overflow-hidden">
      <div className="shell flex h-full items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-center">
          <div className="space-y-6">
            <p className="eyebrow">Refined messaging</p>
            <p className="font-display text-2xl leading-tight text-ink md:text-3xl">
              스크롤을 내릴수록,
              <br />
              고객이 신뢰할 근거가
              <br />
              더 또렷해집니다.
            </p>
            <p className="max-w-sm text-base leading-7 text-ink-muted">
              브랜드 소개부터 신뢰 요소, 행동 제안까지 하나의 서사처럼 이어지도록 정제한 핵심
              메시지입니다.
            </p>
          </div>

          <div className="relative flex min-h-[16rem] items-center justify-start lg:min-h-[24rem]">
            {homeStoryPhrases.map((phrase, index) => (
              <p
                key={phrase}
                ref={(element) => {
                  phraseRefs.current[index] = element;
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 font-display text-[clamp(4rem,11vw,9.8rem)] leading-none text-ink"
              >
                {phrase}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
