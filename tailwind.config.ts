import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        ink: "var(--text)",
        "ink-muted": "var(--text-muted)",
        mint: {
          DEFAULT: "#58cc02",
          dark: "#46a302",
          soft: "#e8f7d4",
        },
        sky: {
          DEFAULT: "#1cb0f6",
          dark: "#0e8ccc",
          soft: "#e0f2fe",
        },
        coral: {
          DEFAULT: "#ff4b4b",
          dark: "#cc3333",
          soft: "#ffe4e4",
        },
        gold: {
          DEFAULT: "#ffc800",
          dark: "#cc9900",
          soft: "#fff4cc",
        },
        lilac: {
          DEFAULT: "#ce82ff",
          dark: "#a855f7",
          soft: "#f3e8ff",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
      },
      boxShadow: {
        card: "0 2px 0 var(--border-strong)",
        "card-hover": "0 4px 0 var(--border-strong)",
        "press-mint": "0 4px 0 #46a302",
        "press-sky": "0 4px 0 #0e8ccc",
        "press-coral": "0 4px 0 #cc3333",
        "press-gold": "0 4px 0 #cc9900",
        "press-lilac": "0 4px 0 #a855f7",
        "press-ink": "0 4px 0 #cdd2dc",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "20%,60%": { transform: "translateX(-6px)" },
          "40%,80%": { transform: "translateX(6px)" },
        },
        pop: {
          "0%": { transform: "scale(0.95)" },
          "60%": { transform: "scale(1.04)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        shake: "shake 0.4s ease-in-out",
        pop: "pop 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
