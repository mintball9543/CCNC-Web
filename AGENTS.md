<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project rules (CCNC)

- Read `README.md` (architecture, layer rules) before changing code.
- Record every addition / change / removal and future plan in `ISSUES.md` (changelog + issue IDs).
- Only publish facts, statistics and institution details from official sources; otherwise use `ContentPlaceholder` and add a `CONTENT-*` issue.
- Pages never touch the DB directly: public reads go through `src/lib/queries` ('use cache' + tags), mutations through `src/lib/actions` (requireAdmin → zod → repository → updateTag).
- Before committing run: `npm run lint && npm run typecheck && npm test && npm run build`.
