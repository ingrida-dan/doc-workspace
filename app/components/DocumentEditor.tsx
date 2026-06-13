"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getDocument } from "@/lib/documents";
import { useDocuments } from "./DocumentsProvider";

type LoadStatus = "loading" | "ready" | "notfound" | "error";
type SaveStatus = "saved" | "unsaved" | "saving" | "error";
type Mode = "edit" | "preview";

const SAVE_DEBOUNCE_MS = 500;

// Single-document editor. Loads the document by id from IndexedDB after mount,
// shows an editable title + body, and auto-saves debounced changes through the
// shared store so the sidebar stays in sync.
export default function DocumentEditor({ id }: { id: string }) {
  const { updateDocument, deleteDocument } = useDocuments();
  const router = useRouter();

  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // Two-step delete confirmation, local to this editor instance.
  const [confirming, setConfirming] = useState(false);
  // Edit vs. rendered-Markdown preview for the body. View-only state; edit
  // is the default and editing only happens in edit mode.
  const [mode, setMode] = useState<Mode>("edit");

  // Debounce machinery: the pending change and the active timer, kept in refs
  // so they survive re-renders without re-scheduling.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ title: string; body: string } | null>(null);
  // Set once the document is deleted, so no pending/late auto-save can write
  // (and resurrect) it afterwards.
  const deletedRef = useRef(false);

  // Load the document once, in the browser, after mount.
  useEffect(() => {
    let active = true;
    getDocument(id)
      .then((doc) => {
        if (!active) return;
        if (!doc) {
          setLoadStatus("notfound");
          return;
        }
        setTitle(doc.title);
        setBody(doc.body);
        setLoadStatus("ready");
      })
      .catch(() => {
        if (active) setLoadStatus("error");
      });
    return () => {
      active = false;
    };
  }, [id]);

  // Persist whatever is pending, clearing the timer.
  const flush = async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    // Never write a document that's been deleted.
    if (deletedRef.current) return;
    const payload = pendingRef.current;
    if (!payload) return;
    pendingRef.current = null;
    setSaveStatus("saving");
    try {
      await updateDocument(id, payload);
      // Only claim "saved" if no new edit was queued while this save was in
      // flight. If the user typed during the await, pendingRef is set again
      // (and scheduleSave already marked it "unsaved") — the next timer will
      // persist it; don't overwrite that with a false "Saved".
      setSaveStatus(pendingRef.current === null ? "saved" : "unsaved");
    } catch {
      setSaveStatus("error");
    }
  };

  // On unmount (e.g. navigating to another doc), flush any pending change so
  // the last <500ms of edits aren't dropped. Fire-and-forget — IndexedDB
  // completes independently of this component.
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (!deletedRef.current && pendingRef.current) {
        updateDocument(id, pendingRef.current).catch(() => {});
        pendingRef.current = null;
      }
    };
  }, [id, updateDocument]);

  // Queue a debounced save from the latest field values.
  const scheduleSave = (next: { title: string; body: string }) => {
    pendingRef.current = next;
    setSaveStatus("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flush, SAVE_DEBOUNCE_MS);
  };

  const onTitleChange = (value: string) => {
    setTitle(value);
    scheduleSave({ title: value, body });
  };

  const onBodyChange = (value: string) => {
    setBody(value);
    scheduleSave({ title, body: value });
  };

  // Delete wins over any pending auto-save. Synchronously (before any await)
  // mark the doc deleted, cancel the debounce timer, and drop the pending
  // payload so neither a scheduled flush nor the unmount cleanup can re-write
  // it. Then delete and leave the now-dead URL.
  const handleConfirmDelete = async () => {
    deletedRef.current = true;
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    pendingRef.current = null;
    await deleteDocument(id);
    router.push("/docs");
  };

  if (loadStatus === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
      </div>
    );
  }

  if (loadStatus === "notfound" || loadStatus === "error") {
    const message =
      loadStatus === "notfound"
        ? "Document not found"
        : "Couldn't load this document.";
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-base font-medium">{message}</p>
        <Link
          href="/docs"
          className="text-sm text-zinc-500 underline underline-offset-4 hover:text-foreground dark:text-zinc-400"
        >
          Back to workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Editor header: title field + save indicator */}
      <div className="flex items-center gap-4 border-b border-black/[.08] px-6 py-4 dark:border-white/[.145]">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled"
          aria-label="Document title"
          className="min-w-0 flex-1 bg-transparent text-lg font-semibold tracking-tight outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
        />
        <span
          aria-live="polite"
          className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400"
        >
          {saveStatus === "saving" && "Saving…"}
          {saveStatus === "saved" && "Saved"}
          {saveStatus === "unsaved" && "Unsaved changes"}
          {saveStatus === "error" && "Save failed"}
        </span>

        {/* Delete — destructive, kept visually distinct from the edit fields */}
        {confirming ? (
          <div className="flex shrink-0 items-center gap-2 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Delete?</span>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="shrink-0 rounded-md border border-red-600/40 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-600/10 dark:text-red-400"
          >
            Delete
          </button>
        )}
      </div>

      {/* Edit / Preview toggle for the body */}
      <div className="flex shrink-0 gap-1 border-b border-black/[.08] px-6 py-2 dark:border-white/[.145]">
        {(["edit", "preview"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
              mode === m
                ? "bg-black/[.06] dark:bg-white/[.10]"
                : "text-zinc-500 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Body — raw Markdown textarea (edit) or rendered preview */}
      {mode === "edit" ? (
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Start writing…"
          aria-label="Document body"
          className="flex-1 resize-none bg-transparent px-6 py-5 font-mono text-sm leading-6 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
        />
      ) : (
        <div className="markdown-preview flex-1 overflow-y-auto px-6 py-5 text-sm leading-6">
          {/* Safe by default: no rehype-raw, so raw HTML in the body is shown
              as text, not injected. Links open in a new tab. */}
          <ReactMarkdown
            components={{
              a({ node, ...props }) {
                return (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                );
              },
            }}
          >
            {body}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
