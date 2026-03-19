import { useEffect, useRef, useState } from "react";

/**
 * Gonish character inline SVG with switchable eyes.
 *
 * Body from Gonish_character.svg, open eyes from Gonish_character_eye.svg.
 * When `isSmiling` is true the original curved (smiling) eyes show;
 * otherwise the round open eyes follow the mouse cursor.
 */
export default function GonishCharacter({
  className,
  isSmiling = false,
}: {
  className?: string;
  isSmiling?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [eye, setEye] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      // Eyes sit roughly at 50% x, 35% y of the viewBox
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.35;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(Math.hypot(dx, dy), 300) / 300; // 0‑1
      const max = 3; // SVG-unit clamp

      setEye({ x: Math.cos(angle) * dist * max, y: Math.sin(angle) * dist * max });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
    };
  }, []);

  const iris = isSmiling ? undefined : `translate(${eye.x},${eye.y})`;

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      width="200"
      height="200"
      fill="none"
      viewBox="0 0 200 200"
      className={className}
    >
      {/* ── Body shadow ── */}
      <path
        d="m106.4 195c-39.24 0-70.74-26.81-70.74-72.39 0-39.49 23.27-80.16 74.26-80.16 29.86 0 58.39 15.37 58.39 39.69 0 11.64-10.54 21.52-22.94 21.52-10.54 0-17.6-10.3-33.4-10.3-17.36 0-28.47 13.49-28.47 30.03 0 14.4 9.43 29.92 27.1 29.92 8.82 0 16.71-4.1 20.25-10.63-3.45 0.18-6.46 0.26-7.73 0.26-11.95 0-18.01-5.03-18.01-15.52 0-9.16 6.14-16.96 20.05-17.29 6.85-0.25 10.62-0.42 17.89-0.42 16.87 0 30.78 2.38 31.2 25.23 0.67 27.97-20.15 60.06-67.85 60.06z"
        fill="#6E0A39"
      />
      {/* ── Body main (radial gradient) ── */}
      <path
        d="m106.1 191.8c-37.35 0-68.31-26.13-68.31-69.03 0-38.47 22.3-77.26 71.98-77.26 29.86 0 55.84 15.37 55.84 36.3 0 10.39-9.43 18.92-20.1 18.92-10.24 0-16.84-10.76-33.61-10.76-19.22 0-31.48 14.43-31.48 33.68 0 15.91 10.97 32.5 30.03 32.5 12.55 0 23.41-7.85 25.26-16.22-4.94 0.17-6.9 0.34-10.61 0.34-9.43 0-16.7-2.8-16.7-13.08 0-8.3 5.28-14.08 16.85-14.24 7.46-0.25 9.85-0.41 17.58-0.41 16.1 0 28.44 1.88 28.87 22.35 0.62 26.32-19.44 56.91-65.6 56.91z"
        fill="url(#gc_body)"
      />
      {/* ── Highlights ── */}
      <path d="m164.7 81.22c0-18.94-24.87-33.46-54.73-33.46-15.97 0-29.34 4.35-39.88 11.76l-8.71 10.4c12.51-3.01 21.37-13.77 48.02-15.18 17.28-0.91 19.79 1.17 18.05-1.63-1.28-2.25-16.93-5.19-30.98-4.05l2.63-3.17c3.18-0.33 6.36-0.5 9.67-0.5 29.86 0 55.93 14.9 55.93 35.83 0 7.09-4.87 13.79-11.8 17.09 6.93-2.84 11.8-9.83 11.8-17.09z" fill="#F7CED7" opacity=".5" />
      <path d="m45.62 111.9c-1.48-4.79 2.49-25.23 16.5-39.07 3.46-3.46 6.24-3.38 10.76-5.6-9.57 8.86-19.39 21.33-24.55 42.84-0.87 3.71-2.22 3.21-2.71 1.83z" fill="#F7CED7" opacity=".6" />
      <path d="m111.2 161.6c4.87 1.54 12.48-0.54 20.65-6.32 5.15-3.66 4.93-5.32 3.98-5.85-1.47-0.83-3.58 2.44-6.76 5.36-5.01 4.62-11.73 6.38-16.53 6.29-2.3-0.08-2.51 0.09-1.34 0.52z" fill="#F7CED7" opacity=".6" />
      {/* ── Body gradient overlays ── */}
      <path d="m110.8 127c-0.29-7.89 5.23-12.06 12.35-12.31 12.3-0.5 15.08-0.76 23.46-0.17 8.22 0.58 13.48 1.33 18.42 4.35 4.8 2.84 6.42 12.22 2.27 27.87-2.42 9.02-16.37 35.34-56.94 37.19-36.13 1.61-68.23-19.81-70.41-52.93 3.18 20.64 21.9 39.81 51.55 46.34 16.38 4.02 45.65-2.51 63.25-23.06 7.2-8.36 9.18-25.4-1.5-26.07-10.02-0.67-14.17 0.42-26.64 0.34-9.57 0.08-15.63-0.75-15.81-1.55z" fill="url(#gc_bodyGrad1)" opacity=".6" />
      <path d="m160.3 76.69c-1.28 9.27-10.57 15.52-16.79 15.52-10.24 0-18.49-6.9-33.6-6.9-17.81 0-38.92 13.85-39 39.5-0.07 13.48 8.18 23.5 16.2 28.28-5.39-5.56-8.92-14.31-8.92-26.02 0-18.4 11.9-34.81 32.18-34.81 15.57 0 21.37 8.64 32.45 8.64 11.2 0 18.87-11.51 18.87-19.51 0-6.25-3-10.52-5.75-13.66 2.03 2.08 4.96 5.02 4.36 8.96z" fill="url(#gc_bodyGrad2)" opacity=".6" />
      {/* ── Small highlights ── */}
      <path d="m118.3 119.1c-0.55 1.67 2.03 2.17 4.36 1.25s2.33-2.14 1.3-2.89c-1.45-1.06-5.01-0.25-5.66 1.64z" fill="#F7CED7" opacity=".6" />
      <path d="m129.3 118.1c-1.1 2.93 23.24 3.01 24.7 0.72 2.23-3.52-4.7-3.76-9.28-3.76-5.67-0.08-14.55 0.67-15.42 3.04z" fill="#F7CED7" opacity=".8" />
      {/* ── Cheeks ── */}
      <path d="m130.1 80.16c1.13 3.01 7.66 3.59 10.66 1.23 3.25-2.54 1.21-4.31-1.91-4.64-3.6-0.42-10.06-0.08-8.75 3.41z" fill="#F7CED7" opacity=".6" />
      <path d="m71.51 85.06c0.87 3.09 8.67 2.76 11.35 1.07 2.33-1.4 1.6-4.4-2.07-4.4-3.25 0-10.23-0.25-9.28 3.33z" fill="#F7CED7" opacity=".6" />

      {/* ── Open eyes (from Gonish_character_eye.svg) ── */}
      <g className="transition-opacity duration-300" style={{ opacity: isSmiling ? 0 : 1 }}>
        {/* Eye sockets */}
        <path d="m117.6 69.05c0-6.09 4.27-9.29 9.28-9.29 5.26 0 8.58 4.98 8.58 9.29 0 4.98-4.22 8.76-8.49 8.76-5.22 0-9.37-3.62-9.37-8.76z" fill="#6E0A39" />
        <path d="m76.64 71.71c0-6.09 4.27-8.85 8.95-8.85 5.27 0 8.59 4.53 8.59 8.85 0 5.44-4.16 8.75-8.7 8.75-5.06 0-8.84-3.61-8.84-8.75z" fill="#6E0A39" />
        {/* Irises (follow mouse) */}
        <path d="m121 66.62c0-2.48 1.91-3.61 3.77-3.61 2.08 0 3.31 1.95 3.31 3.61 0 2.13-1.86 3.48-3.34 3.48-2.14 0-3.74-1.43-3.74-3.48z" fill="#FEFFFE" transform={iris} />
        <path d="m80.06 69.23c0-2.48 1.55-3.1 3.3-3.1 2.14 0 3.37 1.6 3.37 3.1 0 2.03-1.49 3.25-3.09 3.25-2.03 0-3.58-1.2-3.58-3.25z" fill="#FEFFFE" transform={iris} />
        {/* Reflections (follow mouse) */}
        <path d="m128.8 73.11c0-1.42 1.06-2.12 2.12-2.12 1.24 0 1.98 1.12 1.98 2.12 0 1.36-1.18 2.14-2.04 2.14-1.34 0-2.06-0.91-2.06-2.14z" fill="#FEFFFE" transform={iris} />
        <path d="m87.42 75.53c0-1.42 1.07-1.86 1.97-1.86 1.07 0 1.76 1.01 1.76 1.86 0 1.22-1.13 1.91-1.87 1.91-1.13 0-1.86-0.81-1.86-1.91z" fill="#FEFFFE" transform={iris} />
      </g>

      {/* ── Smiling eyes (from Gonish_character.svg) ── */}
      <g className="transition-opacity duration-300" style={{ opacity: isSmiling ? 1 : 0 }}>
        <path d="m119.6 72.39c0.91-5.32 3.84-7.36 7.68-7.36 4.94 0 7.34 4.78 7.66 6.47 0.32 1.51-1.22 2.77-2.69 1.18-1.71-1.97-2.88-3.73-5.11-3.73-3.18 0-4.46 3.27-5.49 4.86-0.95 1.5-2.34 0.54-2.05-1.42z" fill="#6E0A39" />
        <path d="m77.91 75.9c0.95-5.32 4.41-7.57 7.8-7.57 4.38 0 6.53 4.18 7.33 6.35 0.7 2.04-1.78 2.95-2.73 1.36-1.47-2.23-2.64-3.9-4.68-3.9-3.18 0-4.21 3-5.31 4.77-1.03 1.75-2.7 0.95-2.41-1.01z" fill="#6E0A39" />
      </g>

      {/* ── Mouth ── */}
      <path d="m99.58 77.76c1.28 2.15 3.61 4.1 7 4.1 4.23 0 6.27-2.93 7.07-4.34 0.87-1.67-1.02-2.25-1.89-1.19-1.54 2.08-2.71 2.89-5.04 2.89s-3.36-1.3-4.61-2.47c-1.32-1.14-3.47-0.56-2.53 1.01z" fill="#6E0A39" />

      {/* ── Wand & accessories ── */}
      <path d="m48.81 66.08c-0.3-2.36 0.37-2.11-0.5-1.53l-15.25-16.07c-2.04 0.93-7.19 0.58-8.06-4.2-0.42-3.67 2.12-6.68 5.44-6.68 3.67 0 5.33 2.23 5.88 5.31l6.53 0.67-0.57-5.86c-2.42-0.33-4.16-2-3.94-4.15 0.29-2.54 2.11-3.55 4.15-3.55 1.97 0 3.79 1.14 4.29 2.9l4.93 3.01 1.03-14.98c-2.67-0.92-4.82-3.46-4.6-6.08 0.29-4.03 3.22-5.44 5.62-5.61 5.08-0.49 6.9 3.36 6.75 5.82-0.07 1.26-0.31 2.41-0.7 3.08l12.86 3.67 0.79-3.76c-1.54-0.67-2.33-2.24-1.91-4 0.58-2.24 2.18-2.65 4-2.65 2.57 0 3.93 2.06 3.64 3.74l-0.15 1.97 3.75 3.15 3.52-5.66c-1.66-1.31-2.68-2.87-2.54-5.19 0.29-3.09 2.77-4.39 5.34-4.43 3.97-0.17 5.79 2.85 5.65 5.47-0.15 2.36-1.32 3.76-2.6 4.78l5.75 21.89c1.74 0.58 2.69 2.35 2.55 4.5-0.22 3.01-1.61 4.17-4.01 6.03-9.14 7.08-23.93 15.64-40.43 22.01-3.06 1.28-6.63 0.85-7.21-3.6z" fill="#6E0A39" />
      <path d="m53.91 68.62c-1.97 0.17-3.15-1.4-3.15-2.54 0-1.41 0.66-1.9 2.48-2.82 14.22-7.72 25.8-14.95 41.88-24.02 1.74-1.02 3.02 0.47 3.02 2.03 0 1.85-1.03 2.77-2.69 4.17-10.54 8.27-24.37 15.61-39.62 22.62-0.67 0.33-1.41 0.5-1.92 0.56z" fill="url(#gc_wand)" stroke="#6E0A39" strokeMiterlimit="10" strokeWidth="1.161" />
      <path d="m34.86 43.7c0 2.54-1.82 3.95-3.87 3.95-2.26 0-3.73-1.84-3.73-3.78 0-2.36 1.47-4.04 3.51-4.04 2.4 0 4.09 1.49 4.09 3.87z" fill="url(#gc_gem1)" stroke="#6E0A39" strokeMiterlimit="10" strokeWidth="1.735" />
      <path d="m58.26 15.83c0 2.93-1.9 4.33-4.3 4.33-2.74 0-4.49-2.15-4.49-4.11 0-2.63 1.75-4.59 4.22-4.59 2.88 0 4.57 1.87 4.57 4.37z" fill="url(#gc_gem2)" stroke="#6E0A39" strokeMiterlimit="10" strokeWidth="2.309" />
      <path d="m93.37 10.22c0 2.63-1.74 3.93-3.86 3.93-2.4 0-3.68-1.87-3.68-3.72 0-2.25 1.54-3.92 3.59-3.92 2.4 0 3.95 1.76 3.95 3.71z" fill="url(#gc_gem3)" stroke="#6E0A39" strokeMiterlimit="10" strokeWidth="1.735" />
      <path d="m35.53 46.41 12.68 0.75c4.55 0.33 6.44-1.52 6.74-6.55l0.52-19.5 2.15-1.04 16.45 9.63c5.15 2.53 7.75 0.38 10.35-4.73l4.94-9.06 0.8-0.08 5.67 21.26c-14.86 9.06-25.02 16.47-44.61 25.27l-15.69-15.95z" fill="url(#gc_wandFill)" />
      <path d="m56.14 25.39-0.3 12.08c-0.07 1.26 1.82 1.1 1.89-0.65l0.43-11.18c0.07-1.87-1.75-2.62-2.02-0.25z" fill="#F4B8D2" />
      <path d="m91.63 20.28 3.28 15.65c0.29 1.29-1.75 2.55-2.4 0.8l-2.57-16.45c-0.3-1.75 1.34-2.17 1.69 0z" fill="url(#gc_wandShadow1)" />
      <path d="m37.07 47.57 12.79 12.39c0.87 0.84 2.6-0.56 1.36-1.82l-12.93-11.41c-1.03-1.01-2.27-0.26-1.22 0.84z" fill="url(#gc_wandShadow2)" />
      <path d="m63.49 35.83-0.43 6.87c-0.07 1.03 0.36 1.86 1.13 2.28l6.09 3.17c1.03 0.58 2.2 0 2.34-1.24l0.7-8c0.07-0.67-0.29-1.35-0.91-1.68l-6.53-3.02c-1.17-0.66-2.34 0.17-2.39 1.62z" fill="#6E0A39" />
      <path d="m64.76 36.19-0.57 6.35c-0.08 0.67 0.14 1.17 0.72 1.5l5.22 2.71c0.58 0.33 1.08 0 1.08-0.67l0.65-6.78-5.91-3.58c-0.58-0.41-1.12-0.25-1.19 0.47z" fill="url(#gc_gemCenter)" stroke="#9E1F63" strokeMiterlimit="10" strokeWidth=".714" />
      <path d="m65.51 36.02 4.62 6.89-5.37-3.01 0.75-3.88z" fill="#FFFEFF" opacity=".6" />

      {/* ── Gradient definitions ── */}
      <defs>
        <radialGradient id="gc_body" cx="0" cy="0" r="1" gradientTransform="translate(104.8 118.7) scale(80.05 76.39)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E71958" offset=".3491" />
          <stop stopColor="#E6255E" offset=".6548" />
          <stop stopColor="#C62F75" offset=".916" />
          <stop stopColor="#BF347A" offset=".9551" />
        </radialGradient>
        <linearGradient id="gc_bodyGrad1" x1="103.8" x2="167" y1="149.1" y2="149.1" gradientUnits="userSpaceOnUse">
          <stop stopColor="#951B54" stopOpacity=".5" offset="0" />
          <stop stopColor="#951B54" stopOpacity=".02" offset=".989" />
          <stop stopColor="#951B54" stopOpacity="0" offset="1" />
        </linearGradient>
        <linearGradient id="gc_bodyGrad2" x1="78.19" x2="161.8" y1="110.4" y2="110.4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#951B54" stopOpacity=".3" offset="0" />
          <stop stopColor="#951B54" stopOpacity=".02" offset=".989" />
          <stop stopColor="#951B54" stopOpacity="0" offset="1" />
        </linearGradient>
        <linearGradient id="gc_wand" x1="50.75" x2="98.8" y1="53.89" y2="53.89" gradientUnits="userSpaceOnUse">
          <stop stopColor="#925913" offset="0" />
          <stop stopColor="#F8DD7B" offset=".2031" />
          <stop stopColor="#D0811B" offset=".4739" />
          <stop stopColor="#F8DD7B" offset=".7485" />
          <stop stopColor="#925913" offset="1" />
        </linearGradient>
        <linearGradient id="gc_gem1" x1="27.75" x2="34.38" y1="43.73" y2="43.73" gradientUnits="userSpaceOnUse">
          <stop stopColor="#925913" offset="0" />
          <stop stopColor="#F8DD7B" offset=".2031" />
          <stop stopColor="#D0811B" offset=".4739" />
          <stop stopColor="#F8DD7B" offset=".7485" />
          <stop stopColor="#925913" offset="1" />
        </linearGradient>
        <linearGradient id="gc_gem2" x1="50.04" x2="57.69" y1="15.81" y2="15.81" gradientUnits="userSpaceOnUse">
          <stop stopColor="#925913" offset="0" />
          <stop stopColor="#F8DD7B" offset=".2031" />
          <stop stopColor="#D0811B" offset=".4739" />
          <stop stopColor="#F8DD7B" offset=".7485" />
          <stop stopColor="#925913" offset="1" />
        </linearGradient>
        <linearGradient id="gc_gem3" x1="86.33" x2="92.88" y1="10.34" y2="10.34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#925913" offset="0" />
          <stop stopColor="#F8DD7B" offset=".2031" />
          <stop stopColor="#D0811B" offset=".4739" />
          <stop stopColor="#F8DD7B" offset=".7485" />
          <stop stopColor="#925913" offset="1" />
        </linearGradient>
        <linearGradient id="gc_wandFill" x1="55.33" x2="93.11" y1="38.82" y2="38.82" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D81E61" offset=".0061" />
          <stop stopColor="#D00B5A" offset=".411" />
          <stop stopColor="#951954" offset=".9634" />
        </linearGradient>
        <linearGradient id="gc_wandShadow1" x1="90.67" x2="95.51" y1="26.97" y2="26.97" gradientUnits="userSpaceOnUse">
          <stop stopColor="#951B54" stopOpacity=".6" offset="0" />
          <stop stopColor="#951B54" stopOpacity=".02" offset=".989" />
          <stop stopColor="#951B54" stopOpacity="0" offset="1" />
        </linearGradient>
        <linearGradient id="gc_wandShadow2" x1="36.4" x2="51.82" y1="53.62" y2="53.62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#951B54" stopOpacity=".6" offset="0" />
          <stop stopColor="#951B54" stopOpacity=".02" offset=".989" />
          <stop stopColor="#951B54" stopOpacity="0" offset="1" />
        </linearGradient>
        <linearGradient id="gc_gemCenter" x1="64.17" x2="71.87" y1="41.26" y2="41.26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8DD7B" offset="0" />
          <stop stopColor="#CC991B" offset="1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
