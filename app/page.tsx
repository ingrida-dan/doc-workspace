import Link from "next/link";

// Landing page — a brief intro to the app and a way into the workspace.
export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-20">
      <main className="flex w-full max-w-xl flex-col items-center gap-8 text-center">
        <h1 className="font-serif text-5xl font-semibold tracking-tight sm:text-6xl">
          Doc Workspace
        </h1>
        <p className="max-w-md text-lg leading-relaxed text-muted">
          A calm, personal space to write, organize, and search your documents
          in Markdown. Everything stays in your browser — no accounts, no setup.
        </p>
        <Link
          href="/docs"
          className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Open Workspace
        </Link>
      </main>
    </div>
  );
}
