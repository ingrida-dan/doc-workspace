"use client";

import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDocuments } from "./DocumentsProvider";
import ThemeToggle from "./ThemeToggle";

// Minimum gap between document creations. Guards against a rapid double-click
// creating two blank docs (see handleNew).
const CREATE_COOLDOWN_MS = 700;

// Renders the left-pane sidebar: the app header with a working "New Document"
// action and the live, navigable list of documents (read from the shared
// store). The active document is highlighted.
export default function Sidebar() {
  const { documents, status, createDocument } = useDocuments();
  const router = useRouter();
  // The active [id] segment, or null on the /docs index.
  const activeSegment = useSelectedLayoutSegment();

  // Disables the button while we create + navigate, purely for visual feedback.
  // Reset once we've landed in the new document (the segment changes).
  const [navigating, setNavigating] = useState(false);
  // Timestamp of the last create, for the cooldown guard below.
  const lastCreateRef = useRef(0);

  // Local, instant search. Pure view state — filters the already-loaded list
  // by title; no IndexedDB query or re-fetch.
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q
    ? documents.filter((d) => d.title.toLowerCase().includes(q))
    : documents;

  useEffect(() => {
    setNavigating(false);
  }, [activeSegment]);

  const handleNew = async () => {
    // Cooldown guard against a rapid double-click creating two blank docs.
    // Create-then-navigate alone doesn't prevent this: on localhost the route
    // commits faster than a human's inter-click gap (~120ms), so the
    // navigation-based disabled state re-enables the button before the second
    // click lands. A synchronous, time-based guard is the robust fix — it
    // bails any second create within the window. A deliberate new document
    // after the cooldown still works normally.
    const now = Date.now();
    if (now - lastCreateRef.current < CREATE_COOLDOWN_MS) return;
    lastCreateRef.current = now;

    setNavigating(true);
    const doc = await createDocument();
    if (doc) {
      // Clear any active search so the new (blank, non-matching) doc is
      // visible in the list instead of hidden behind a stale filter.
      setQuery("");
      router.push(`/docs/${doc.id}`);
    } else {
      // Create failed — re-enable so the user can retry.
      setNavigating(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header area: app name + New Document action */}
      <div className="flex flex-col gap-3 border-b border-border px-5 py-5">
        <h1 className="font-serif text-lg font-semibold tracking-tight">
          Doc Workspace
        </h1>
        <ThemeToggle />
        <button
          type="button"
          onClick={handleNew}
          disabled={navigating}
          className="inline-flex h-9 items-center justify-center rounded-md bg-accent px-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          New Document
        </button>

        {/* Search — only shown once there are documents to filter */}
        {status === "ready" && documents.length > 0 && (
          <>
            <label htmlFor="doc-search" className="sr-only">
              Search documents
            </label>
            <input
              id="doc-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents"
              className="h-9 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none placeholder:text-muted focus:border-accent"
            />
          </>
        )}
      </div>

      {/* Document list — loading / empty / error / no-match / list states */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {status === "loading" && (
          <p className="px-2 text-sm text-muted">Loading…</p>
        )}

        {status === "error" && (
          <p className="px-2 text-sm text-muted">Couldn&apos;t load documents.</p>
        )}

        {status === "ready" && documents.length === 0 && (
          <p className="px-2 text-sm text-muted">No documents yet</p>
        )}

        {status === "ready" && documents.length > 0 && filtered.length === 0 && (
          <p className="px-2 text-sm text-muted">
            No documents match your search
          </p>
        )}

        {status === "ready" && filtered.length > 0 && (
          <ul className="flex flex-col gap-0.5">
            {filtered.map((doc) => {
              const isActive = doc.id === activeSegment;
              return (
                <li key={doc.id}>
                  <Link
                    href={`/docs/${doc.id}`}
                    aria-current={isActive ? "page" : undefined}
                    className={`block truncate rounded-md border-l-2 px-2.5 py-2 text-sm transition-colors ${
                      isActive
                        ? "border-accent bg-accent/10 font-medium text-accent"
                        : "border-transparent text-foreground hover:bg-foreground/[.04]"
                    }`}
                  >
                    {doc.title || "Untitled"}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
