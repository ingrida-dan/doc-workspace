"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getDocument } from "@/lib/documents";
import { useDocuments } from "./DocumentsProvider";

type LoadStatus = "loading" | "ready" | "notfound" | "error";
type SaveStatus = "saved" | "unsaved" | "saving" | "error";

const SAVE_DEBOUNCE_MS = 500;

// Single-document editor. Loads the document by id from IndexedDB after mount,
// shows an editable title + body, and auto-saves debounced changes through the
// shared store so the sidebar stays in sync.
export default function DocumentEditor({ id }: { id: string }) {
  const { updateDocument } = useDocuments();

  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // Debounce machinery: the pending change and the active timer, kept in refs
  // so they survive re-renders without re-scheduling.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ title: string; body: string } | null>(null);

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
    const payload = pendingRef.current;
    if (!payload) return;
    pendingRef.current = null;
    setSaveStatus("saving");
    try {
      await updateDocument(id, payload);
      setSaveStatus("saved");
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
      if (pendingRef.current) {
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
      </div>

      {/* Body editor — plain textarea (Markdown preview comes later) */}
      <textarea
        value={body}
        onChange={(e) => onBodyChange(e.target.value)}
        placeholder="Start writing…"
        aria-label="Document body"
        className="flex-1 resize-none bg-transparent px-6 py-5 font-mono text-sm leading-6 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
      />
    </div>
  );
}
