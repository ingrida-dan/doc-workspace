// Workspace index — shown in the content pane when no document is selected.
export default function DocsPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Select a document or create a new one.
      </p>
    </div>
  );
}
