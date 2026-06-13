"use client";

import { useEffect, useState } from "react";

// Responsive two-pane shell for the workspace. On desktop the sidebar is a
// static left column; below `md` it becomes an off-canvas drawer toggled from
// a slim top bar, so the content area is never cramped at phone width.
export default function WorkspaceShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Track the `md` breakpoint so the drawer-only behaviour (inert when closed,
  // resetting open state) never applies on desktop, where the sidebar is
  // always visible. Starts false to match server render; corrected on mount.
  const [isDesktop, setIsDesktop] = useState(false);

  // Mirror Tailwind's `md` breakpoint. When we cross into desktop, close the
  // drawer so a previously-open mobile drawer doesn't reappear on the way back.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const sync = () => {
      setIsDesktop(query.matches);
      if (query.matches) setIsSidebarOpen(false);
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Close the drawer on Escape while it's open (mobile only — on desktop the
  // sidebar is static and the drawer is never "open").
  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isSidebarOpen]);

  // The drawer is off-screen but still in the DOM when closed on mobile —
  // mark it inert so keyboard and screen-reader users can't reach it. Never
  // inert on desktop, where it's a normal visible column.
  const isDrawerHidden = !isDesktop && !isSidebarOpen;

  return (
    <div className="flex flex-1 flex-col md:flex-row md:min-h-0">
      {/* Mobile top bar — menu toggle + app name (hidden on desktop) */}
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open document list"
          aria-expanded={isSidebarOpen}
          aria-controls="workspace-sidebar"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-foreground/[.05]"
        >
          {/* Hamburger icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="font-serif text-base font-semibold tracking-tight">
          Doc Workspace
        </span>
      </div>

      {/* Backdrop — only on mobile while the drawer is open */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      {/* Sidebar — static column on desktop, sliding drawer on mobile */}
      <aside
        id="workspace-sidebar"
        aria-label="Sidebar"
        inert={isDrawerHidden}
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-border bg-surface transition-transform duration-200 ease-out md:static md:z-auto md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </aside>

      {/* Content area — fills the remaining space */}
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
