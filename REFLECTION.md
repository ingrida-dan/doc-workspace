# REFLECTION.md

## Persistence decision

### What I chose
I'm storing documents in **IndexedDB**, the browser's built-in database, using the raw API with no wrapper library. Each document is its own record, keyed by ID.

### Why it fits this project
- **It matches how I'm structuring the app.** Every document gets its own URL (`/docs/abc123`), and IndexedDB lets me fetch, update, or delete one document by its ID without touching the rest. That's exactly the shape I want.
- **It has real headroom.** Document bodies can run several pages, and I'll keep accumulating documents over time. IndexedDB's capacity scales with disk space rather than a fixed ceiling, so I'm not going to hit a wall as the collection grows.
- **It fits a single-user, no-backend app.** Everything lives in my browser on my own machine — no server, no accounts, nothing to deploy. IndexedDB gives me a proper local store without any of that infrastructure.
- **It won't freeze the screen.** It works in the background, so even a large save doesn't lock up the UI the way a synchronous store could.

### Alternatives considered
- **localStorage** — the simplest option, and honestly it would have worked for a good while. But it caps out around 5MB for the whole site, it only stores plain text, and it has no way to update a single document — you reload the entire collection, change one thing, and write it all back. For an app built around per-document URLs and potentially long bodies, that's working against my own design. The simplicity was tempting, but the ceiling and the whole-pile rewrite pattern ruled it out.
- **File System Access API** (saving real `.md` files to disk) — genuinely appealing for a document app, and something I might revisit later for export. But it comes with repeated permission prompts that don't survive restarts cleanly, and uneven browser support. Too much friction for the core "reload and it's just there" experience I want in this phase.

### Sharp edges I'm watching for
- **Next.js server-rendering:** the browser's storage APIs don't exist on the server, so I have to be careful to only touch IndexedDB in client-side code after the page has loaded in the browser. Getting this wrong causes crashes and hydration warnings — apparently the most common bug in this kind of app, so it's a constraint from the start, not an afterthought.
- **Browser storage can be wiped.** Clearing browsing data or heavy disk pressure can delete everything. It's not a backup. I'm accepting that risk for now (see below) but keeping it in mind.
- **Storage is tied to the exact address.** `localhost:3000` is a different store from a different port or `127.0.0.1`. If I change the port, my documents will look like they vanished — they haven't, it's just a different drawer.
- **IndexedDB has a versioning system.** The day I change the shape of a document (say, add tags), I'll need to bump a version number and run a small upgrade step. I want that mechanism in place from v1 even if it does almost nothing, because retrofitting it later is a pain.

### Sub-decisions made
- **Raw IndexedDB, no wrapper library** — my project rules say not to add dependencies without a good reason, and for a single store of documents the raw API is manageable. I'd rather keep the dependency list empty and only reach for a small helper later if the code actually gets unwieldy.
- **Deferred export/import** — it's listed as an optional task in the project brief, and I want to focus on the core app first. I know it doubles as my safety net against browser data loss, so I'll revisit it once the basics are solid.
