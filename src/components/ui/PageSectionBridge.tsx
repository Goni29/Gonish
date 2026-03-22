type BridgeVariant = "about" | "portfolio" | "estimate" | "contact";

type BridgeTheme = {
  base: string;
  glowLeft: string;
  glowRight: string;
  mist: string;
  orbitSoft: string;
  orbitStrong: string;
  surfaceGlowLeft: string;
  surfaceGlowRight: string;
  surfaceMid: string;
  surfaceTop: string;
  spark: string;
  wave: string;
};

const bridgeThemes: Record<BridgeVariant, BridgeTheme> = {
  about: {
    base: "#fff8f9",
    glowLeft: "rgba(242, 135, 171, 0.07)",
    glowRight: "rgba(255, 233, 239, 0.34)",
    mist: "rgba(255, 249, 251, 0.32)",
    orbitSoft: "rgba(233, 132, 169, 0.04)",
    orbitStrong: "rgba(233, 132, 169, 0.07)",
    surfaceGlowLeft: "rgba(244, 125, 164, 0.10)",
    surfaceGlowRight: "rgba(255, 234, 240, 0.36)",
    surfaceMid: "rgba(255, 243, 246, 0.38)",
    surfaceTop: "rgba(255, 248, 250, 0.08)",
    spark: "rgba(233, 132, 169, 0.16)",
    wave: "rgba(145, 102, 118, 0.05)",
  },
  portfolio: {
    base: "#fff8f8",
    glowLeft: "rgba(243, 29, 91, 0.07)",
    glowRight: "rgba(255, 225, 233, 0.36)",
    mist: "rgba(255, 248, 250, 0.34)",
    orbitSoft: "rgba(243, 29, 91, 0.04)",
    orbitStrong: "rgba(243, 29, 91, 0.07)",
    surfaceGlowLeft: "rgba(243, 29, 91, 0.11)",
    surfaceGlowRight: "rgba(255, 228, 235, 0.38)",
    surfaceMid: "rgba(255, 242, 244, 0.42)",
    surfaceTop: "rgba(255, 247, 248, 0.10)",
    spark: "rgba(243, 29, 91, 0.16)",
    wave: "rgba(20, 16, 20, 0.05)",
  },
  estimate: {
    base: "#fffdfc",
    glowLeft: "rgba(245, 122, 156, 0.05)",
    glowRight: "rgba(255, 237, 241, 0.24)",
    mist: "rgba(255, 250, 251, 0.24)",
    orbitSoft: "rgba(245, 122, 156, 0.03)",
    orbitStrong: "rgba(245, 122, 156, 0.05)",
    surfaceGlowLeft: "rgba(245, 122, 156, 0.06)",
    surfaceGlowRight: "rgba(255, 241, 244, 0.22)",
    surfaceMid: "rgba(255, 249, 250, 0.24)",
    surfaceTop: "rgba(255, 252, 252, 0.05)",
    spark: "rgba(245, 122, 156, 0.11)",
    wave: "rgba(98, 79, 86, 0.03)",
  },
  contact: {
    base: "#fff7f9",
    glowLeft: "rgba(241, 117, 148, 0.07)",
    glowRight: "rgba(255, 231, 236, 0.34)",
    mist: "rgba(255, 248, 250, 0.32)",
    orbitSoft: "rgba(241, 117, 148, 0.04)",
    orbitStrong: "rgba(241, 117, 148, 0.07)",
    surfaceGlowLeft: "rgba(241, 117, 148, 0.10)",
    surfaceGlowRight: "rgba(255, 232, 237, 0.36)",
    surfaceMid: "rgba(255, 241, 244, 0.40)",
    surfaceTop: "rgba(255, 247, 249, 0.10)",
    spark: "rgba(241, 117, 148, 0.16)",
    wave: "rgba(110, 84, 91, 0.05)",
  },
};

export default function PageSectionBridge({
  variant,
}: {
  variant: BridgeVariant;
}) {
  const theme = bridgeThemes[variant];

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: [
            `radial-gradient(circle at 14% 4%, ${theme.surfaceGlowLeft} 0, transparent 28%)`,
            `radial-gradient(circle at 84% 8%, ${theme.surfaceGlowRight} 0, transparent 30%)`,
            `linear-gradient(180deg, rgba(255,253,252,0) 0rem, ${theme.surfaceTop} 8rem, ${theme.surfaceMid} 18rem, ${theme.base} 34rem, ${theme.base} 100%)`,
          ].join(", "),
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-[-18rem] h-[32rem] overflow-hidden"
        aria-hidden="true"
        style={{
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.42) 16%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.56) 74%, transparent 100%)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.42) 16%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.56) 74%, transparent 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgba(255,251,252,0) 0%, rgba(255,251,252,0.02) 32%, ${theme.mist} 62%, rgba(255,251,252,0) 100%)`,
          }}
        />

        <div
          className="absolute left-[-10rem] top-[4rem] h-[16rem] w-[16rem] rounded-full blur-[130px]"
          style={{ backgroundColor: theme.glowLeft }}
        />
        <div
          className="absolute right-[-8rem] top-[1rem] h-[18rem] w-[18rem] rounded-full blur-[140px]"
          style={{ backgroundColor: theme.glowRight }}
        />
        <div
          className="absolute left-[20%] top-[10rem] h-[8rem] w-[22rem] rounded-full blur-[130px]"
          style={{ backgroundColor: theme.glowLeft }}
        />

        <svg viewBox="0 0 1600 360" className="absolute inset-0 h-full w-full" style={{ opacity: 0.18 }}>
          <ellipse
            cx="1080"
            cy="136"
            rx="430"
            ry="108"
            fill="none"
            stroke={theme.orbitStrong}
            strokeDasharray="10 16"
            strokeWidth="1"
            transform="rotate(-8 1080 136)"
          />
          <ellipse
            cx="1230"
            cy="186"
            rx="264"
            ry="70"
            fill="none"
            stroke={theme.orbitSoft}
            strokeDasharray="6 12"
            strokeWidth="0.9"
            transform="rotate(10 1230 186)"
          />
          <path
            d="M0 250 C194 182, 436 186, 676 246 S1174 330, 1600 224"
            fill="none"
            stroke={theme.wave}
            strokeWidth="1"
          />
          <path
            d="M98 92 C292 38, 500 52, 748 116 S1180 232, 1540 140"
            fill="none"
            stroke={theme.orbitSoft}
            strokeWidth="0.9"
          />
          <circle cx="308" cy="106" r="4" fill={theme.spark} />
          <circle cx="926" cy="254" r="3.4" fill={theme.spark} />
          <circle cx="1324" cy="126" r="4.4" fill={theme.spark} />
          <circle cx="1468" cy="206" r="2.8" fill={theme.spark} />
        </svg>
      </div>
    </>
  );
}
