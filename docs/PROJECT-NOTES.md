# FOLDFIELD: project notes

> Historical working notes, kept for the verification record. The showcase README is at the repository root.


Status: v1 complete, 27 September 2026 (D13 delivery sprint): three folding studies with configurator and brief journeys, arrival loader, checks passing. Deploy with `bun run deploy` after `bun run cloudflare:login`.

Working checkout: `experiences/02-foldfield`. Repository anchor: `.repositories/02-foldfield`. Branch: `work/experience`. Preserve both directories.

## Development

```powershell
bun install --frozen-lockfile
bun run dev
bun run check
bun run preview
```

Development: http://127.0.0.1:4512/
Preview: http://127.0.0.1:4612/

The current `dev` / `build` / `preview` scripts run the unfinished application in `src/`; `build` emits `dist/` and runs `tools/prerender.ts`. The original tooling screen remains available through `dev:smoke` / `build:smoke` in `development/`, emitting `dist-smoke/`. Its checks are separate from the application's visual acceptance.

Each project owns its dependencies and lockfile. Tailwind uses its Vite plugin; Lightning CSS performs final CSS minification. No shared visual runtime or sibling imports.

Read the existing DESIGN.md, ASSET-REGISTER.md and docs/visual/ documents alongside the collection plan. Those records and baseline captures already exist; preserve them. This worktree contains uncommitted creative/reset source. All commercial content is fictional and local-only. Do not resume this project's creative production until ODD TIDE is finished.
