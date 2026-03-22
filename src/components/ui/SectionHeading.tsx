import Image from "next/image";
import type { ReactNode } from "react";

type HeadingVariant = "default" | "about" | "portfolio" | "estimate" | "contact";

type SparkleItem = {
  className: string;
  opacity: number;
  size: number;
};

type HeadingTheme = {
  accentDot: string;
  accentLine: string;
  backdropVeil: string;
  dotSoft: string;
  ghostStroke: string;
  ghostWord: string;
  leftGlow: string;
  orbitMid: string;
  orbitSoft: string;
  orbitStrong: string;
  planetImageClassName: string;
  planetWrapperClassName: string;
  rightGlow: string;
  sparkleColor: string;
  sparkleItems: SparkleItem[];
  stageClassName: string;
  transitionBase: string;
  transitionMid: string;
  transitionSoft: string;
  transitionStrong: string;
  transitionTint: string;
  wash: string;
  waveStroke: string;
};

type SectionHeadingProps = {
  align?: "left" | "center";
  background?: boolean;
  description?: ReactNode;
  eyebrow: string;
  title: ReactNode;
  variant?: HeadingVariant;
};

const headingThemes = {
  default: {
    ghostWord: "Portfolio",
    backdropVeil:
      "linear-gradient(180deg, rgba(255,255,255,0.46) 0%, rgba(255,250,252,0.56) 38%, rgba(255,247,249,0.30) 100%)",
    wash:
      "radial-gradient(circle at 12% 24%, rgba(243,29,91,0.20), transparent 18%), radial-gradient(circle at 76% 16%, rgba(255,216,228,0.92), transparent 20%), radial-gradient(circle at 86% 58%, rgba(243,29,91,0.12), transparent 18%), radial-gradient(circle at 28% 76%, rgba(255,237,242,0.90), transparent 22%)",
    leftGlow: "rgba(243, 29, 91, 0.16)",
    rightGlow: "rgba(255, 216, 229, 0.88)",
    orbitStrong: "rgba(243, 29, 91, 0.16)",
    orbitMid: "rgba(243, 29, 91, 0.11)",
    orbitSoft: "rgba(243, 29, 91, 0.08)",
    waveStroke: "rgba(20, 16, 20, 0.07)",
    dotSoft: "rgba(243, 29, 91, 0.22)",
    ghostStroke: "rgba(243, 29, 91, 0.09)",
    accentLine: "rgba(243, 29, 91, 0.74)",
    accentDot: "rgba(243, 29, 91, 0.74)",
    stageClassName: "lg:translate-x-8 lg:translate-y-6 xl:translate-x-12",
    planetWrapperClassName: "left-[62%] top-[60%]",
    planetImageClassName:
      "h-[11rem] w-[11rem] drop-shadow-[0_0_42px_rgba(243,29,91,0.22)] xl:h-[13.2rem] xl:w-[13.2rem]",
    sparkleColor: "rgba(243, 29, 91, 1)",
    transitionBase: "#fff8fa",
    transitionMid: "rgba(255, 241, 245, 0.30)",
    transitionSoft: "rgba(255, 245, 248, 0.10)",
    transitionStrong: "rgba(255, 247, 249, 0.68)",
    transitionTint: "rgba(255, 244, 247, 0.34)",
    sparkleItems: [
      { className: "left-[12%] top-[20%]", size: 18, opacity: 0.44 },
      { className: "right-[10%] top-[16%]", size: 12, opacity: 0.36 },
      { className: "right-[20%] bottom-[16%]", size: 14, opacity: 0.4 },
    ],
  },
  about: {
    ghostWord: "About",
    backdropVeil:
      "linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,249,251,0.54) 38%, rgba(255,246,248,0.28) 100%)",
    wash:
      "radial-gradient(circle at 18% 18%, rgba(244,125,164,0.18), transparent 18%), radial-gradient(circle at 72% 20%, rgba(255,228,235,0.92), transparent 20%), radial-gradient(circle at 84% 62%, rgba(236,157,182,0.14), transparent 20%), radial-gradient(circle at 32% 80%, rgba(255,240,244,0.92), transparent 22%)",
    leftGlow: "rgba(244, 125, 164, 0.14)",
    rightGlow: "rgba(255, 226, 234, 0.82)",
    orbitStrong: "rgba(229, 116, 154, 0.14)",
    orbitMid: "rgba(229, 116, 154, 0.10)",
    orbitSoft: "rgba(229, 116, 154, 0.07)",
    waveStroke: "rgba(148, 102, 118, 0.10)",
    dotSoft: "rgba(229, 116, 154, 0.20)",
    ghostStroke: "rgba(229, 116, 154, 0.08)",
    accentLine: "rgba(232, 102, 146, 0.68)",
    accentDot: "rgba(232, 102, 146, 0.68)",
    stageClassName: "lg:-translate-x-5 lg:-translate-y-6 xl:-translate-x-10",
    planetWrapperClassName: "left-[46%] top-[44%]",
    planetImageClassName:
      "h-[10rem] w-[10rem] drop-shadow-[0_0_38px_rgba(232,102,146,0.18)] xl:h-[11.4rem] xl:w-[11.4rem]",
    sparkleColor: "rgba(232, 102, 146, 1)",
    transitionBase: "#fff8f9",
    transitionMid: "rgba(255, 242, 246, 0.28)",
    transitionSoft: "rgba(255, 246, 248, 0.10)",
    transitionStrong: "rgba(255, 246, 248, 0.66)",
    transitionTint: "rgba(255, 242, 246, 0.32)",
    sparkleItems: [
      { className: "left-[18%] top-[18%]", size: 12, opacity: 0.3 },
      { className: "right-[12%] top-[24%]", size: 16, opacity: 0.42 },
      { className: "left-[24%] bottom-[22%]", size: 14, opacity: 0.36 },
    ],
  },
  portfolio: {
    ghostWord: "Portfolio",
    backdropVeil:
      "linear-gradient(180deg, rgba(255,255,255,0.46) 0%, rgba(255,250,252,0.56) 38%, rgba(255,247,249,0.30) 100%)",
    wash:
      "radial-gradient(circle at 12% 24%, rgba(243,29,91,0.20), transparent 18%), radial-gradient(circle at 76% 16%, rgba(255,216,228,0.92), transparent 20%), radial-gradient(circle at 86% 58%, rgba(243,29,91,0.12), transparent 18%), radial-gradient(circle at 28% 76%, rgba(255,237,242,0.90), transparent 22%)",
    leftGlow: "rgba(243, 29, 91, 0.16)",
    rightGlow: "rgba(255, 216, 229, 0.88)",
    orbitStrong: "rgba(243, 29, 91, 0.16)",
    orbitMid: "rgba(243, 29, 91, 0.11)",
    orbitSoft: "rgba(243, 29, 91, 0.08)",
    waveStroke: "rgba(20, 16, 20, 0.07)",
    dotSoft: "rgba(243, 29, 91, 0.22)",
    ghostStroke: "rgba(243, 29, 91, 0.09)",
    accentLine: "rgba(243, 29, 91, 0.74)",
    accentDot: "rgba(243, 29, 91, 0.74)",
    stageClassName: "lg:translate-x-8 lg:translate-y-6 xl:translate-x-12",
    planetWrapperClassName: "left-[62%] top-[60%]",
    planetImageClassName:
      "h-[11rem] w-[11rem] drop-shadow-[0_0_42px_rgba(243,29,91,0.22)] xl:h-[13.2rem] xl:w-[13.2rem]",
    sparkleColor: "rgba(243, 29, 91, 1)",
    transitionBase: "#fff8f8",
    transitionMid: "rgba(255, 239, 242, 0.32)",
    transitionSoft: "rgba(255, 244, 246, 0.12)",
    transitionStrong: "rgba(255, 246, 247, 0.68)",
    transitionTint: "rgba(255, 242, 244, 0.36)",
    sparkleItems: [
      { className: "left-[12%] top-[20%]", size: 18, opacity: 0.44 },
      { className: "right-[10%] top-[16%]", size: 12, opacity: 0.36 },
      { className: "right-[20%] bottom-[16%]", size: 14, opacity: 0.4 },
    ],
  },
  estimate: {
    ghostWord: "Estimate",
    backdropVeil:
      "linear-gradient(180deg, rgba(255,255,255,0.24) 0%, rgba(255,249,251,0.32) 36%, rgba(255,246,248,0.16) 100%)",
    wash:
      "radial-gradient(circle at 18% 18%, rgba(246,137,168,0.10), transparent 20%), radial-gradient(circle at 74% 20%, rgba(255,235,240,0.56), transparent 24%), radial-gradient(circle at 78% 60%, rgba(242,107,141,0.06), transparent 18%), radial-gradient(circle at 42% 80%, rgba(255,245,247,0.62), transparent 28%)",
    leftGlow: "rgba(255, 140, 168, 0.08)",
    rightGlow: "rgba(255, 236, 241, 0.58)",
    orbitStrong: "rgba(242, 107, 141, 0.08)",
    orbitMid: "rgba(242, 107, 141, 0.06)",
    orbitSoft: "rgba(242, 107, 141, 0.04)",
    waveStroke: "rgba(103, 82, 89, 0.08)",
    dotSoft: "rgba(242, 107, 141, 0.20)",
    ghostStroke: "rgba(242, 107, 141, 0.06)",
    accentLine: "rgba(242, 107, 141, 0.62)",
    accentDot: "rgba(242, 107, 141, 0.62)",
    stageClassName: "lg:translate-x-6 lg:translate-y-8 xl:translate-x-10 xl:translate-y-12",
    planetWrapperClassName: "left-[58%] top-[56%]",
    planetImageClassName:
      "h-[11rem] w-[11rem] drop-shadow-[0_0_34px_rgba(242,107,141,0.16)] xl:h-[12.8rem] xl:w-[12.8rem]",
    sparkleColor: "rgba(242, 107, 141, 1)",
    transitionBase: "#fffdfc",
    transitionMid: "rgba(255, 248, 249, 0.18)",
    transitionSoft: "rgba(255, 251, 252, 0.06)",
    transitionStrong: "rgba(255, 252, 251, 0.62)",
    transitionTint: "rgba(255, 248, 249, 0.24)",
    sparkleItems: [
      { className: "left-[18%] top-[28%]", size: 10, opacity: 0.24 },
      { className: "right-[16%] top-[26%]", size: 13, opacity: 0.28 },
      { className: "right-[24%] bottom-[16%]", size: 11, opacity: 0.24 },
    ],
  },
  contact: {
    ghostWord: "Contact",
    backdropVeil:
      "linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,249,251,0.54) 38%, rgba(255,246,248,0.28) 100%)",
    wash:
      "radial-gradient(circle at 16% 20%, rgba(243,129,151,0.18), transparent 18%), radial-gradient(circle at 72% 16%, rgba(255,224,229,0.92), transparent 18%), radial-gradient(circle at 84% 70%, rgba(241,112,143,0.12), transparent 20%), radial-gradient(circle at 32% 78%, rgba(255,239,243,0.94), transparent 22%)",
    leftGlow: "rgba(243, 129, 151, 0.14)",
    rightGlow: "rgba(255, 223, 229, 0.84)",
    orbitStrong: "rgba(241, 112, 143, 0.15)",
    orbitMid: "rgba(241, 112, 143, 0.10)",
    orbitSoft: "rgba(241, 112, 143, 0.07)",
    waveStroke: "rgba(120, 88, 96, 0.10)",
    dotSoft: "rgba(241, 112, 143, 0.20)",
    ghostStroke: "rgba(241, 112, 143, 0.08)",
    accentLine: "rgba(241, 112, 143, 0.68)",
    accentDot: "rgba(241, 112, 143, 0.68)",
    stageClassName: "lg:-translate-x-5 lg:translate-y-8 xl:-translate-x-8",
    planetWrapperClassName: "left-[42%] top-[62%]",
    planetImageClassName:
      "h-[10.8rem] w-[10.8rem] drop-shadow-[0_0_40px_rgba(241,112,143,0.20)] xl:h-[12.6rem] xl:w-[12.6rem]",
    sparkleColor: "rgba(241, 112, 143, 1)",
    transitionBase: "#fff7f9",
    transitionMid: "rgba(255, 240, 243, 0.30)",
    transitionSoft: "rgba(255, 244, 247, 0.10)",
    transitionStrong: "rgba(255, 245, 247, 0.68)",
    transitionTint: "rgba(255, 241, 244, 0.34)",
    sparkleItems: [
      { className: "left-[14%] top-[26%]", size: 15, opacity: 0.38 },
      { className: "right-[12%] top-[14%]", size: 12, opacity: 0.32 },
      { className: "left-[26%] bottom-[14%]", size: 16, opacity: 0.36 },
    ],
  },
} satisfies Record<HeadingVariant, HeadingTheme>;

