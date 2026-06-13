# REFLECTION

## 1. The persistence consultation
I asked Claude Code to think it through — no code, just a recommendation. It recommended **raw IndexedDB**, surfacing two alternatives: `localStorage` (~5MB; updating one record rewrites the whole pile) and the File System Access API (real `.md` files, but permission prompts and patchy support). I chose IndexedDB — it fits the per-document-URL design (fetch/update/delete by id), handles long bodies, and suits a single-user, no-backend app — and went raw, no wrapper, to keep dependencies at zero.

## 2. A search → paste → cite that changed the outcome
For the theme toggle, I had the agent search the bundled Next.js docs (`node_modules/next/dist/docs/preventing-flash-before-hydration.md`); it cited the **"Themes"** section — a render-blocking `<head>` script that sets `data-theme` before paint, plus `suppressHydrationWarning`. Without it, the agent would've used an older training-data pattern that flashes the wrong theme or throws hydration errors. That citation is why the toggle has no flash.

## 3. A moment CLAUDE.md caught the agent drifting
For the Markdown preview, installing `react-markdown` was the obvious next step — but AGENTS.md's "no new dependencies without asking" rule made the agent **stop and ask me to approve it** instead of running `npm install`. It also flagged the Tailwind typography plugin as another dependency, so I used hand-written CSS instead.

## 4. The design pass
The direction: "warm editorial" — cream paper, warm near-black ink, Fraunces serif headings over Inter body, one forest/sage-green accent used sparingly, generous whitespace. I borrowed the *principles* behind high-end automotive sites — Polestar's minimalism: restraint, confident type, one accent — not the literal cinematic look, wrong for a calm writing tool. It swapped the scaffolded zinc-gray, system-font look for a warm typographic identity. It landed in stage 1; the final nudge fixed the active-document highlight — a stray blue focus box → a clean green tint with a left bar.

## 5. One thing harder than the plain-HTML static app
In the static lesson, persistence was just `localStorage` — synchronous, trivial. Here IndexedDB is **asynchronous** *and* the app is server-rendered, so all storage had to stay client-side and after-mount to avoid "indexedDB is not defined" and hydration mismatches. That SSR-plus-async-storage combination was my biggest source of subtle bugs — nothing in the plain-HTML app prepared me for it.

## 6. What I'd keep or change in docs/ next time
Keep: the two pinned Next.js references (layouts/pages, dynamic routes) paid off — this version differs from the agent's training data, so pinning real conventions kept it accurate. Change: I'd add the bundled-docs references I only found mid-build — the no-flash/theming guide and client-components guidance — up front. The signal was version-specific material; the noise, generic Next docs the agent already knows.
