# Forge & Field — Zelda-inspired PLM UI (Phase 1)
Controller-first, video-gamey PLM workspace demo. Inspired by BotW (no Nintendo assets).

## Quickstart
```bash
pnpm i   # or npm i / yarn
pnpm dev # http://localhost:3005
```

### Routes
/ — Title • /system — System • /inventory — Items • /quests — Requests • /forge — Changes • /log — Audit

### Tech
Next.js App Router, Tailwind, Framer Motion, Zustand (reserved), Gamepad API, WebAudio SFX.

## Publishing to GitHub Pages

This repository is configured to export a static build and deploy to GitHub Pages.

What to expect:
- The Next.js config reads GITHUB_PAGES and GITHUB_REPOSITORY to set a `basePath` and `assetPrefix` so assets work from `https://<user>.github.io/<repo>`.
- The build step sets `GITHUB_PAGES=true` in CI so the static export uses the repo base path.

Quick manual steps (local):
```bash
# install
pnpm i

# build and produce static `out/` and publish locally using gh-pages (branch: gh-pages)
# Note: this publishes from your machine to the `gh-pages` branch using the `gh-pages` package
npm run gh-pages:deploy

# or just build and test locally
pnpm build
npx serve out
```

CI: A GitHub Actions workflow at `.github/workflows/gh-pages.yml` will automatically build and publish `out/` to GitHub Pages on pushes to `main`/`master`.

The CI workflow also includes a post-deploy verification step that polls the deployed Pages URL and fails the job if the site does not return HTTP 200 within the retry window.

Notes:
- If your repo default branch name isn't `main` or `master`, update the workflow triggers accordingly.
