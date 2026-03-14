import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const frames = [
  { fill: "rgba(243, 29, 91, 0.16)", offsetX: -0.02, offsetY: -0.01, rotation: -0.03, stroke: "rgba(20, 16, 20, 0.18)" },
  { fill: "rgba(20, 16, 20, 0.1)", offsetX: 0.03, offsetY: 0.02, rotation: 0.025, stroke: "rgba(243, 29, 91, 0.36)" },
  { fill: "rgba(243, 29, 91, 0.12)", offsetX: -0.035, offsetY: 0.015, rotation: -0.018, stroke: "rgba(20, 16, 20, 0.16)" },
  { fill: "rgba(255, 255, 255, 0.82)", offsetX: 0.02, offsetY: -0.015, rotation: 0.02, stroke: "rgba(243, 29, 91, 0.34)" },
];

export default function HeroFilmCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return undefined;
    }

    let frameId = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      const frameIndex = prefersReducedMotion ? 0 : Math.floor(time / 500) % frames.length;
      const frame = frames[frameIndex];
      const pulse = Math.sin(time / 1400);
      const drift = Math.cos(time / 2000);
      const giantSize = Math.min(width * 0.32, height * 0.56);
      const lineSize = Math.min(width * 0.085, 60);

      context.clearRect(0, 0, width, height);

      const background = context.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, "#fffefe");
      background.addColorStop(0.52, "#f7f1f3");
      background.addColorStop(1, "#efe8ea");
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      const glow = context.createRadialGradient(width * 0.2, height * 0.18, 0, width * 0.2, height * 0.18, width * 0.55);
      glow.addColorStop(0, "rgba(243, 29, 91, 0.18)");
      glow.addColorStop(1, "rgba(243, 29, 91, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      context.save();
      context.translate(width / 2 + width * frame.offsetX, height / 2 + height * frame.offsetY);
      context.rotate(frame.rotation + pulse * 0.012);
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = `700 ${giantSize}px "Iowan Old Style", "Palatino Linotype", serif`;
      context.lineWidth = Math.max(2, giantSize * 0.012);
      context.strokeStyle = frame.stroke;
      context.strokeText("GONI", 0, 0);
      context.fillStyle = frame.fill;
      context.fillText("GONI", 0, 0);
      context.globalAlpha = 0.14;
      context.fillStyle = "rgba(20, 16, 20, 0.22)";
      context.fillText("GONI", giantSize * 0.045, giantSize * 0.04);
      context.restore();

      context.save();
      context.font = `600 ${lineSize}px "Noto Sans KR", "Aptos", "Segoe UI", sans-serif`;
      context.fillStyle = "rgba(20, 16, 20, 0.12)";
      context.textAlign = "left";
      for (let index = -1; index < 5; index += 1) {
        const y = height * 0.18 + index * height * 0.2 + drift * 8;
        context.fillText("GONI", width * 0.08, y);
        context.fillText("GONI", width * 0.58, y + 26);
      }
      context.restore();

      context.save();
      context.strokeStyle = "rgba(20, 16, 20, 0.045)";
      for (let x = 0; x < width; x += 32) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x + pulse * 2, height);
        context.stroke();
      }
      context.restore();

      if (!prefersReducedMotion) {
        frameId = window.requestAnimationFrame(draw);
      }
    };

    const handleResize = () => {
      resize();
      draw(performance.now());
    };

    resize();

    if (prefersReducedMotion) {
      draw(0);
    } else {
      frameId = window.requestAnimationFrame(draw);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [prefersReducedMotion]);

  return <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden="true" />;
}
