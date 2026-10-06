import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FFD700",
          50: "#FFFBE6",
          100: "#FFF4B3",
          200: "#FFEB80",
          300: "#FFE24D",
          400: "#FFDB26",
          500: "#FFD700",
          600: "#E6C200",
          700: "#B39700",
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
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
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
            "--tw-prose-headings": "#fff",
            "--tw-prose-lead": theme("colors.neutral.300"),
            "--tw-prose-links": "#FFD700",
            "--tw-prose-bold": "#fff",
            "--tw-prose-counters": "#FFD700",
            "--tw-prose-bullets": "#FFD700",
            "--tw-prose-hr": "rgba(255,255,255,0.1)",
            "--tw-prose-quotes": theme("colors.neutral.200"),
            "--tw-prose-quote-borders": "#FFD700",
            "--tw-prose-captions": theme("colors.neutral.400"),
            "--tw-prose-code": "#FFD700",
            "--tw-prose-pre-code": theme("colors.neutral.200"),
            "--tw-prose-pre-bg": "#0F0F0F",
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
