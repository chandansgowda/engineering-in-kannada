/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#f59e0b',   // warm amber/saffron
        'primary-dark': '#d97706',
        dark: '#0f0f1a',
        'dark-2': '#13131f',
        'dark-3': '#1a1a2e',
      },
      fontFamily: {
        sans: ['"Noto Sans Kannada"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'slide-down': 'slideDown 200ms ease-out',
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'white',
            a: { color: '#f59e0b', '&:hover': { color: '#f59e0b', textDecoration: 'underline' } },
            h1: { color: 'white' }, h2: { color: 'white' }, h3: { color: 'white' },
            h4: { color: 'white' }, h5: { color: 'white' }, h6: { color: 'white' },
            strong: { color: 'white' },
            code: { color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', padding: '0.2em 0.4em', borderRadius: '0.25rem' },
            pre: { backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', padding: '1rem', borderRadius: '0.5rem' },
            blockquote: { color: 'white', borderLeftColor: '#f59e0b' },
            'ul > li::marker': { color: '#f59e0b' },
            'ol > li::marker': { color: '#f59e0b' },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
