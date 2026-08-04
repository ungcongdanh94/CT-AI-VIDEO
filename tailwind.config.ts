import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // CÔNG THẢNH brand tokens
        brand: {
          DEFAULT: "#00A651", // aluminum green
          dark: "#00793B",
          light: "#E9F8EF",
        },
        ink: {
          DEFAULT: "#16181B", // dark gray, near-black
          soft: "#3A3D42",
          faint: "#6B7076",
        },
        line: "#E6E8EA",
        surface: "#FFFFFF",
        canvas: "#FAFBFA",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        extrude: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        extrude: "extrude 1.2s cubic-bezier(0.65, 0, 0.35, 1) forwards",
        fadeUp: "fadeUp 0.5s ease-out forwards",
        pulseDot: "pulseDot 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
