import Link from "next/link";

// Landing page — a brief intro to the app and a way into the workspace.
export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <main className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Doc Workspace
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          A personal space to write, organize, and search your documents in
          Markdown. Everything stays in your browser — no accounts, no setup.
        </p>
        <Link
          href="/docs"
          className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:opacity-90"
        >
          Open Workspace
        </Link>
      </main>
    </div>
  );
}
