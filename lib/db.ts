// Low-level IndexedDB connection handling: opening the database, the
// versioning/upgrade mechanism, the browser-only guard, and a small helper
// for turning IDBRequests into promises. The document CRUD API in
// `documents.ts` builds on top of this.

const DB_NAME = "doc-workspace";
const DB_VERSION = 1;
export const STORE_DOCUMENTS = "documents";

// True only in a real browser with IndexedDB available. IndexedDB does not
// exist on the Next.js server, so this gates every database access.
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

// Cached open-connection promise so repeated calls reuse one connection
// instead of reopening the database every time.
let dbPromise: Promise<IDBDatabase> | null = null;

// Apply schema changes for each version step. Written with `oldVersion` so
// future migrations slot in cleanly; v1 just creates the documents store.
function runUpgrade(db: IDBDatabase, oldVersion: number): void {
  if (oldVersion < 1) {
    db.createObjectStore(STORE_DOCUMENTS, { keyPath: "id" });
  }
  // Future versions:
  // if (oldVersion < 2) { ...add an index or backfill a field... }
}

// Open (and cache) the IndexedDB connection. Rejects with a clear, catchable
// error when called outside the browser, turning the cryptic native failure
// into one obvious message. Every CRUD call routes through here, so they all
// inherit this guard.
export function openDatabase(): Promise<IDBDatabase> {
  if (!isBrowser()) {
    return Promise.reject(
      new Error(
        "IndexedDB is unavailable — the data layer must run in the browser after mount.",
      ),
    );
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      runUpgrade(request.result, event.oldVersion);
    };

    request.onsuccess = () => {
      const db = request.result;
      // If another tab opens a newer version, close this connection so the
      // upgrade isn't blocked, and drop the cache so the next call reopens.
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };

    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error("Opening the database was blocked by another connection."));
  });

  // Don't cache a rejected attempt — let the next call retry from scratch.
  dbPromise.catch(() => {
    dbPromise = null;
  });

  return dbPromise;
}

// Resolve/reject an IDBRequest as a promise, so the CRUD functions don't each
// repeat the onsuccess/onerror wiring.
export function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
