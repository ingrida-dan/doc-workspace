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

## Markdown rendering decision

### What I chose
I'm using **react-markdown** to render the Markdown body in the editor's preview.

### Why it fits this project
- **Markdown is a core feature here, not an afterthought.** I don't want the central feature of the app to be its buggiest, most edge-case-prone part. A battle-tested parser gets all the fiddly rules — nested lists, mixed bold/italic, escaped characters — right for free, instead of me rediscovering them one bug at a time.
- **It's safe by default.** It builds a React element tree instead of injecting an HTML string, so there's no `dangerouslySetInnerHTML` anywhere and no injection seam. It ignores raw HTML unless I explicitly opt in, which is exactly the default I want.
- **It's the natural React fit.** The alternatives make me bridge an HTML string into React and own sanitization myself. react-markdown *is* React — less friction, fewer footguns.

### The dependency decision
My AGENTS.md says no new dependencies without a deliberate reason. This is that deliberate reason. Correct, secure Markdown rendering is genuinely hard to do by hand, and it's a core feature of the app — not a convenience I could shrug off. That combination is a conscious, defensible reason to add this specific dependency, which is precisely the bar my own rule is asking me to clear.

### Alternatives considered
- **Hand-rolling a small renderer** — keeps my dependency list at zero, which is tempting. But it's counterintuitively *less* safe: the danger isn't the tags I render, it's dangerous URL schemes (`javascript:`, `data:`) and attribute escaping, which a hand-rolled renderer omits by default unless I remember every one. And Markdown's grammar isn't regex-friendly, so a custom renderer quietly mangles the edge cases. It would only be worth it if a minimal Markdown subset were a deliberate, permanent product boundary — and it isn't.
- **marked / markdown-it** — excellent, battle-tested parsers. But they output an HTML string, which forces me back to `dangerouslySetInnerHTML` plus a separate sanitizer (DOMPurify) to be safe. That's more dependencies and a manual safety step I'd have to get right every time — strictly more risk and ceremony than react-markdown for a React app.

### Sharp edges I'm watching for
- **The security risk is low today, but latent.** For my single-user, local, own-content app, the classic XSS scenario basically doesn't exist right now. But the moment I paste Markdown from a webpage or an AI output, "my own content" stops being true. Safe-by-default costs me nothing now and would be painful to retrofit, so I'm taking it while it's free.
- **Rendered Markdown comes out as bare HTML tags.** Tailwind's reset strips them unstyled, so the preview will look like naked HTML until I style it deliberately — I need to plan for that, not be surprised by it.
- **SSR/hydration.** My content is browser-only (IndexedDB), so the preview must live in a client component. I'll keep the whole edit/preview component client-side to avoid the server rendering one thing and the client rendering another, which is what causes hydration mismatches.
