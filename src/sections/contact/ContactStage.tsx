import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import BrandButton from "@/components/ui/BrandButton";

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
    "문의 버튼을 누르면 캐릭터가 먼저 반응합니다. `VITE_CONTACT_EMAIL`을 연결하면 메일로 바로 이어집니다.",
  );
  const [canTrackPointer, setCanTrackPointer] = useState(false);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const contactEmail = useMemo(() => import.meta.env.VITE_CONTACT_EMAIL as string | undefined, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateMatch = () => setCanTrackPointer(mediaQuery.matches);

    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);

    return () => {
      mediaQuery.removeEventListener("change", updateMatch);
    };
  }, []);

  useEffect(() => {
    if (!canTrackPointer) {
      setPupilOffset({ x: 0, y: 0 });
      return undefined;
    }

    const handleMove = (event: MouseEvent) => {
      const stage = stageRef.current;

      if (!stage) {
        return;
      }

      const rect = stage.getBoundingClientRect();
      const faceCenterX = rect.left + 130;
      const faceCenterY = rect.bottom - 120;
      const deltaX = event.clientX - faceCenterX;
      const deltaY = event.clientY - faceCenterY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(8, Math.hypot(deltaX, deltaY) / 40);

      setPupilOffset({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, [canTrackPointer]);

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
          form.message || "문의 내용을 남겨주세요.",
        ].join("\n"),
      );

      window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
      setStatusMessage("메일 앱으로 연결합니다. 캐릭터가 웃는 동안 문의 흐름이 시작됩니다.");
      return;
    }

    setStatusMessage(
      "연락 채널이 아직 연결되지 않았습니다. `VITE_CONTACT_EMAIL`을 추가하면 이 버튼이 바로 메일 문의로 연결됩니다.",
    );
  };

  return (
    <section className="section-space">
      <div className="shell">
        <div
          ref={stageRef}
          className="panel relative overflow-hidden rounded-[2.3rem] px-6 py-8 sm:px-8 sm:py-10 lg:min-h-[720px] lg:px-12 lg:py-12"
        >
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
                <svg viewBox="0 0 280 280" className="size-full drop-shadow-[0_24px_60px_rgba(20,16,20,0.12)]">
                  <defs>
                    <linearGradient id="face-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#ffe8ef" />
                    </linearGradient>
                  </defs>
                  <circle cx="140" cy="140" r="124" fill="#F31D5B" opacity="0.12" />
                  <circle cx="140" cy="140" r="112" fill="url(#face-gradient)" stroke="rgba(20,16,20,0.08)" />
                  <circle cx="102" cy="120" r="28" fill="white" />
                  <circle cx="178" cy="120" r="28" fill="white" />
                  <circle cx="102" cy="120" r="12" fill="#161116" transform={`translate(${pupilOffset.x} ${pupilOffset.y})`} />
                  <circle cx="178" cy="120" r="12" fill="#161116" transform={`translate(${pupilOffset.x} ${pupilOffset.y})`} />
                  <circle cx="102" cy="168" r="8" fill="#FCD1DE" />
                  <circle cx="178" cy="168" r="8" fill="#FCD1DE" />
                  {smiling ? (
                    <path
                      d="M102 182 C118 206, 162 206, 178 182"
                      fill="none"
                      stroke="#161116"
                      strokeLinecap="round"
                      strokeWidth="8"
                    />
                  ) : (
                    <path
                      d="M112 192 C128 186, 152 186, 168 192"
                      fill="none"
                      stroke="#161116"
                      strokeLinecap="round"
                      strokeWidth="8"
                    />
                  )}
                </svg>
                <div className="absolute -bottom-2 left-6 rounded-full bg-white/82 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-ink/55 backdrop-blur-xl">
                  {canTrackPointer ? "eyes follow you" : "touch friendly mode"}
                </div>
              </div>
            </motion.div>

            <div className="order-1 space-y-8 lg:order-2">
              <div className="space-y-5">
                <p className="eyebrow">Warm but polished interaction</p>
                <p className="font-display text-[clamp(2.4rem,4.5vw,4.8rem)] leading-[0.96] text-ink">
                  문의가 시작되는 순간도
                  <br />
                  기억에 남게 만들고 싶었습니다.
                </p>
                <p className="max-w-2xl text-base leading-7 text-ink-muted md:text-lg">
                  차분한 톤 안에서 조금은 다정한 인상을 남기는 것이 이 페이지의 역할입니다. 커서를
                  따라보는 작은 시선과 버튼 클릭 후의 미소가 그 첫 인상을 만들어줍니다.
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
                      placeholder="예: 개인 포트폴리오, 랜딩 페이지"
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
                    placeholder="프로젝트 목적, 일정, 원하는 인상 등을 자유롭게 적어주세요."
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
