import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          50: "rgb(var(--color-primary-50) / <alpha-value>)",
          100: "rgb(var(--color-primary-100) / <alpha-value>)",
          200: "rgb(var(--color-primary-200) / <alpha-value>)",
          300: "rgb(var(--color-primary-300) / <alpha-value>)",
          400: "rgb(var(--color-primary-400) / <alpha-value>)",
          500: "rgb(var(--color-primary-500) / <alpha-value>)",
          600: "rgb(var(--color-primary-600) / <alpha-value>)",
          700: "rgb(var(--color-primary-700) / <alpha-value>)",
        },
        white: "rgb(var(--color-white) / <alpha-value>)",
        neutral: {
          50: "rgb(var(--color-neutral-50) / <alpha-value>)",
          100: "rgb(var(--color-neutral-100) / <alpha-value>)",
          200: "rgb(var(--color-neutral-200) / <alpha-value>)",
          300: "rgb(var(--color-neutral-300) / <alpha-value>)",
          400: "rgb(var(--color-neutral-400) / <alpha-value>)",
          500: "rgb(var(--color-neutral-500) / <alpha-value>)",
          600: "rgb(var(--color-neutral-600) / <alpha-value>)",
          700: "rgb(var(--color-neutral-700) / <alpha-value>)",
          800: "rgb(var(--color-neutral-800) / <alpha-value>)",
          900: "rgb(var(--color-neutral-900) / <alpha-value>)",
          950: "rgb(var(--color-neutral-950) / <alpha-value>)",
        },
        dark: {
          DEFAULT: "#1A1A1A",
          950: "#0F0F0F",
          900: "#141414",
          800: "#1A1A1A",
          700: "#222222",
          600: "#2A2A2A",
          500: "#333333",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Kannada"', "ui-sans-serif", "system-ui", "sans-serif"],
        kannada: ['"Noto Sans Kannada"', '"Plus Jakarta Sans"', "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,215,0,0.25), 0 8px 40px -8px rgba(255,215,0,0.35)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,0,0,0.8)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out both",
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "scale-in": "scale-in 0.2s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 1.6s infinite",
        float: "float 6s ease-in-out infinite",
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": theme("colors.neutral.300"),
            "--tw-prose-headings": theme("colors.white"),
            "--tw-prose-lead": theme("colors.neutral.300"),
            "--tw-prose-links": theme("colors.primary.500"),
            "--tw-prose-bold": theme("colors.white"),
            "--tw-prose-counters": theme("colors.primary.500"),
            "--tw-prose-bullets": theme("colors.primary.500"),
            "--tw-prose-hr": "rgba(255,255,255,0.1)",
            "--tw-prose-quotes": theme("colors.neutral.200"),
            "--tw-prose-quote-borders": theme("colors.primary.500"),
            "--tw-prose-captions": theme("colors.neutral.400"),
            "--tw-prose-code": theme("colors.primary.500"),
            "--tw-prose-pre-code": theme("colors.neutral.200"),
            "--tw-prose-pre-bg": theme("colors.dark.950"),
            "--tw-prose-th-borders": "rgba(255,255,255,0.15)",
            "--tw-prose-td-borders": "rgba(255,255,255,0.08)",
            a: {
              textDecoration: "none",
              borderBottom: "1px solid rgba(255,215,0,0.4)",
              "&:hover": { borderBottomColor: "#FFD700" },
            },
            code: {
              backgroundColor: "rgba(255, 215, 0, 0.1)",
              padding: "0.15em 0.4em",
              borderRadius: "0.375rem",
              fontWeight: "500",
            },
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            pre: {
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.875rem",
            },
            "pre code": { backgroundColor: "transparent", padding: "0" },
          },
        },
      }),
    },
  },
  plugins: [typography],
};
