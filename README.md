# Muhammad Nassar: portfolio

A bilingual (English and Arabic) portfolio for a junior frontend developer growing into full-stack. It is designed as a calm "mission control": projects are planets in a star system, skills are a constellation, and every visual has an accessible list view. Recruiters can switch to **Fast mode**, a plain one-page summary that also prints cleanly.

**Live site:** not deployed yet.

The full specification is in [`docs/design.md`](docs/design.md). Open items for the owner are in [`TODO.md`](TODO.md).

## Stack

Next.js (App Router, Cache Components), TypeScript (strict), Tailwind CSS v4, next-intl, Motion, zod, Resend and Telegram for the contact form, Upstash for rate limiting, Vercel Analytics, Vitest and Playwright.

## Run locally

Requirements: Node.js and pnpm.

```bash
pnpm install
cp .env.example .env.local   # optional: only the contact form needs keys
pnpm dev
```

Open http://localhost:3000. You are redirected to `/en` or `/ar` based on your browser language.

| Script | What it does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm typecheck` | Generates route types, then runs TypeScript |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | Smoke tests (Playwright) on desktop and mobile viewports. Builds and starts the site on port 3100. Run `pnpm exec playwright install chromium` once first. |
| `pnpm generate:brand` | Regenerates the favicon, apple icon and OG image (see below) |
| `pnpm capture:demos` | Recaptures project screenshots from the live demos (see below) |

## Environment variables

All are documented in [`.env.example`](.env.example). Without them the site still works; only the contact form needs them.

| Variable | Used for |
|---|---|
| `RESEND_API_KEY` | Sending contact messages by email |
| `CONTACT_TO_EMAIL` | Where those emails go (the Resend account owner's address until a domain is verified) |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Sending contact messages to Telegram |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limiting the contact form. Required in production: without them the form refuses messages. `pnpm dev` uses an in-memory limiter instead. |
| `NEXT_PUBLIC_SITE_URL` | The public origin for canonical URLs, hreflang, the sitemap and Open Graph. On Vercel it falls back to the production domain. |

## Decisions

- **A status system instead of editing components.** Every project and skill has one `status` field in `content/*.ts`. Pure helpers in `lib/status.ts` decide everything from it: which planets appear, which stars are hollow, what "Right now" says and what Fast mode lists. Finishing a project or a skill is a one-line change, and the rules are unit tested.
- **Computed constellation edges.** Two skills are connected when they share a done or in-progress project, computed in `lib/constellation.ts`. The lines can never drift out of sync with the projects.
- **SVG for drawing, HTML for interaction.** The star system and constellation are decorative SVG (`aria-hidden`). Real `<button>`s are placed over each planet and star, with accessible names, `aria-pressed` and 44px tap targets, and labels are HTML at a fixed 13px. Both maps have a list view. Planet drift runs as browser-driven transform animations, so React never renders per frame, and it stops with reduced motion. A unit test checks that no labels overlap anywhere in the drift range, in both languages, on the narrowest screen.
- **RTL from the start.** Arabic pages set `dir="rtl"`, and the layout uses only logical Tailwind utilities (`ms-`, `ps-`, `start-`, `border-s`), so it mirrors without special cases. The maps are deliberately not mirrored; only their labels follow the language. Technical terms stay in English inside Arabic text.
- **Messages stay on the server.** Server components translate and pass labels to client components as props, so no message files are sent to the browser.
- **Honest content.** All text comes from `messages/*.json` and all facts from `content/*.ts`. Missing values are marked `TODO`: links hide, text shows "Coming soon" or is hidden, and every TODO is listed in `TODO.md`.

## Brand assets

`app/favicon.ico`, `app/apple-icon.png` and `public/og.png` are generated. To regenerate them after changing the brand mark or the text on the image, run `pnpm build`, then `pnpm generate:brand`. It needs Edge or Chrome; set `BROWSER_PATH` if yours isn't found.

## Project screenshots

The Kanban and CalTrack screenshots in `public/projects/` come from their live demos. To capture them again at 1280×800, run `pnpm capture:demos` (or `pnpm capture:demos kanban` for one project). It drives Edge or Chrome headlessly and needs network access; set `BROWSER_PATH` if your browser isn't found. The Nabd Masr screenshots come from its own repo.
