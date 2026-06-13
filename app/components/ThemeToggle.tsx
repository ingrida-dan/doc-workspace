"use client";

import { useTheme, type ThemeChoice } from "./ThemeProvider";

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

// Three-way segmented control for the theme. All options stay visible so the
// current selection is unambiguous and "System" is discoverable.
export default function ThemeToggle() {
  const { choice, setChoice, mounted } = useTheme();
  // Until mounted, render the deterministic "system" selection so SSR and the
  // first client render agree (no hydration mismatch on the selected button).
  const active = mounted ? choice : "system";

  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex gap-0.5 rounded-md border border-black/[.08] p-0.5 dark:border-white/[.145]"
    >
      {OPTIONS.map(({ value, label }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setChoice(value)}
            aria-pressed={isActive}
            className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
              isActive
                ? "bg-black/[.06] dark:bg-white/[.12]"
                : "text-zinc-500 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
