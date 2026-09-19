import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080a09",
        panel: "#0d100f",
        line: "#262a27",
        bone: "#e8e7df",
        muted: "#8a8f89",
        signal: "#b6ff4a",
        amber: "#e6a940",
        danger: "#ee5b4f"
      },
      fontFamily: {
        sans: ["Arial", "Helvetica Neue", "sans-serif"],
        mono: ["SFMono-Regular", "Consolas", "Liberation Mono", "monospace"]
      },
      animation: {
        scan: "scan 7s linear infinite",
        pulseSoft: "pulseSoft 2.4s ease-in-out infinite"
      },
      keyframes: {
        scan: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(100vh)" } },
        pulseSoft: { "0%, 100%": { opacity: "1" }, "50%": { opacity: ".5" } }
      }
    }
  },
  plugins: []
} satisfies Config;
