"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Stored preference. Must match the key read by the no-flash inline script in
// app/layout.tsx.
export const THEME_STORAGE_KEY = "theme";

export type ThemeChoice = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  // The user's choice (what the toggle reflects).
  choice: ThemeChoice;
  setChoice: (choice: ThemeChoice) => void;
  // False until after mount, so the toggle can render a deterministic value
  // that matches SSR (avoids a hydration mismatch on the selected button).
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const prefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

// Map a choice to the concrete theme to apply to <html data-theme>.
function resolve(choice: ThemeChoice): ResolvedTheme {
  if (choice === "light" || choice === "dark") return choice;
  return prefersDark() ? "dark" : "light";
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.setAttribute("data-theme", resolved);
}

// App-wide theme state. Holds the light/dark/system choice, applies the
// resolved value to <html data-theme>, persists it, and (in system mode)
// follows the OS live. The pre-paint inline script in layout.tsx has already
// set the correct attribute before this mounts, so there's no flash; this just
// owns subsequent changes.
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Deterministic "system" on both server and first client render, then adopt
  // the stored choice on mount. The page COLORS are already correct pre-paint
  // via the inline script; this state only drives the toggle's selected button.
  const [choice, setChoiceState] = useState<ThemeChoice>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      // Storage unavailable — keep the default.
    }
    if (stored === "light" || stored === "dark" || stored === "system") {
      setChoiceState(stored);
    }
    setMounted(true);
  }, []);

  // Apply + persist whenever the choice changes.
  useEffect(() => {
    if (!mounted) return;
    applyTheme(resolve(choice));
    try {
      localStorage.setItem(THEME_STORAGE_KEY, choice);
    } catch {
      // Storage unavailable — the theme still applies for this session.
    }
  }, [choice, mounted]);

  // In system mode, follow OS changes live.
  useEffect(() => {
    if (choice !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(mql.matches ? "dark" : "light");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [choice]);

  const setChoice = useCallback((next: ThemeChoice) => {
    setChoiceState(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ choice, setChoice, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Access the theme choice. Throws if used outside the provider.
export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }
  return value;
}
