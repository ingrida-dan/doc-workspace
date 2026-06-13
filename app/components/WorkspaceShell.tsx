"use client";

import { useState } from "react";

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

  return (
    <div className="flex flex-1 flex-col md:flex-row md:min-h-0">
      {/* Mobile top bar — menu toggle + app name (hidden on desktop) */}
      <div className="flex items-center gap-3 border-b border-black/[.08] px-4 py-3 md:hidden dark:border-white/[.145]">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open document list"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/[.08] transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.06]"
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
        <span className="text-sm font-semibold tracking-tight">
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
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-black/[.08] bg-background transition-transform duration-200 ease-out md:static md:z-auto md:translate-x-0 dark:border-white/[.145] ${
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
