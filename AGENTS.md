# Repository Guidelines

## Project Structure & Module Organization
- `app/` — Next.js App Router pages (`page.tsx`, `layout.tsx`) and global styles (`app/globals.css`).
- `components/` — Reusable UI (PascalCase files like `InventoryGrid.tsx`).
- `hooks/` — Custom hooks (camelCase like `useGamepad.ts`).
- `lib/` — Data types and utilities (`lib/data.ts`).
- `public/` — Static assets and demo data (`public/data/demo.json`, `public/sfx/*`).
- Config: `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`.

## Build, Test, and Development Commands
- Install: `pnpm i` (or `npm i`, `yarn`).
- Dev server: `pnpm dev` → http://localhost:3000.
- Build: `pnpm build` (Next.js production build).
- Start: `pnpm start` (serve `.next` build).
- Lint (optional): `npx next lint` if you add an ESLint config.

## Coding Style & Naming Conventions
- Language: TypeScript + React 18, Next.js 14 (App Router).
- Indentation: 2 spaces; prefer no semicolons (match existing files).
- Components: Functional components; use `'use client'` only when needed.
- Files: PascalCase in `components/`, route dirs lower-case in `app/`, hooks start with `use*`.
- Imports: Prefer absolute from project root (e.g., `@/lib/data`).
- Styling: Tailwind CSS; use shared classes like `card`, `font-display`. Keep motion subtle (e.g., `whileHover={{ scale: 1.02 }}`).

## Testing Guidelines
- No test setup yet. If adding tests, use Vitest + React Testing Library.
- Place tests alongside files (`Component.test.tsx`) or under `components/__tests__/`.
- Add tests for non-trivial logic and hooks; target basic coverage for new code.

## Commit & Pull Request Guidelines
- Commits: Follow Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`). Scope by area (e.g., `feat(quests): ...`).
- PRs: Include clear description, linked issues, and UI screenshots/GIFs for visible changes.
- Keep PRs focused and small; update `README.md` routes and `CLAUDE.md` mappings if you add pages or gamepad actions.

## Security & Content
- Do not commit secrets or environment keys.
- Use original assets only; no Nintendo IP.
- Avoid server-only code unless justified; this app is controller-first UI.
