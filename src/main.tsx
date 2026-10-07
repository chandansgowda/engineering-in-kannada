import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const container = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Pages are prerendered at build time. Hydrate when the HTML was rendered for
// this exact URL; otherwise (404 fallback, query-string filters) render fresh.
const prerendered = container.dataset.prerendered;
const path = window.location.pathname.replace(/\/+$/, "") || "/";
if (prerendered && prerendered === path && !window.location.search) {
  hydrateRoot(container, app);
} else {
  container.innerHTML = "";
  createRoot(container).render(app);
}
