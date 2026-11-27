import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { toast } from "../store/toast";

type Theme = "dark" | "light";
const THEME_STORAGE_KEY = "eik-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#1A1A1A" : "#FAFAF9");
  document
    .querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
    ?.setAttribute("content", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const initialTheme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    applyTheme(initialTheme);
    setTheme(initialTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    setTheme(nextTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      toast("Theme changed, but your preference could not be saved.", "error");
    }
  }

  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      aria-pressed={theme === "light"}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
