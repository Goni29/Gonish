import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#F31D5B",
        ink: {
          DEFAULT: "#141014",
          muted: "#665C63",
          soft: "#8B8088",
        },
        paper: "#FFFDFC",
      },
      fontFamily: {
        display: ["Paperozi", "Aptos", "Segoe UI", "sans-serif"],
        body: ["Noto Sans KR", "Aptos", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        script: [
          "Snell Roundhand",
          "Segoe Script",
          "Brush Script MT",
          "Apple Chancery",
          "cursive",
        ],
      },
      boxShadow: {
        panel: "0 32px 120px rgba(20, 16, 20, 0.08)",
      },
      backgroundImage: {
        "brand-glow":
          "radial-gradient(circle at top left, rgba(243, 29, 91, 0.15), transparent 24%), radial-gradient(circle at bottom right, rgba(243, 29, 91, 0.08), transparent 28%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
