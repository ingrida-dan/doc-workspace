"use client";

import { useDocuments } from "./DocumentsProvider";

// Renders the left-pane sidebar: the app header with a working "New Document"
// action and the live list of documents (read from the shared store).
export default function Sidebar() {
  const { documents, status, isCreating, createDocument } = useDocuments();

  return (
    <div className="flex h-full flex-col">
      {/* Header area: app name + New Document action */}
      <div className="flex flex-col gap-3 border-b border-black/[.08] px-5 py-4 dark:border-white/[.145]">
        <h1 className="text-base font-semibold tracking-tight">
          Doc Workspace
        </h1>
        <button
          type="button"
          onClick={() => createDocument()}
          disabled={isCreating}
          className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-3 text-sm font-medium text-background transition-colors hover:opacity-90 disabled:opacity-50"
        >
          New Document
        </button>
      </div>

      {/* Document list — loading / empty / error / list states */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {status === "loading" && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        )}

        {status === "error" && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Couldn&apos;t load documents.
          </p>
        )}

        {status === "ready" && documents.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No documents yet
          </p>
        )}

        {status === "ready" && documents.length > 0 && (
          <ul className="flex flex-col gap-1">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="truncate rounded-md px-2 py-1.5 text-sm"
              >
                {doc.title || "Untitled"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
