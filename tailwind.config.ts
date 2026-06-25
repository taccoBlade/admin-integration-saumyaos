import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      spacing: {
        gutter: "1.5rem",
      },
      borderRadius: {
        lg: "0.75rem",
      },
      colors: {
        batmanYellow: "#eab308",
        batmanCharcoal: "#212121",
        batmanBlack: "#000000",
        background: "var(--background)",
        foreground: "var(--foreground)",
        charcoal: {
          900: "#121417",
          950: "#08090b",
          975: "#050608",
        },
        muted: {
          cyan: "#7dd3fc",
          teal: "#5eead4",
          lime: "#bef264",
          steel: "#94a3b8",
        },
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.07)",
          border: "rgba(255, 255, 255, 0.14)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["SFMono-Regular", "Consolas", "monospace"],
      },
      boxShadow: {
        glow: "0 0 80px rgba(94, 234, 212, 0.16)",
        glass: "0 24px 80px rgba(0, 0, 0, 0.32)",
      },
    },
  },
  plugins: [],
};
export default config;
