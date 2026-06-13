// Public async CRUD API for documents. The UI calls only these functions;
// everything here runs against IndexedDB and so must only be invoked from
// client-side code after the component has mounted (see the guard in db.ts).

import { openDatabase, promisifyRequest, STORE_DOCUMENTS } from "./db";
import type { DocumentRecord } from "./types";

// Run a function within a transaction on the documents store and resolve once
// the transaction completes (or reject if it errors/aborts).
async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const db = await openDatabase();
  const tx = db.transaction(STORE_DOCUMENTS, mode);
  const store = tx.objectStore(STORE_DOCUMENTS);

  // Wire up completion handlers synchronously, before awaiting any request, so
  // we never miss a `complete` event that fires while we're suspended.
  const done = new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

  const result = await run(store);

  // Wait for the transaction itself to settle so writes are durable before we
  // resolve to the caller.
  await done;

  return result;
}

// Create a new blank document with a generated id and timestamps, save it,
// and return it. The UI can render an empty title as "Untitled".
export async function createDocument(): Promise<DocumentRecord> {
  const now = Date.now();
  const doc: DocumentRecord = {
    id: crypto.randomUUID(),
    title: "",
    body: "",
    createdAt: now,
    updatedAt: now,
  };

  await withStore("readwrite", (store) => promisifyRequest(store.add(doc)));
  return doc;
}

// Return one document by id, or null if no such document exists.
export async function getDocument(id: string): Promise<DocumentRecord | null> {
  const doc = await withStore("readonly", (store) =>
    promisifyRequest<DocumentRecord | undefined>(store.get(id)),
  );
  return doc ?? null;
}

// Return all documents, sorted by most recently updated first.
export async function getAllDocuments(): Promise<DocumentRecord[]> {
  const docs = await withStore("readonly", (store) =>
    promisifyRequest<DocumentRecord[]>(store.getAll()),
  );
  return docs.sort((a, b) => b.updatedAt - a.updatedAt);
}

// Update a document's title and/or body and bump its updatedAt. Throws if the
// document doesn't exist. Only title/body are mutable — id and createdAt are
// preserved.
export async function updateDocument(
  id: string,
  changes: Partial<Pick<DocumentRecord, "title" | "body">>,
): Promise<DocumentRecord> {
  return withStore("readwrite", async (store) => {
    const existing = await promisifyRequest<DocumentRecord | undefined>(
      store.get(id),
    );
    if (!existing) {
      throw new Error(`Cannot update: no document with id "${id}".`);
    }

    const updated: DocumentRecord = {
      ...existing,
      ...changes,
      updatedAt: Date.now(),
    };

    await promisifyRequest(store.put(updated));
    return updated;
  });
}

// Remove a document by id. Deleting a non-existent id is a harmless no-op.
export async function deleteDocument(id: string): Promise<void> {
  await withStore("readwrite", (store) => promisifyRequest(store.delete(id)));
}
