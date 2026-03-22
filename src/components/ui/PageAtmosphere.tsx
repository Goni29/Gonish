type AtmosphereVariant = "about" | "portfolio" | "estimate" | "contact";

type AtmosphereTheme = {
  backdropVeil: string;
  dotSoft: string;
  leftGlow: string;
  orbitMid: string;
  orbitSoft: string;
  orbitStrong: string;
  rightGlow: string;
  wash: string;
  waveStroke: string;
};

const themes: Record<AtmosphereVariant, AtmosphereTheme> = {
  about: {
    backdropVeil:
      "linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,249,251,0.54) 28%, rgba(255,246,248,0.28) 58%, rgba(255,253,252,0) 100%)",
    wash:
      "radial-gradient(circle at 18% 12%, rgba(244,125,164,0.18), transparent 22%), radial-gradient(circle at 72% 14%, rgba(255,228,235,0.92), transparent 24%), radial-gradient(circle at 84% 42%, rgba(236,157,182,0.14), transparent 24%), radial-gradient(circle at 32% 54%, rgba(255,240,244,0.72), transparent 28%)",
    leftGlow: "rgba(244, 125, 164, 0.14)",
    rightGlow: "rgba(255, 226, 234, 0.82)",
    orbitStrong: "rgba(229, 116, 154, 0.14)",
    orbitMid: "rgba(229, 116, 154, 0.10)",
    orbitSoft: "rgba(229, 116, 154, 0.07)",
    waveStroke: "rgba(148, 102, 118, 0.10)",
    dotSoft: "rgba(229, 116, 154, 0.20)",
  },
  portfolio: {
    backdropVeil:
      "linear-gradient(180deg, rgba(255,255,255,0.46) 0%, rgba(255,250,252,0.56) 28%, rgba(255,247,249,0.30) 58%, rgba(255,253,252,0) 100%)",
    wash:
      "radial-gradient(circle at 12% 16%, rgba(243,29,91,0.20), transparent 22%), radial-gradient(circle at 76% 10%, rgba(255,216,228,0.92), transparent 24%), radial-gradient(circle at 86% 38%, rgba(243,29,91,0.12), transparent 22%), radial-gradient(circle at 28% 50%, rgba(255,237,242,0.70), transparent 28%)",
    leftGlow: "rgba(243, 29, 91, 0.16)",
    rightGlow: "rgba(255, 216, 229, 0.88)",
    orbitStrong: "rgba(243, 29, 91, 0.16)",
    orbitMid: "rgba(243, 29, 91, 0.11)",
    orbitSoft: "rgba(243, 29, 91, 0.08)",
    waveStroke: "rgba(20, 16, 20, 0.07)",
    dotSoft: "rgba(243, 29, 91, 0.22)",
  },
  estimate: {
    backdropVeil:
      "linear-gradient(180deg, rgba(255,255,255,0.24) 0%, rgba(255,249,251,0.32) 26%, rgba(255,246,248,0.16) 56%, rgba(255,253,252,0) 100%)",
    wash:
      "radial-gradient(circle at 18% 12%, rgba(246,137,168,0.10), transparent 24%), radial-gradient(circle at 74% 14%, rgba(255,235,240,0.56), transparent 28%), radial-gradient(circle at 78% 40%, rgba(242,107,141,0.06), transparent 22%), radial-gradient(circle at 42% 54%, rgba(255,245,247,0.42), transparent 32%)",
    leftGlow: "rgba(255, 140, 168, 0.08)",
    rightGlow: "rgba(255, 236, 241, 0.58)",
    orbitStrong: "rgba(242, 107, 141, 0.08)",
    orbitMid: "rgba(242, 107, 141, 0.06)",
    orbitSoft: "rgba(242, 107, 141, 0.04)",
    waveStroke: "rgba(103, 82, 89, 0.08)",
    dotSoft: "rgba(242, 107, 141, 0.20)",
  },
  contact: {
    backdropVeil:
      "linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,249,251,0.54) 28%, rgba(255,246,248,0.28) 58%, rgba(255,253,252,0) 100%)",
    wash:
      "radial-gradient(circle at 16% 14%, rgba(243,129,151,0.18), transparent 22%), radial-gradient(circle at 72% 10%, rgba(255,224,229,0.92), transparent 22%), radial-gradient(circle at 84% 46%, rgba(241,112,143,0.12), transparent 24%), radial-gradient(circle at 32% 52%, rgba(255,239,243,0.74), transparent 28%)",
    leftGlow: "rgba(243, 129, 151, 0.14)",
    rightGlow: "rgba(255, 223, 229, 0.84)",
    orbitStrong: "rgba(241, 112, 143, 0.15)",
    orbitMid: "rgba(241, 112, 143, 0.10)",
    orbitSoft: "rgba(241, 112, 143, 0.07)",
    waveStroke: "rgba(120, 88, 96, 0.10)",
    dotSoft: "rgba(241, 112, 143, 0.20)",
  },
};

