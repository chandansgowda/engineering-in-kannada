/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FFD700",
        dark: "#1A1A1A",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: "2px",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "white",
            fontFamily: 'Inter, sans-serif',
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
            },
            a: {
              color: "#FFD700",
              "&:hover": {
                color: "#FFD700",
                textDecoration: "underline",
              },
            },
            h1: { color: "white" },
            h2: { color: "white" },
            h3: { color: "white" },
            h4: { color: "white" },
            h5: { color: "white" },
            h6: { color: "white" },
            strong: { color: "white" },
            code: {
              color: "#FFD700",
              backgroundColor: "rgba(255, 215, 0, 0.1)",
              padding: "0.2em 0.4em",
              borderRadius: "0.25rem",
            },
            pre: {
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              color: "white",
              padding: "1rem",
              borderRadius: "0.5rem",
            },
            blockquote: {
              color: "white",
              borderLeftColor: "#FFD700",
            },
            "ul > li::marker": {
              color: "#FFD700",
            },
            "ol > li::marker": {
              color: "#FFD700",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
