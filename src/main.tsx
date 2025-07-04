import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import './i18n'; // Import i18n configuration

// ✅ DEBUG: Catch and display runtime errors visibly on screen
window.addEventListener("error", function (e) {
  const el = document.createElement("pre");
  el.style.color = "red";
  el.style.background = "#fff";
  el.style.padding = "10px";
  el.style.zIndex = "9999";
  el.style.position = "fixed";
  el.style.top = "0";
  el.style.left = "0";
  el.style.whiteSpace = "pre-wrap";
  el.style.maxWidth = "100vw";
  el.style.maxHeight = "100vh";
  el.textContent = "Runtime error:\n" + (e.error?.stack || e.message || e.toString());
  document.body.appendChild(el);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <Suspense fallback="Loading...">
        <App />
      </Suspense>
    </HelmetProvider>
  </StrictMode>
);
