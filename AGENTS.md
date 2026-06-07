<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project orientation

## What this app is

A personal document management app for a single user. You create, edit, delete, and search documents, each with a title and a Markdown body supporting basic formatting (headings, bold, italic, bullet lists) via toggleable edit/preview modes. It runs locally only — no backend, no authentication, no deployment in this phase — and documents persist in the browser across reloads.

## Stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**

## How to run it

```bash
npm run dev
```

Then open http://localhost:3000.

## Layout & routing

- Two-pane workspace at `/docs` — a sidebar listing documents on the left, a content area on the right.
- Responsive: side-by-side on desktop, stacked or collapsible on mobile.
- Each document has its own URL (e.g. `/docs/abc123`), so bookmarking or sharing a link opens that document directly.
- Navigating to a non-existent document URL shows a friendly "Document not found" page with a link back to the workspace.

## Persistence

**TO BE DECIDED.** The persistence mechanism has not been chosen yet — there will be a separate consultation about it before any persistence code is written. Do **not** assume `localStorage` or any other mechanism. Wait for the decision.

## Conventions

- Use the **App Router only** — never create a `pages/` directory.
- New pages go inside `app/`, following App Router conventions (a folder plus a `page.tsx`).
- Shared UI components go in `app/components/`.
- Reference docs for Next.js APIs live in `docs/` — consult them as needed.

## Rules for you (the agent)

- Do **not** add any new libraries or dependencies without asking first.
- Do **not** assume a persistence mechanism — wait for the consultation decision.
- Do **not** put secrets or API keys in source files. This project has none, but the habit matters.
- The person directing you is a **non-coder**. When proposing changes, briefly explain the design and technical decisions in plain language.