export default function SectionHeading({
  align = "left",
  background = true,
  description,
  eyebrow,
  title,
  variant = "default",
}: SectionHeadingProps) {
  const isCenter = align === "center";
  const theme = headingThemes[variant];

  return (
    <div
      className={[
        "relative min-h-[100svh]",
        isCenter ? "text-center" : "",
      ].join(" ")}
    >
      {background && (
        <>
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: theme.backdropVeil }} />
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: theme.wash }} />
          <div
            className="pointer-events-none absolute left-[-10rem] top-[6%] h-[24rem] w-[24rem] rounded-full blur-[150px]"
            style={{ backgroundColor: theme.leftGlow }}
          />
          <div
            className="pointer-events-none absolute right-[-8rem] top-[-3rem] h-[28rem] w-[28rem] rounded-full blur-[160px]"
            style={{ backgroundColor: theme.rightGlow }}
          />
          <div className="pointer-events-none absolute inset-0 opacity-90" aria-hidden="true">
            <svg viewBox="0 0 1600 760" className="h-full w-full">
              <ellipse cx="920" cy="256" rx="560" ry="160" fill="none" stroke={theme.orbitStrong} strokeDasharray="14 18" strokeWidth="1.2" transform="rotate(-9 920 256)" />
              <ellipse cx="1030" cy="336" rx="430" ry="126" fill="none" stroke={theme.orbitMid} strokeDasharray="8 14" strokeWidth="1" transform="rotate(8 1030 336)" />
              <ellipse cx="1220" cy="382" rx="286" ry="92" fill="none" stroke={theme.orbitSoft} strokeWidth="0.9" transform="rotate(-6 1220 382)" />
              <path d="M0 508 C220 432, 392 446, 562 520 S930 626, 1216 540 S1482 472, 1600 520" fill="none" stroke={theme.waveStroke} strokeWidth="1" />
              <path d="M74 188 C260 132, 472 144, 694 206 S1120 332, 1496 196" fill="none" stroke={theme.orbitMid} strokeWidth="0.9" />
              <circle cx="238" cy="172" r="4" fill={theme.dotSoft} />
              <circle cx="612" cy="488" r="3" fill={theme.dotSoft} />
              <circle cx="1248" cy="180" r="5.2" fill={theme.dotSoft} />
              <circle cx="1386" cy="430" r="3.2" fill={theme.dotSoft} />
              <circle cx="1492" cy="298" r="2.6" fill="rgba(20,16,20,0.18)" />
            </svg>
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-5 hidden xl:block">
            <div className="shell">
              <p
                className={[
                  "font-display text-[clamp(7rem,20vw,18rem)] leading-none tracking-[-0.08em] text-transparent opacity-90",
                  isCenter ? "text-center" : "text-right",
                ].join(" ")}
                style={{ WebkitTextStroke: `1px ${theme.ghostStroke}` }}
              >
                {theme.ghostWord}
              </p>
            </div>
          </div>
        </>
      )}

      <div className="shell relative z-10">
        <div
          className={[
            "grid min-h-[100svh] items-center gap-10 py-[clamp(3rem,7vw,5rem)]",
            isCenter ? "justify-items-center text-center" : "lg:grid-cols-[minmax(0,0.98fr)_minmax(320px,0.82fr)]",
          ].join(" ")}
        >
          <div className={["relative space-y-6", isCenter ? "mx-auto max-w-3xl" : "max-w-4xl"].join(" ")}>
            <p className="eyebrow">{eyebrow}</p>

            <div className="space-y-5">
              <h1 className="max-w-4xl break-keep font-display text-[clamp(3.1rem,6vw,6.8rem)] leading-[0.88] tracking-[-0.055em] text-ink">
                {title}
              </h1>

              <div className={["flex items-center gap-4", isCenter ? "justify-center" : ""].join(" ")}>
                <span
                  className="h-px w-20 sm:w-28 lg:w-36"
                  style={{ background: `linear-gradient(90deg, transparent, ${theme.accentLine}, transparent)` }}
                />
                <StarAccent color={theme.accentDot} />
                <span
                  className="h-px w-28 sm:w-40 lg:w-56"
                  style={{ background: `linear-gradient(90deg, rgba(20,16,20,0.14), transparent)` }}
                />
              </div>
            </div>

            {description ? (
              <div
                className={[
                  "max-w-3xl text-base leading-7 text-ink-muted md:text-lg",
                  isCenter ? "mx-auto" : "",
                ].join(" ")}
              >
                {description}
              </div>
            ) : null}
          </div>

          {!isCenter ? (
            <div className={["relative hidden h-[300px] w-full lg:block xl:h-[360px]", theme.stageClassName].join(" ")}>
              <SectionOrbitStage theme={theme} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SectionOrbitStage({ theme }: { theme: HeadingTheme }) {
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 460 360" className="absolute inset-0 h-full w-full">
        <ellipse
          cx="246"
          cy="180"
          rx="176"
          ry="108"
          fill="none"
          stroke={theme.orbitStrong}
          strokeDasharray="12 16"
          strokeWidth="1.1"
          transform="rotate(-12 246 180)"
        />
        <ellipse
          cx="250"
          cy="184"
          rx="128"
          ry="78"
          fill="none"
          stroke={theme.orbitMid}
          strokeDasharray="8 12"
          strokeWidth="0.95"
          transform="rotate(8 250 184)"
        />
        <ellipse
          cx="256"
          cy="190"
          rx="78"
          ry="46"
          fill="none"
          stroke={theme.orbitSoft}
          strokeWidth="0.85"
          transform="rotate(-4 256 190)"
        />
        <circle cx="108" cy="214" r="4" fill={theme.dotSoft} />
        <circle cx="354" cy="112" r="4.6" fill={theme.dotSoft} />
        <circle cx="382" cy="220" r="2.8" fill="rgba(20,16,20,0.18)" />
        <line x1="88" y1="130" x2="140" y2="110" stroke={theme.orbitMid} strokeWidth="0.8" />
        <line x1="328" y1="260" x2="382" y2="220" stroke={theme.orbitMid} strokeWidth="0.8" />
      </svg>

      <div
        className={["absolute -translate-x-1/2 -translate-y-1/2", theme.planetWrapperClassName].join(" ")}
        style={{ animation: "float 8s ease-in-out infinite" }}
      >
        <Image
          src="/planet.svg"
          alt=""
          aria-hidden="true"
          width={212}
          height={212}
          className={theme.planetImageClassName}
        />
      </div>

      {theme.sparkleItems.map((item) => (
        <div key={item.className} className={["absolute", item.className].join(" ")}>
          <SparkleGlyph color={theme.sparkleColor} opacity={item.opacity} size={item.size} />
        </div>
      ))}
    </div>
  );
}

function StarAccent({ color }: { color: string }) {
  return <SparkleGlyph color={color} opacity={1} size={12} />;
}

function SparkleGlyph({
  color,
  opacity,
  size,
}: {
  color: string;
  opacity: number;
  size: number;
}) {
  const half = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <path
        d={`M${half},0 L${half * 1.14},${half * 0.86} L${size},${half} L${half * 1.14},${half * 1.14} L${half},${size} L${half * 0.86},${half * 1.14} L0,${half} L${half * 0.86},${half * 0.86} Z`}
        fill={color}
        fillOpacity={opacity}
      />
    </svg>
  );
}
