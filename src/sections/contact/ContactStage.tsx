import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import GonishCharacter from "@/components/GonishCharacter";
import BrandButton from "@/components/ui/BrandButton";
import type { InquiryResponse } from "@/lib/inquiry";
import { isValidReplyContact, REPLY_CONTACT_VALIDATION_MESSAGE } from "@/lib/replyContact";

import SmartLineBreak from "@/components/ui/SmartLineBreak";

type FormState = {
  message: string;
  name: string;
  project: string;
  reply: string;
  tone: string;
};

const initialFormState: FormState = {
  name: "",
  project: "",
  reply: "",
  tone: "",
  message: "",
};
const contactSubmitSuccessMessage = "문의가 전송되었어요! 최대한 빨리 확인하고 회신드릴게요!";
const inquirySubmitFailureMessage = "문의 전송이 실패했어요. 잠시 후 다시 시도해주세요.";
const contactBubbleAutoHideMs = 5000;

export default function ContactStage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [smiling, setSmiling] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitResultMessage, setSubmitResultMessage] = useState<string | null>(null);
  const smileTimeoutRef = useRef<number | null>(null);
  const messageTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (smileTimeoutRef.current) {
        window.clearTimeout(smileTimeoutRef.current);
      }
      if (messageTimeoutRef.current) {
        window.clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!submitResultMessage) {
      if (messageTimeoutRef.current) {
        window.clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
      return;
    }

    if (messageTimeoutRef.current) {
      window.clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = window.setTimeout(() => {
      setSubmitResultMessage(null);
    }, contactBubbleAutoHideMs);
  }, [submitResultMessage]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const triggerSmile = () => {
    setSmiling(true);

    if (smileTimeoutRef.current) {
      window.clearTimeout(smileTimeoutRef.current);
    }

    smileTimeoutRef.current = window.setTimeout(() => {
      setSmiling(false);
    }, 2800);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitResultMessage(null);

    if (!form.reply.trim()) {
      const validationMessage = "답변 받으실 연락처를 남겨주세요. 이메일이나 전화번호 중 편한 쪽으로요.";
      setSubmitResultMessage(validationMessage);
      return;
    }

    if (!isValidReplyContact(form.reply)) {
      setSubmitResultMessage(REPLY_CONTACT_VALIDATION_MESSAGE);
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "contact",
          form,
        }),
      });

      const result = (await response.json()) as InquiryResponse;
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "문의 전송에 실패했어요.");
      }

      triggerSmile();
      setSubmitResultMessage(contactSubmitSuccessMessage);
      setForm(initialFormState);
    } catch {
      setSubmitResultMessage(inquirySubmitFailureMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="section-space relative">
      <div className="shell relative z-10">
        <div className="panel relative overflow-hidden rounded-[2.3rem] px-6 py-8 sm:px-8 sm:py-10 lg:min-h-[720px] lg:px-12 lg:py-12">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[radial-gradient(circle_at_left_bottom,rgba(243,29,91,0.18),transparent_40%)]" />

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
              className="hidden relative z-20 order-2 items-end justify-start will-change-transform lg:flex lg:order-1 lg:min-h-[440px]"
            >
              <div className="pointer-events-none relative h-[240px] w-[240px] sm:h-[280px] sm:w-[280px]">
                <GonishCharacter isSmiling={smiling} className="size-full drop-shadow-[0_24px_60px_rgba(20,16,20,0.12)]" />
                <AnimatePresence mode="wait">
                  {submitResultMessage ? (
                    <motion.div
                      key={submitResultMessage}
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+12px)] z-30 w-56 rounded-[1.2rem] bg-brand px-4 py-3 text-[13px] leading-5 text-white shadow-[0_14px_36px_rgba(243,29,91,0.24)] sm:left-[94%] sm:translate-x-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:w-60 lg:w-64"
                    >
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 h-3 w-3 rotate-45 bg-brand sm:left-0 sm:-translate-x-0 sm:translate-y-0 sm:bottom-auto sm:-left-1.5 sm:top-1/2 sm:-translate-y-1/2" />
                      {submitResultMessage}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
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
                  <span className="block text-[10px] uppercase tracking-[0.32em] text-ink/42">Reply to</span>
                  <input
                    name="reply"
                    value={form.reply}
                    onChange={handleChange}
                    placeholder="이메일 또는 전화번호"
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

                <div className="flex justify-end">
                  <BrandButton type="submit" disabled={sending}>
                    {sending ? "전송 중…" : "문의하기"}
                  </BrandButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* ── Cross-link to Estimate ── */}
      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <p className="text-sm leading-6 text-ink-muted">
          본격적으로 프로젝트를 의뢰하고 싶으신가요? 범위와 비용을 함께 정리해드려요.
        </p>
        <BrandButton to="/estimate" variant="ghost">
          견적 알아보기
        </BrandButton>
      </div>
      {/* ── Fixed character + reply (bottom-left, mobile/tablet only) ── */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        className="fixed bottom-24 left-4 z-50 flex cursor-grab items-end gap-3 select-none active:cursor-grabbing md:bottom-28 md:left-6 lg:hidden"
        style={{ touchAction: "none" }}
      >
        <motion.div
          animate={{ y: smiling ? [-2, 1, -2] : [0, -4, 0] }}
          transition={{ duration: smiling ? 0.8 : 3.8, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none h-16 w-16 shrink-0 sm:h-20 sm:w-20"
        >
          <GonishCharacter isSmiling={smiling} className="h-full w-full drop-shadow-lg" />
        </motion.div>
        <AnimatePresence mode="wait">
          {submitResultMessage ? (
            <motion.div
              key={submitResultMessage}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-[16rem] rounded-[1.2rem] bg-brand px-4 py-3 text-[13px] leading-5 text-white shadow-[0_14px_36px_rgba(243,29,91,0.24)] sm:max-w-xs"
            >
              <div className="absolute -left-1.5 bottom-4 h-3 w-3 rotate-45 bg-brand" />
              {submitResultMessage}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
