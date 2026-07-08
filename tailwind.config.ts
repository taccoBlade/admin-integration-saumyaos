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
        background: "var(--background)",
        foreground: "var(--foreground)",
        attention: {
          50: 'rgb(var(--theme-accent) / 0.1)',
          100: 'rgb(var(--theme-accent) / 0.2)',
          200: 'rgb(var(--theme-accent) / 0.3)',
          300: 'rgb(var(--theme-accent) / 0.4)',
          400: 'rgb(var(--theme-accent) / 0.8)',
          500: 'rgb(var(--theme-accent) / 1)',
          600: 'rgb(var(--theme-accent) / 1)',
          700: 'rgb(var(--theme-accent) / 1)',
          800: 'rgb(var(--theme-accent) / 1)',
          900: 'rgb(var(--theme-accent) / 1)',
          950: 'rgb(var(--theme-accent) / 1)',
          DEFAULT: "rgb(var(--theme-accent) / <alpha-value>)",
          hover: "rgb(var(--theme-accent) / 0.8)",
        },
        archive: {
          50: "#f8f9fa",
          100: "#f1f3f5",
          200: "#e9ecef",
          300: "#dee2e6",
          400: "#ced4da",
          500: "#adb5bd",
          600: "#6c757d",
          700: "#495057",
          800: "#343a40",
          900: "#111111", // Deep charcoal/almost black
        },
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
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "SFMono-Regular", "Consolas", "monospace"],
        syne: ["var(--font-syne)", "sans-serif"],
        space: ["var(--font-space-grotesk)", "sans-serif"],
        cormorant: ["var(--font-cormorant)", "serif"],
        "bigger-scape": ["var(--font-bigger-scape)", "sans-serif"],
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
