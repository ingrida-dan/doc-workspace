// Renders the left-pane sidebar: the app header with a "New Document"
// action and a placeholder region where the document list will live.
export default function Sidebar() {
  return (
    <div className="flex h-full flex-col">
      {/* Header area: app name + New Document action */}
      <div className="flex flex-col gap-3 border-b border-black/[.08] px-5 py-4 dark:border-white/[.145]">
        <h1 className="text-base font-semibold tracking-tight">
          Doc Workspace
        </h1>
        {/* Non-functional for now — wiring comes with document creation */}
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-3 text-sm font-medium text-background transition-colors hover:opacity-90"
        >
          New Document
        </button>
      </div>

      {/* Document list placeholder — empty state until real data exists */}
      <div className="flex flex-1 items-start px-5 py-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No documents yet
        </p>
      </div>
    </div>
  );
}
