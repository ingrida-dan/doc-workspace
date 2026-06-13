"use client";

import { useRef } from "react";
import { useTheme, type ThemeChoice } from "./ThemeProvider";

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

// Three-way segmented control for the theme. All options stay visible so the
// current selection is unambiguous and "System" is discoverable. Exposed as a
// radiogroup: arrow keys move between options (roving tabindex), and the
// checked option is the single tab stop.
export default function ThemeToggle() {
  const { choice, setChoice, mounted } = useTheme();
  // Until mounted, render the deterministic "system" selection so SSR and the
  // first client render agree (no hydration mismatch on the checked option).
  const active = mounted ? choice : "system";
  const groupRef = useRef<HTMLDivElement>(null);

  // Arrow keys move selection (and focus) within the radiogroup, wrapping.
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    let dir = 0;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") dir = 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") dir = -1;
    else return;
    e.preventDefault();
    const next = (index + dir + OPTIONS.length) % OPTIONS.length;
    setChoice(OPTIONS[next].value);
    const radios = groupRef.current?.querySelectorAll<HTMLElement>(
      '[role="radio"]',
    );
    radios?.[next]?.focus();
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Theme"
      className="flex gap-0.5 rounded-md border border-border p-0.5"
    >
      {OPTIONS.map(({ value, label }, index) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            // Roving tabindex: only the checked option is in the tab order;
            // arrow keys reach the others.
            tabIndex={isActive ? 0 : -1}
            onClick={() => setChoice(value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
              isActive
                ? "bg-foreground/[.06] text-foreground"
                : "text-muted hover:bg-foreground/[.04]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
