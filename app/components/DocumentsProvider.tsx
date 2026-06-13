"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createDocument as createDocumentRecord,
  getAllDocuments,
  updateDocument as updateDocumentRecord,
} from "@/lib/documents";
import type { DocumentRecord } from "@/lib/types";

type LoadStatus = "loading" | "ready" | "error";

type DocumentChanges = Partial<Pick<DocumentRecord, "title" | "body">>;

type DocumentsContextValue = {
  documents: DocumentRecord[];
  status: LoadStatus;
  isCreating: boolean;
  createDocument: () => Promise<DocumentRecord | null>;
  updateDocument: (
    id: string,
    changes: DocumentChanges,
  ) => Promise<DocumentRecord>;
  refresh: () => Promise<void>;
};

const DocumentsContext = createContext<DocumentsContextValue | null>(null);

// Shared store for the document list. Mounted above both the sidebar and the
// content pane so they read/mutate one source of truth. All IndexedDB access
// happens after mount (in effects/handlers), never during render — the data
// layer doesn't exist on the server.
export default function DocumentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Deterministic initial state so server and client first renders match.
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [isCreating, setIsCreating] = useState(false);
  // Synchronous mirror of isCreating. `isCreating` state only disables the
  // button after a re-render, which is too late to stop a second click in the
  // same tick; this ref is checked synchronously so the second click bails.
  const isCreatingRef = useRef(false);

  // Load the list once, in the browser, after mount.
  useEffect(() => {
    let active = true;
    getAllDocuments()
      .then((docs) => {
        if (!active) return;
        setDocuments(docs);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  // Re-read the full list from storage (exposed for later sub-steps).
  const refresh = useCallback(async () => {
    try {
      const docs = await getAllDocuments();
      setDocuments(docs);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  // Create a blank document and prepend it. The new record has the newest
  // updatedAt, so prepending matches the data layer's updatedAt-desc order —
  // no refetch needed.
  const createDocument = useCallback(async () => {
    // Bail synchronously if a create is already in flight — guards against a
    // rapid double-click that fires before the disabled state re-renders.
    if (isCreatingRef.current) return null;
    isCreatingRef.current = true;
    setIsCreating(true);
    try {
      const doc = await createDocumentRecord();
      setDocuments((prev) => [doc, ...prev]);
      return doc;
    } catch {
      setStatus("error");
      return null;
    } finally {
      isCreatingRef.current = false;
      setIsCreating(false);
    }
  }, []);

  // Persist a title/body change and reflect it in the in-memory list so the
  // sidebar shows the new title. Updated in place (no re-sort) so the item
  // being edited doesn't jump to the top on every save; updatedAt-desc order
  // re-applies on the next full load.
  const updateDocument = useCallback(
    async (id: string, changes: DocumentChanges) => {
      const updated = await updateDocumentRecord(id, changes);
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));
      return updated;
    },
    [],
  );

  return (
    <DocumentsContext.Provider
      value={{
        documents,
        status,
        isCreating,
        createDocument,
        updateDocument,
        refresh,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  );
}

// Access the shared document store. Throws if used outside the provider.
export function useDocuments(): DocumentsContextValue {
  const value = useContext(DocumentsContext);
  if (!value) {
    throw new Error("useDocuments must be used within a DocumentsProvider.");
  }
  return value;
}
