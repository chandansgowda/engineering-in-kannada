import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { BRAND } from './src/lib/brand';

/** Fills %BRAND_*% placeholders in index.html from src/lib/brand.ts. */
function brandHtml(): Plugin {
  const mime = BRAND.logo.endsWith('.svg') ? 'image/svg+xml' : BRAND.logo.endsWith('.png') ? 'image/png' : 'image/jpeg';
  return {
    name: 'brand-html',
    // `pre` so the placeholders are replaced before Vite parses asset URLs.
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html
          .replaceAll('%BRAND_LOGO_TYPE%', mime)
          .replaceAll('%BRAND_LOGO%', BRAND.logo)
          .replaceAll('%BRAND_WORDMARK%', BRAND.wordmark),
    },
  };
}

// https://vitejs.dev/config/
// `npm run build` makes the client bundle, then an SSR bundle of src/entry-server.tsx
// that scripts/prerender.mjs uses to write static HTML for every route.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), brandHtml()],
  base: '/',
  build: {
    target: 'es2020',
    rollupOptions: isSsrBuild
      ? {}
      : {
          output: {
            manualChunks: {
              react: ['react', 'react-dom', 'react-router-dom'],
              markdown: ['react-markdown', 'remark-gfm'],
            },
          },
        },
  },
}));