export default function PageAtmosphere({ variant }: { variant: AtmosphereVariant }) {
  const t = themes[variant];

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-[calc(100svh+64rem)]"
      aria-hidden="true"
    >
      {/* Veil */}
      <div className="absolute inset-0" style={{ backgroundImage: t.backdropVeil }} />

      {/* Wash */}
      <div className="absolute inset-0" style={{ backgroundImage: t.wash }} />

      {/* Glows */}
      <div
        className="absolute left-[-10rem] top-[4%] h-[24rem] w-[24rem] rounded-full blur-[150px]"
        style={{ backgroundColor: t.leftGlow }}
      />
      <div
        className="absolute right-[-8rem] top-[-2rem] h-[28rem] w-[28rem] rounded-full blur-[160px]"
        style={{ backgroundColor: t.rightGlow }}
      />
      <div
        className="absolute bottom-[20rem] left-[-6rem] h-[22rem] w-[34rem] rounded-full blur-[180px]"
        style={{ backgroundColor: t.leftGlow }}
      />
      <div
        className="absolute bottom-[18rem] right-[-6rem] h-[24rem] w-[36rem] rounded-full blur-[180px]"
        style={{ backgroundColor: t.rightGlow }}
      />

      {/* Orbit lines */}
      <div className="absolute inset-0 opacity-90">
        <svg viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <ellipse
            cx="920" cy="256" rx="560" ry="160"
            fill="none" stroke={t.orbitStrong}
            strokeDasharray="14 18" strokeWidth="1.2"
            transform="rotate(-9 920 256)"
          />
          <ellipse
            cx="1030" cy="336" rx="430" ry="126"
            fill="none" stroke={t.orbitMid}
            strokeDasharray="8 14" strokeWidth="1"
            transform="rotate(8 1030 336)"
          />
          <ellipse
            cx="1220" cy="382" rx="286" ry="92"
            fill="none" stroke={t.orbitSoft}
            strokeWidth="0.9"
            transform="rotate(-6 1220 382)"
          />
          <path
            d="M0 508 C220 432, 392 446, 562 520 S930 626, 1216 540 S1482 472, 1600 520"
            fill="none" stroke={t.waveStroke} strokeWidth="1"
          />
          <path
            d="M74 188 C260 132, 472 144, 694 206 S1120 332, 1496 196"
            fill="none" stroke={t.orbitMid} strokeWidth="0.9"
          />
          <circle cx="238" cy="172" r="4" fill={t.dotSoft} />
          <circle cx="612" cy="488" r="3" fill={t.dotSoft} />
          <circle cx="1248" cy="180" r="5.2" fill={t.dotSoft} />
          <circle cx="1386" cy="430" r="3.2" fill={t.dotSoft} />
          <circle cx="1492" cy="298" r="2.6" fill="rgba(20,16,20,0.18)" />
        </svg>
      </div>

    </div>
  );
}
