import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import GonishCharacter from "@/components/GonishCharacter";
import BrandButton from "@/components/ui/BrandButton";
import PageSectionBridge from "@/components/ui/PageSectionBridge";
import SmartLineBreak from "@/components/ui/SmartLineBreak";

type FormState = {
  message: string;
  name: string;
  project: string;
  tone: string;
};

const initialFormState: FormState = {
  name: "",
  project: "",
  tone: "",
  message: "",
};

export default function ContactStage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [smiling, setSmiling] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "프로젝트 목표와 일정, 원하는 분위기를 편하게 적어주세요. 정리해서 회신드릴게요.",
  );
  const timeoutRef = useRef<number | null>(null);
  const contactEmail = useMemo(() => process.env.NEXT_PUBLIC_CONTACT_EMAIL, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const triggerSmile = () => {
    setSmiling(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setSmiling(false);
    }, 2800);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    triggerSmile();

    if (contactEmail) {
      const subject = encodeURIComponent(`[Gonish 문의] ${form.project || form.name || "새 프로젝트"}`);
      const body = encodeURIComponent(
        [
          `이름: ${form.name || "-"}`,
          `프로젝트: ${form.project || "-"}`,
          `원하는 분위기: ${form.tone || "-"}`,
          "",
          form.message || "궁금한 점을 남겨주세요.",
        ].join("\n"),
      );

      window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
      setStatusMessage("메일 앱으로 연결할게요. 남겨주신 내용을 바탕으로 곧 회신드릴게요.");
      return;
    }

    setStatusMessage("지금 연락 채널을 확인하고 있어요. 잠시 후 다시 시도해 주세요.");
  };

  return (
    <section className="section-space relative -mt-24 overflow-hidden md:-mt-28">
      <PageSectionBridge variant="contact" />
      <div className="shell relative z-10">
        <div className="panel relative overflow-hidden rounded-[2.3rem] px-6 py-8 sm:px-8 sm:py-10 lg:min-h-[720px] lg:px-12 lg:py-12">
          <div className="absolute inset-x-0 bottom-0 h-48 bg-[radial-gradient(circle_at_left_bottom,rgba(243,29,91,0.18),transparent_40%)]" />

          <div className="grid gap-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-end">
            <motion.div
              animate={{
                y: smiling ? [-2, 1, -2] : [0, -4, 0],
              }}
              transition={{
                duration: smiling ? 0.8 : 3.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative order-2 flex items-end justify-start lg:order-1 lg:min-h-[440px]"
            >
              <div className="pointer-events-none relative h-[240px] w-[240px] sm:h-[280px] sm:w-[280px]">
                <GonishCharacter isSmiling={smiling} className="size-full drop-shadow-[0_24px_60px_rgba(20,16,20,0.12)]" />
              </div>
            </motion.div>

            <div className="order-1 space-y-8 lg:order-2">
              <div className="space-y-5">
                <p className="eyebrow">Project conversation</p>
                <p className="font-display text-[clamp(2.4rem,4.5vw,4.8rem)] leading-[0.96] text-ink">
                  <SmartLineBreak text="편하게 말씀해 주세요. 방향은 함께 잡아갈게요." />
                </p>
                <p className="max-w-2xl text-base leading-7 text-ink-muted md:text-lg">
                  지금 상황이 어떤지, 어떤 결과를 원하시는지만 알려주시면 돼요.
                  아직 정리 안 된 아이디어라도 괜찮아요. 대화하면서 함께 방향을 잡아드릴게요.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="rounded-[1.5rem] border border-black/10 bg-white/78 p-4 backdrop-blur-xl">
                    <span className="block text-[10px] uppercase tracking-[0.32em] text-ink/42">Name</span>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="성함 또는 브랜드명"
                      className="mt-3 w-full border-0 bg-transparent p-0 text-base text-ink outline-none placeholder:text-ink/32"
                    />
                  </label>

                  <label className="rounded-[1.5rem] border border-black/10 bg-white/78 p-4 backdrop-blur-xl">
                    <span className="block text-[10px] uppercase tracking-[0.32em] text-ink/42">Project</span>
                    <input
                      name="project"
                      value={form.project}
                      onChange={handleChange}
                      placeholder="예: 프리미엄 브랜드 사이트, 예약형 캠페인 랜딩"
                      className="mt-3 w-full border-0 bg-transparent p-0 text-base text-ink outline-none placeholder:text-ink/32"
                    />
                  </label>
                </div>

                <label className="rounded-[1.5rem] border border-black/10 bg-white/78 p-4 backdrop-blur-xl">
                  <span className="block text-[10px] uppercase tracking-[0.32em] text-ink/42">Mood</span>
                  <input
                    name="tone"
                    value={form.tone}
                    onChange={handleChange}
                    placeholder="원하는 분위기나 레퍼런스 키워드"
                    className="mt-3 w-full border-0 bg-transparent p-0 text-base text-ink outline-none placeholder:text-ink/32"
                  />
                </label>

                <label className="rounded-[1.5rem] border border-black/10 bg-white/78 p-4 backdrop-blur-xl">
                  <span className="block text-[10px] uppercase tracking-[0.32em] text-ink/42">Message</span>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="지금 상황, 원하는 결과, 일정, 브랜드 분위기 등 자유롭게 적어주세요."
                    rows={6}
                    className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-base leading-7 text-ink outline-none placeholder:text-ink/32"
                  />
                </label>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <p className="max-w-2xl text-sm leading-6 text-ink-muted">{statusMessage}</p>
                  <BrandButton type="submit">문의하기</BrandButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
