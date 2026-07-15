/**
 * Module: apps/web/tailwind.config.ts
 * Purpose: Defines Tailwind content scanning and design-token extensions for the web app.
 */

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "rgb(var(--navy-rgb) / <alpha-value>)",
        panel: "rgb(var(--panel-rgb) / <alpha-value>)",
        "panel-hi": "rgb(var(--panel-hi-rgb) / <alpha-value>)",
        teal: "rgb(var(--teal-rgb) / <alpha-value>)",
        "teal-dim": "rgb(var(--teal-dim-rgb) / <alpha-value>)",
        amber: "rgb(var(--amber-rgb) / <alpha-value>)",
        red: "rgb(var(--red-rgb) / <alpha-value>)",
        orange: "rgb(var(--orange-rgb) / <alpha-value>)",
        green: "rgb(var(--green-rgb) / <alpha-value>)",
        ice: "rgb(var(--ice-rgb) / <alpha-value>)",
        steel: "rgb(var(--steel-rgb) / <alpha-value>)",
        border: "rgb(var(--border-rgb) / <alpha-value>)"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Bebas Neue", "cursive"]
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { transform: "scale(0.95)", opacity: "0.2" },
          "50%": { transform: "scale(1.15)", opacity: "0.5" }
        }
      },
      animation: {
        pulseSoft: "pulseSoft 1.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
