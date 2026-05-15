/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--c-ink)",
        foreground: "var(--c-cream)",
        primary: "var(--c-rust)",
        secondary: "var(--c-blush)",
        muted: "var(--c-ink-2)",
        cream: {
          DEFAULT: "var(--c-cream)",
          2: "var(--c-cream-2)"
        },
        ink: {
          DEFAULT: "var(--c-ink)",
          2: "var(--c-ink-2)"
        }
      },
      fontFamily: {
        sans: ["'Barlow Condensed'", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      animation: {
        "scroll-left": "scroll-left-to-right 60s linear infinite",
      },
      keyframes: {
        "scroll-left-to-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        }
      }
    },
  },
  plugins: [],
}
