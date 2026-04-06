import { Fragment, type ReactNode } from "react";
import SmartLineBreak from "@/components/ui/SmartLineBreak";

type ProcessStep = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  isHighlighted?: boolean;
};

const processSteps: ProcessStep[] = [
  {
    id: "discover",
    title: "발견",
    description: "브랜드 본질 분석",
    icon: <DiscoverIcon className="h-6 w-6 sm:h-7 sm:w-7" />,
  },
  {
    id: "define",
    title: "정의",
    description: "전략 중심 수립",
    icon: <DefineIcon className="h-6 w-6 sm:h-7 sm:w-7" />,
  },
  {
    id: "design",
    title: "디자인",
    description: "시각 시스템 구축",
    icon: <DesignIcon className="h-6 w-6 sm:h-7 sm:w-7" />,
  },
  {
    id: "build",
    title: "개발/구현",
    description: "완성도 높은 적용",
    icon: <DevelopIcon className="h-6 w-6 sm:h-7 sm:w-7" />,
  },
  {
    id: "launch",
    title: "런칭",
    description: "세상에 선보이기",
    icon: <LaunchIcon className="h-6 w-6 sm:h-7 sm:w-7" />,
    isHighlighted: true,
  },
];

export default function AboutProcessSection() {
  return (
    <section className="section-space-tight relative">
      <div className="shell">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#f0d9e0] bg-[linear-gradient(180deg,rgba(255,253,254,0.96)_0%,rgba(255,246,249,0.9)_100%)] px-5 py-8 shadow-[0_30px_88px_rgba(243,29,91,0.14)] sm:px-8 sm:py-10 lg:px-12 lg:py-11">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_18%,rgba(243,29,91,0.08),transparent_24%),radial-gradient(circle_at_96%_14%,rgba(243,29,91,0.1),transparent_20%),radial-gradient(circle_at_72%_86%,rgba(243,29,91,0.06),transparent_24%)]" />

          <div className="relative">
            <p className="text-[0.76rem] font-semibold tracking-[0.28em] text-brand/70">+ OUR APPROACH</p>
            <h2 className="mt-3 font-display text-[clamp(1.6rem,3.2vw,2.45rem)] leading-[1.24] tracking-[-0.02em] text-ink">
              <SmartLineBreak text="감도 높은 디자인 × 전략적 사고 × 섬세한 실행" />
            </h2>
            <p className="mt-2 text-base leading-7 text-ink-muted sm:text-[1.05rem]">
              당신의 브랜드가 오래 기억되도록, 모든 디테일을 다듬습니다.
            </p>

            <div className="mt-8 lg:hidden" data-testid="about-process-compact">
              <div className="grid grid-cols-[minmax(0,1fr)_0.5rem_minmax(0,1fr)_0.5rem_minmax(0,1fr)_0.5rem_minmax(0,1fr)_0.5rem_minmax(0,1fr)] items-start sm:grid-cols-[minmax(0,1fr)_0.9rem_minmax(0,1fr)_0.9rem_minmax(0,1fr)_0.9rem_minmax(0,1fr)_0.9rem_minmax(0,1fr)]">
                {processSteps.map((step, index) => (
                  <Fragment key={step.id}>
                    <ProcessStepCard step={step} compact />
                    {index < processSteps.length - 1 ? (
                      <div
                        aria-hidden="true"
                        data-testid="about-process-compact-connector"
                        className="mt-[1.35rem] h-px self-start border-t border-dashed border-[#e4b4c0] sm:mt-[1.52rem]"
                      />
                    ) : null}
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="mt-8 hidden lg:block">
              <div className="flex items-start gap-1.5 px-1 sm:gap-2 lg:w-full lg:min-w-0 lg:justify-between lg:px-0">
                {processSteps.map((step, index) => (
                  <Fragment key={step.id}>
                    <div className="w-[98px] text-center sm:w-[124px] lg:w-[156px]">
                      <ProcessStepCard step={step} />
                    </div>

                    {index < processSteps.length - 1 ? (
                      <div className="mt-[1.62rem] h-px w-5 border-t border-dashed border-[#e4b4c0] sm:mt-[1.84rem] sm:w-9 lg:mt-[1.92rem] lg:w-[5.2rem]" />
                    ) : null}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type IconProps = {
  className?: string;
};

type ProcessStepCardProps = {
  step: ProcessStep;
  compact?: boolean;
};

function ProcessStepCard({ step, compact = false }: ProcessStepCardProps) {
  return (
    <div className="min-w-0 text-center" data-testid={compact ? "about-process-compact-step" : undefined}>
      <div
        data-testid={compact ? "about-process-compact-icon" : undefined}
        className={[
          compact
            ? "mx-auto flex size-[2.75rem] items-center justify-center rounded-full border sm:size-[3.05rem]"
            : "mx-auto flex size-[3.25rem] items-center justify-center rounded-full border sm:size-[3.55rem]",
          step.isHighlighted
            ? "border-brand/45 bg-brand text-white shadow-[0_0_0_4px_rgba(243,29,91,0.14),0_12px_26px_rgba(243,29,91,0.3)]"
            : "border-[#ecc8d3] bg-white/94 text-[#c15a79] shadow-[0_8px_22px_rgba(20,16,20,0.08)]",
        ].join(" ")}
      >
        {step.icon}
      </div>
      <p
        className={[
          "font-semibold leading-tight text-ink break-keep",
          compact ? "mt-2 text-[0.75rem] sm:mt-3 sm:text-[0.9rem]" : "mt-3 text-[1.03rem] sm:text-[1.12rem]",
        ].join(" ")}
      >
        {step.title}
      </p>
      <p
        className={[
          "break-keep text-ink-muted",
          compact ? "mt-1 text-[0.62rem] leading-[1.35] sm:text-[0.72rem]" : "mt-1 text-[0.8rem] leading-[1.45] sm:text-[0.86rem]",
        ].join(" ")}
      >
        {step.description}
      </p>
    </div>
  );
}

function DiscoverIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 15l2.2-5.1L16 8l-2 4.9L9 15z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

function DefineIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
    </svg>
  );
}

function DesignIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M15.5 3.7l4.8 4.8-9.6 9.6-5.3 1 1-5.3 9.1-10.1z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M13.4 5.8l4.8 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DevelopIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M8 7l-4 5 4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 7l4 5-4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 5l-2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LaunchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M8 16c0-6.1 4.7-10.3 10.7-10.7C18.3 11.3 14.1 16 8 16z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8 16l-2.4 2.4M8 16l1 3.8M8 16l-3.8 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="14.8" cy="9.2" r="1.5" fill="currentColor" />
    </svg>
  );
}
