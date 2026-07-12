/**
 * Module: apps/web/tailwind.config.ts
 * Purpose: Defines Tailwind content scanning and design-token extensions for the web app.
 */
const config = {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                navy: "#050d1e",
                panel: "#0a1e3d",
                "panel-hi": "#0d2548",
                teal: "#00d4b8",
                "teal-dim": "#007a6e",
                amber: "#f5a623",
                red: "#ff3b5c",
                orange: "#ff6b2b",
                green: "#00e676",
                ice: "#e8f2ff",
                steel: "#4a7a9b",
                border: "rgba(0, 212, 184, 0.14)"
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
