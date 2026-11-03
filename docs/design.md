# design.md: Muhammad Nassar Portfolio ("Mission Control")

> **Instructions for the coding agent (Claude Code / Codex / any agent).**
> Read this whole file before writing any code. It is the only spec you need. Build exactly what it says.
> Do not invent content. Every name, number, link and sentence shown on the site must come from `content/*.ts` and `messages/*.json` (sections 12 to 14). If a value is `TODO`, follow the TODO rules in section 4.4 and list it in `TODO.md`. Never fabricate projects, metrics, quotes, certificates, skills or links.
> Build in the phases defined in section 17. Follow the working agreement in section 0.

---

## 0. Working agreement (for the agent)

- **Do not upgrade dependencies or add unlisted ones.** The owner scaffolds the project first (section 2). Use the versions in `package.json`. Packages listed in section 2 are pre-approved: install each with `pnpm add <name>` (no version number) in the step that needs it. If you need anything else, ask.
- **Work in small steps.** After each step of Phase 1 (section 17): run typecheck, lint and tests, commit with a clear message, then **stop** and summarize what changed and what to check in the browser. Wait for the owner before continuing.
- **When the spec is unclear or contradicts itself, ask.** Do not guess.
- **No hard-coded user-facing text** in components. All strings come from `messages/{locale}.json`; all facts come from `content/*.ts`. Server components translate and pass labels to client components as props, so messages stay out of the browser bundle.

## 1. Goal and audience

A personal portfolio for a junior Frontend developer in Cairo who is growing into full-stack.

Two audiences, both must be served:
1. **Non-technical recruiter / HR** (10 seconds): who he is, what he does, that he is available, how to contact him. No jargon in the primary UI.
2. **Technical reviewer / hiring engineer**: stack, real code links, live demos, honest skill levels, and signs of engineering care (tests, CI, clean repo).

Concept: **space theme, monochrome.** The page is a calm "mission control". Projects are planets in a star system. Skills are a constellation. Everything is black, white and gray, with **one** accent color (teal).

Tone: calm, organized, precise, honest. The fantasy layer must never block or delay reading.

**Honesty principle:** the site shows what is finished, what is in progress and what is still being learned, clearly and without apology. This is driven by the status system in section 4.

## 2. Tech stack (fixed)

The owner runs `create-next-app` (TypeScript, Tailwind, App Router, ESLint) before handing the repo to the agent. Use those versions.

- **Next.js 15 or newer** (App Router) + **TypeScript** (strict). Note: in Next.js 15+, route `params` are async (`const { locale } = await params`).
- **Cache Components stay on** (`cacheComponents` and `partialPrefetching` in `next.config.ts`). Consequences: the root layout must export `generateStaticParams`; route segment `revalidate`, `dynamic` and `runtime` exports are not allowed; cached data uses `use cache` with `cacheLife`; `new Date()` and `Date.now()` must not run in the prerendered shell (use a client component, or `<Suspense>` with `connection()`); routes stay mounted but hidden after navigation, so transient UI (mobile menu, image dialog) must reset when hidden.
- **Tailwind CSS v4**: CSS-first config. Define tokens in `app/globals.css` with `@theme`. There is no `tailwind.config.js` unless the scaffold created one.
- **Motion** (formerly Framer Motion): package `motion`, import from `motion/react`. No Three.js, no canvas; inline SVG only.
- **next-intl** for i18n (`en`, `ar`)
- **zod** for validation
- **Resend** (email) and **Telegram Bot API** for contact delivery
- **@upstash/ratelimit** + Upstash Redis for rate limiting (required in production, see section 10)
- **Vitest** + **Testing Library** for unit tests, **Playwright** for end-to-end smoke tests
- **@vercel/analytics** for privacy-friendly page and event analytics
- Fonts via `next/font`: **Inter** (Latin), **IBM Plex Sans Arabic** (Arabic), **JetBrains Mono** (tiny labels and the Phase 2 terminal only)
- Deploy target: **Vercel**
- No database. No auth. No CMS. Content lives in files.

## 3. Project structure

```
app/
  [locale]/
    layout.tsx            # html lang/dir, fonts, Header, Footer, providers, Analytics
    page.tsx              # all sections in order (section 7)
    fast/page.tsx         # Recruiter Fast Mode (section 8)
    not-found.tsx         # 404 (section 7.9)
    [...rest]/page.tsx    # calls notFound(), so any unknown path under a locale gets the localized 404; `instant = false` because it never renders a page
  api/contact/route.ts    # POST handler (section 10)
  globals.css             # tokens via @theme
  favicon.ico             # 16 and 32px brand mark, from `pnpm generate:brand`
  icon.svg                # favicon: brand mark (section 5)
  apple-icon.png          # 180x180 brand mark, full-bleed --surface because iOS rounds the corners
  sitemap.ts
  robots.ts
proxy.ts                  # next-intl locale detection and redirect (section 11)
i18n/
  routing.ts  navigation.ts  request.ts   # next-intl config, locale read from next/root-params
components/
  Header.tsx  HeaderShell.tsx  Hero.tsx  ExplorerId.tsx  ExplorerStatus.tsx
  projects/Projects.tsx  projects/ProjectsView.tsx  projects/StarSystem.tsx  projects/ProjectCard.tsx  projects/ProjectList.tsx  projects/ScreenshotGallery.tsx
  projects/ProjectSelection.tsx   # shared selection, so Skills can point at a project
  skills/Skills.tsx  skills/SkillsView.tsx  skills/Constellation.tsx  skills/SkillCard.tsx  skills/SkillGroups.tsx
  mapPlacement.ts         # places HTML labels and buttons over both SVG maps
  RightNow.tsx  About.tsx  Contact.tsx  ContactForm.tsx  CopyButton.tsx  Footer.tsx
  FastModeButton.tsx  LangToggle.tsx  StatusPill.tsx  BackToTop.tsx  PersonJsonLd.tsx  TrackedLink.tsx
  terminal/*              # Phase 2 only
content/
  site.ts                 # non-translatable facts (links, contact)
  projects.ts             # ids, status, links, stack, orbit, images
  skills.ts               # skills, status, group, usedIn, star positions
messages/
  en.json  ar.json        # all translatable text
lib/
  status.ts               # helpers: isVisibleLink, projectsByStatus, learningSkills, etc.
  constellation.ts        # computes edges from usedIn
  orbit.ts                # computes planet x/y from orbit + angle
  contact.ts  ratelimit.ts  seo.ts
  contact-delivery.ts     # Resend and Telegram; imported only by the API route
tests/                    # Vitest unit tests
e2e/                      # Playwright smoke tests
public/
  Muhammad_Nassar_CV.pdf  # TODO owner provides
  photo.jpg               # optional, owner provides
  projects/<id>/*.png     # project screenshots: Nabd Masr from its repo, demos via `pnpm capture:demos`
  og.png                  # 1200x630, generated from design tokens: brand mark, name, role, location
README.md
TODO.md
CLAUDE.md                 # points the agent to this file
.env.example
.github/workflows/ci.yml
```

## 4. Content model: the status system (core idea)

The owner updates the site by **changing one field**, never by editing components. Every rendering rule below must be implemented as a pure helper in `lib/status.ts` and covered by unit tests.

### 4.1 Project status

`status: "done" | "in-progress" | "planned"`

| Status | Star system | ProjectCard | Right now | Fast mode | Constellation edges |
|---|---|---|---|---|---|
| `done` | normal planet (solid fill) | "What I built", Challenge/What I did if present, Live/Code buttons, screenshots if present | no | in Top projects (if featured) | yes |
| `in-progress` | planet with a **dashed 1px outline and no fill**, same size rules | "In progress" pill next to the kind tag, "What I'm building" list instead of "What I built", optional note, Live/Code buttons only if links exist | listed under **Building** | one line under "In progress" | yes |
| `planned` | **not shown** as a planet | no card | listed under **Next mission** with name + summary | not shown | no |

- `featured: true` means a larger planet (r = 9) and eligibility for Fast mode Top projects. Others are r = 6.
- **Default selected project** on load: the first project in array order with `featured: true` and `status: "done"`.
- List view order: array order, `planned` excluded.

### 4.2 Skill status

`status: "core" | "learning" | "studied"`

| Status | Constellation (if `star: true`) | SkillCard | SkillGroups |
|---|---|---|---|
| `core` | solid star | name, "Used in" list, optional note | in its normal group |
| `learning` | **hollow star** (1px `--text` stroke, `--bg` fill) | name, "Currently learning" pill, "Used in" list if any, optional note | moved automatically into the **Currently learning** group |
| `studied` | never a star | n/a | only in the **University coursework** group |

- Star size grows slightly with the number of projects in `usedIn` (only `done` and `in-progress` projects count).
- Edges: two stars are connected if they share at least one project in `usedIn` (only `done` and `in-progress` projects count). Computed in `lib/constellation.ts`, never hand-drawn.
- Skills with `star: true` and an empty effective `usedIn` are still shown, with their note instead of a project list.

### 4.3 Right now is computed

- **Building:** names of all `in-progress` projects, joined (localized list format via `Intl.ListFormat`).
- **Learning:** labels of all `learning` skills, joined the same way.
- **Next mission:** each `planned` project as "Name: summary".
- **Looking for** and **Last updated** come from `messages.rightNow`.
- A row with nothing to show is hidden. A `TODO` value shows a muted "Coming soon".

### 4.4 TODO rules

- A link whose value is `"TODO"` or `null` hides its button. `"TODO"` values are also listed in `TODO.md`.
- A text value of `"TODO"` renders the muted "Coming soon" placeholder (Right now) or is hidden (elsewhere), and is listed in `TODO.md`.
- `images: []` means no screenshot area is rendered.

## 5. Design tokens

Dark only in v1. Set `color-scheme: dark`. Define as CSS variables in `app/globals.css` and expose them through Tailwind v4 `@theme`. Clear Tailwind's default color palette so only these tokens can be used.

### Colors
| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B0B0C` | page background |
| `--surface` | `#1A1A1D` | cards, inputs |
| `--border` | `#2A2A2D` | hairlines, orbit lines, constellation lines |
| `--text` | `#F4F4F1` | headings, main text, solid stars and featured planets |
| `--text-soft` | `#C8C8C4` | body copy, non-featured planets |
| `--text-muted` | `#8A8A90` | secondary labels |
| `--accent` | `#2EC4B6` | the sun, primary buttons, links, focus ring, selected state |
| `--accent-ink` | `#032B27` | text on accent backgrounds |
| `--danger` | `#FF8A8A` | form errors only |

**Accent rule (strict):** teal appears only on (a) the sun, (b) primary buttons, (c) the availability dot, (d) selected planet/star ring, (e) link hover and focus rings, (f) small section eyebrow labels, (g) the Explorer ID status text, (h) the brand mark, (i) the active nav anchor underline, (j) the ProjectCard start border and the highlight ring on a selected card, (k) the action words in Contact, (l) the one rare dot in the background starfield, (m) the faint glow at the top of the hero, (n) the scrollbar thumb, (o) text selection (`--accent` background, `--accent-ink` text), (p) the text cursor (`caret-color`) and the focused border of form inputs, (q) the one-time pulse on a project card reached through "Used in", (r) the Copy button's check icon. Nothing else is colored. Status pills ("In progress", "Currently learning") are **not** teal: `--surface` background, 1px `--border`, `--text-soft` text. No gradients other than the starfield dots and the hero glow, no glows beyond a subtle 0.18 opacity halo on the sun and selected node and the hero glow, no neon.

### Background
- **Starfield:** the page background is `--bg` with a subtle, static starfield. Tiny dots of 1 to 1.5px, mostly `--text` at 25 to 60% opacity, with one rare `--accent` dot. Pure CSS (repeating `radial-gradient` layers with tile sizes that share no factors, so it doesn't look like a grid), no images, no JS, no animation. Cards, inputs and the header sit on their own backgrounds, so dots never sit behind small text in them.
- **Hero glow:** one faint `--accent` radial glow (14% opacity) at the top of the hero section only. It fades out before the section's edges.
- **Contrast:** at the brightest point of the glow, `--text-muted` still meets WCAG AA (about 4.6:1). Dots are smaller than a text stroke, so they don't change text contrast.

### Brand details
- **Scrollbar:** thin, `--bg` track, `--accent` thumb at about 50% opacity, full `--accent` on hover and while dragging. `::-webkit-scrollbar` styles for Chromium and Safari, `scrollbar-color` for Firefox (which has no hover state). Inner scroll containers get the same style.
- **Selection:** `--accent` background with `--accent-ink` text.
- **Text cursor:** `caret-color: var(--accent)` in inputs and textareas.

### Brand mark
An "N" whose two stems are a left square bracket "[" and a right square bracket "]", joined by a diagonal from the top-left corner to the bottom-right corner. `--accent` strokes on a `--surface` rounded square, square line caps, miter joins. The stroke is thicker at 24px and below so it stays legible at 16px. Used as `app/icon.svg`, `app/favicon.ico` (16 and 32px, for browsers that request it directly), `app/apple-icon.png`, the header mark, the Explorer ID fallback when there is no photo, and the logo on `og.png`. Component: `components/BrandMark.tsx`. `pnpm generate:brand` regenerates the favicon and the two PNGs (`scripts/generate-brand-assets.mjs`).

### Typography
- Headings: Inter 500. Body: Inter 400. Arabic: IBM Plex Sans Arabic (same weights).
- Sizes: h1 `clamp(1.75rem, 6vw, 3.5rem)`, h2 `clamp(1.375rem, 4vw, 2rem)`, h3 `1.0625rem`, body `1rem` (line-height 1.6), small `0.875rem`, label `0.75rem`. Never below 12px.
- Mono (JetBrains Mono) only for the Explorer ID labels, Captain's log labels and the Phase 2 terminal.

### Spacing, shape, motion
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96. Section vertical padding: 64px mobile, 96px desktop.
- Container: max-width 1080px, horizontal padding 16px (mobile) / 24px.
- Radius: 8px controls, 12px cards, 16px large panels, 999px pills.
- Borders: 1px `--border` (use 1px, not 0.5px, for consistent rendering on all screens). No shadows.
- Motion: calm and consistent, nothing flashy. 150 to 400ms per animation (the hero sequence about 800ms in total), ease-out, 12px of movement at most, no bounce, no parallax, each reveal runs once. Only `transform` and `opacity` animate; hover colour and border transitions are the one exception. CSS first; Motion only where exit animations or presence need it. Content is fully visible without JavaScript. **`prefers-reduced-motion` turns all of it off**: no entrance, reveals, pulses or transitions, no countdown, no drift; the final static state shows. Planet drift stays very slow.
  - **Hero entrance:** the pill, subtitle, buttons, contact link and Explorer ID card fade up in turn (90ms apart). The `h1` is visible from the first paint and only rises 12px, so it never delays LCP.
  - **Header:** hides and shows smoothly; the active-section underline is one bar that slides between links. The menu icon morphs into an X; the sheet slides and fades in, links stagger in, and it all reverses on close.
  - **Sections below the hero** fade up once as they enter the viewport. Only sections that start below the fold are hidden, and only once JavaScript runs with motion allowed. Right now rows and About log entries stagger in.
  - **Projects and Skills:** a newly selected card fades in; planets and stars scale slightly on hover and keyboard focus; the screenshot dialog fades and scales from 0.98; a card reached through "Used in" gets one short teal outline pulse.
  - **Contact:** inputs move their border to teal on focus; the Copy button shows a check icon for about 2 seconds.
  - **Back to top** fades and slides in and out.
  - **Hover:** smooth colour and border transitions on links, buttons, inputs and cards; footer link underlines grow from the start edge.
  - **Fast mode:** hover states only, no reveals.

## 6. Global layout and rules

- Mobile first. Breakpoints: 640, 768, 1024.
- Section order is fixed (section 7). Header is sticky; anchor ids: `projects`, `skills`, `right-now`, `about`, `contact`.
- Accessibility: WCAG AA contrast, visible 2px teal focus ring, skip-to-content link, semantic landmarks, full keyboard support.
- **Interactive nodes in SVG visuals:** the SVG is decorative (`aria-hidden="true"`). Interaction happens through real HTML `<button>` elements absolutely positioned over the SVG, at the same coordinates (converted to percentages of the viewBox), each with an accessible name (project or skill name) and `aria-pressed` for the selected one. Each button has an invisible hit area of at least 44x44px.
- Every visual (star system, constellation) has an equivalent **list view** and a visible "List view / Map view" toggle.
- No layout shift: reserve space for SVGs with a fixed aspect ratio.
- Performance target: Lighthouse 90+ on mobile for Performance, Accessibility, SEO, Best Practices. Server-render all text. **The LCP element (the hero `h1`) is never rendered with opacity 0**, and no text is hidden without JavaScript (protects LCP and crawlers).
- SEO: per-locale `<title>` and description, Open Graph and Twitter image (`public/og.png`), canonical URL and `hreflang` alternates (en, ar, x-default) on every page, JSON-LD `Person` on the home page, sitemap (both locales, home and Fast mode, with alternates), robots (disallows `/api/`). Helpers in `lib/seo.ts`. The origin comes from `NEXT_PUBLIC_SITE_URL`, else Vercel's production domain, else localhost.
- Analytics: `@vercel/analytics` (`<Analytics />` in the layout). Custom events: `fast_mode_open` (header button), `cv_download` (hero and Fast mode CV links), `contact_submit_success` (form), `project_select` with the project id (planet buttons and "Used in" buttons). No personal data in events.

## 7. Sections (in this exact order)

Order: **Header, Hero, Projects, Skills, Right now, About, Contact, Footer.**

### 7.1 Header (sticky)
- Start side: the 32px brand mark + name text (hidden under 480px, where it doesn't fit whole).
- Center (desktop): anchors Projects, Skills, About, Contact.
- End side: **Fast mode** button (outlined), language toggle (label from `nav.lang`: "العربية" on English pages, "English" on Arabic pages).
- Under 1024px: logo, Fast mode, lang toggle, and a menu button that opens a full-width sheet with the anchors.
- Behavior: background `--bg` at 80% with backdrop blur, 1px bottom border; hides on scroll down, shows on scroll up. Active anchor gets a teal underline.

### 7.2 Hero
Purpose: answer "who, what, available, contact" in 3 seconds. **All hero content is in the server-rendered HTML; the `h1` is visible from the first paint, and the rest fades in within about 800ms (section 5).**

Layout (mobile single column; desktop two columns with the Explorer ID on the end side):
1. Availability pill: teal dot + `hero.availability`.
2. H1: `hero.title`.
3. Subtext: `hero.subtitle` (soft color, max-width 560px).
4. Two buttons: primary teal **See my projects** (scrolls to `#projects`), secondary outlined **Download CV** (`site.cv`). Under 400px, stack them vertically. Below them, a text link `hero.ctaContact` to `#contact`.
5. **Explorer ID card** (`--surface`, 1px border, 12px radius): top row has `hero.id.label` (mono, muted) on the start side and a **status text** (mono, teal) on the end side. Below: the 52px brand mark (or `public/photo.jpg` in a 52px circle, if it exists) and a 2-column definition list: Role / Mission / Available / Based in / Military status (`hero.id.military`, `hero.id.militaryValue`).
6. Scroll hint: `hero.scroll` with a small down arrow.

**Launch countdown (small, non-blocking):**
- Lives only inside the Explorer ID status text. Server-rendered value is `hero.id.status` ("ONLINE"), so crawlers and screen readers always get the final state. The status span is `aria-hidden`; the card has a visually hidden "Status: online" for screen readers.
- On the first visit per session (`sessionStorage` key `mn_intro_seen`), after mount, the status text shows `hero.id.countdown` values (T-3, T-2, T-1) about 300ms each, then settles on "ONLINE". At the same moment, the sun in the star system does a single soft scale-in.
- Never runs on refresh within the session, with reduced motion, or on `/fast`. Nothing else on the page waits for it.

### 7.3 Projects (the star system)
Heading `projects.title`, helper line `projects.hint`.

**Star system (SVG, viewBox 340x230):**
- Center: the **sun** (teal, r = 18, label from `projects.sun`).
- Orbit rings: 1px `--border` circles for orbits 1, 2, 3, centered on the sun, with radii 42, 68 and 92, so a planet and its label still fit the viewBox at the bottom of orbit 3. Angles: 0° points east and angles run clockwise (SVG coordinates).
- Planets: every project with status `done` or `in-progress`, placed by `lib/orbit.ts` from `orbit` and `angle`. Size and outline follow section 4.1. Colors: `--text` for featured, `--text-soft` for others.
- Labels: project name as HTML at a fixed 13px (never SVG text that scales), on the side of the planet facing away from the sun, moving to above or below if it wouldn't fit beside it. A unit test checks that no two labels overlap, and that no label touches a planet or the sun, at any point in the drift range, in both languages, on the narrowest map. **Labels always stay upright**: planets only translate; never rotate an element that contains text.
- **Planet drift:** planets do not complete orbits. Each one sways about ±8° along its orbit around its fixed `angle`, slowly (36 to 60s per sway), with its own period and phase. Only on screens 1024px+ with a fine pointer. Drift runs as browser-driven transform animations through `motion/mini`, so React never renders per frame. It pauses while the pointer is over the map or any planet button has keyboard focus. On touch devices and under 1024px the map is static (easier tapping).
- Selected planet: teal 1px ring. Selection shows details **below the map** on mobile and beside it on desktop (never a tooltip), in a `ProjectCard`. At 1024px and up the map is `position: sticky`, so it stays visible while a long card scrolls.
- **List view toggle:** the same projects as stacked `ProjectCard`s. All cards stay in the server-rendered HTML; map view shows only the selected one.

**ProjectCard** (`--surface`, 12px radius, 3px teal `border-s`, small body text `0.875rem`, compact padding):
- Title + kind pill (`projects.kinds`) + status pill if `in-progress` (`projects.status.in-progress`).
- `summary` (one plain sentence).
- If present: **Challenge** and **What I did**.
- If present: `note` as a muted small line.
- Screenshots if `images` is not empty: up to 3 thumbnails via `next/image` (AVIF/WebP, lazy, fixed aspect ratio 16:10, 8px radius, cropped from the top so tall full-page captures show their header). Grayscale by default; full color when the card's project is selected or on hover. Click opens the image full size in a simple accessible dialog (Esc closes, focus returns).
- `done`: "What I built" bullets (`built`). `in-progress`: "What I'm building" bullets (`building`).
- Stack chips (pills, `--bg` background, `--text-soft`).
- Buttons: **Live demo** (primary) and **Code** (outlined), following section 4.4. For `in-progress` projects the Code button label is `common.follow`.

### 7.4 Skills (the constellation)
Heading `skills.title`, helper `skills.hint`.

- SVG constellation (viewBox 340x260) of all skills with `star: true`. Positions are fixed `x`/`y` values in `content/skills.ts`; the agent chooses balanced positions once and stores them there (no runtime layout, no layout shift).
- Star appearance and edges follow section 4.2. Lines: 1px `--border`. Selected star: teal ring. The first star in `content/skills.ts` is selected on load.
- Labels: each star's `label` as HTML at a fixed 13px, placed like planet labels (section 7.3), facing away from the constellation's center (170, 130). A unit test checks that no label overlaps another label or star and that none leaves the map, on the narrowest map.
- Interaction through overlaid HTML buttons (section 6).
- **SkillCard** below/beside: skill name, "Currently learning" pill if `learning`, **"Used in"** (project names, each a button), and the optional note. In map view, the button selects that project in the star system and scrolls to `#projects`. In list view, it stays in list view, scrolls to that project's card and highlights it with a 1px teal outline; it never switches to the map. Either way, keyboard focus moves to the project's card. Switching the Projects view clears the highlight.
- At 1024px and up the constellation is `position: sticky`, like the star system.
- **No skill levels, no percentages, no progress bars.** Evidence and honest status only.
- Below the constellation: **SkillGroups**, a plain scannable list of all skills grouped by `group`, in this order: Frontend, Backend and APIs, Testing/tools/OS, Design and UI, **Currently learning** (all `learning` skills, regardless of group), **University coursework** (all `studied` skills). Chips, no colors. This is for HR and ATS scanning.
- List view toggle shows only SkillGroups.

### 7.5 Right now
One compact card, rows computed as in section 4.3: **Building**, **Learning**, **Next mission**, **Looking for**, plus a muted "Last updated" line.

### 7.6 About
1. **Captain's log:** paragraphs from `about.log`, each with a small mono label. No timeline graphic.
2. **How I work:** statements from `about.crew`.
3. **Education and certifications:** two compact lists (`about.education`, `about.certs`).
4. **Languages:** `about.languages`.

### 7.7 Contact
Heading `contact.title`, intro `contact.intro`. At 1024px and up, the one-tap actions (start side, about 40%) and the message form (end side, about 60%) sit side by side, aligned at the top. Below 1024px they stack, actions first.

1. **One-tap actions** (rows with icon, label and a teal action word): **Email** (copy to clipboard with "Copied" feedback), **LinkedIn** (opens), **WhatsApp** (opens `site.whatsapp`), **GitHub** (opens). Do not print the raw phone number as visible text.
2. **Message form** (`contact.form`): fields Name, "Email or WhatsApp number", Message (3 rows). Use a real `<form onSubmit>` with `preventDefault`, labels linked to inputs, inline validation messages under each field, and a status line with `aria-live="polite"`. Never `alert()`. States: idle, sending (button disabled, `form.sending`), success (`form.success`), error (`form.errSend` + the email + a copy button; on a `429` response, the error state shows `form.errRate` instead).
3. Honeypot hidden field named `website` (section 10).

There is no Quick answers block: availability, location and military status are in the Explorer ID card, and languages are in About.

### 7.8 Footer
- Start: `© {year} Muhammad Nassar`. The year is computed in the browser, outside the prerendered shell (section 2).
- End: social links (GitHub, LinkedIn, Figma, X), labelled with `site.linkLabels`.
- No "built with" line and no GitHub activity line.
- Phase 2 only: `footer.hint` on desktop fine-pointer devices.

**Back to top** (`components/BackToTop.tsx`, on every page): a floating, icon-only button (an up arrow) fixed at the bottom end corner (right in English, left in Arabic), kept clear of the device safe area. It appears after scrolling down about one viewport height and hides near the top, with a short fade (no fade with reduced motion). `common.backToTop` is its accessible name; 44px tap target; the site's focus ring. It scrolls to the top smoothly (instantly with reduced motion), then moves focus to the main content. While hidden it is out of the tab order. The footer has extra bottom padding so the end of the page can scroll clear of it, and it never covers the contact form's send button, which sits on the start side.

### 7.9 404 page
Simple centered panel: `notFound.title`, `notFound.text`, and a primary button `notFound.back` to `/{locale}`. A single small static planet drawing is allowed. Unknown paths return a real `404` with `noindex`; paths without a locale are first redirected to one. A path with a file extension (for example `/missing.txt`) skips the proxy and gets Next.js's default 404, because there is no root layout to render the localized page.

## 8. Recruiter Fast Mode

Route: `/{locale}/fast`. Entry points: the **Fast mode** header button and a shareable direct link.

The same site, just calmer: the same 1080px container, tokens, type scale, spacing, static starfield and hero glow. No maps, no SVG visuals, no entrance or scroll motion (hover states only).

Content, top to bottom:
1. **Top block**, mirroring the hero (two columns at 1024px+, stacked below): on the start side `fast.title` (small, muted), the name as `h1` (never larger than the hero title), the role, and two buttons: **Download CV** and **Contact** (anchors to the contact card). On the end side, a facts card like the Explorer ID: Based in, Available and Military status (`hero.id.*` labels and values).
2. **Top projects:** up to 3 projects with `featured: true` and `status: "done"`, in array order, as compact `ProjectCard`s (name, pills, summary, stack, Live and Code links; no details or screenshots). 3 columns at 1024px+, 1 column below.
3. **In progress:** a card with one line per `in-progress` project (name + summary + link if any).
4. **Skills:** a card with the grouped list (`SkillGroups`, compact).
5. **Experience and education** (`fast.experienceItems`) and **Contact** (Email, LinkedIn, WhatsApp, GitHub): one card each, side by side at 1024px+.
6. Link `fast.full`.

Every block uses the site's card style (`--surface`, 1px border, 12px radius).

Rules: print-friendly (`@media print`: white background with no starfield or glow, black text, no buttons, no header or footer). On this page the header's Fast mode button becomes the `fast.back` link. Same content files, no separate copy.

## 9. States and responsive behavior

- A section with no data shows nothing (never an empty frame), except Right now `TODO` values (section 4.3).
- Loading states exist only for the GitHub footer line and the contact submit.
- Under 400px: stack the two hero buttons.
- Desktop 1024+: Projects map start side (60%), ProjectCard end side (40%). Same for Skills. Contact: actions start side (40%), form end side (60%). Everything else single column.

## 10. Contact backend (`app/api/contact/route.ts`)

`POST /api/contact`, JSON body:
```ts
{ name: string; contact: string; message: string; website?: string; locale: "en" | "ar" }
```

Validation (zod schema in `lib/contact.ts`, shared with the client form): `name` 2 to 80 chars; `contact` 5 to 120 chars (email or phone, no strict format); all fields are trimmed and stripped of control characters before the length check (`message` keeps line breaks and tabs); `message` 10 to 1000 chars; `website` must be empty.

Anti-spam:
1. **Honeypot:** if `website` is non-empty, return `200 { ok: true }` and do nothing.
2. **Rate limit:** 3 requests per 10 minutes per IP via `@upstash/ratelimit`. **Required in production:** if the Upstash env vars are missing when `NODE_ENV` is `production` (including a local `next start`), the route logs an error and returns `503` without sending anything. In local development only, if the Upstash env vars are missing, fall back to an in-memory limiter and log a warning (it does not work across serverless instances, so it is never the production solution). On limit: `429`.
3. Reject bodies over 5 KB with `413`.

Order of checks: body size (`413`), JSON parse (`400`), honeypot (`200`, nothing sent), rate limit (`429`, or `503` when unavailable), schema (`400`), then delivery.

Delivery (both channels in parallel with `Promise.allSettled`):
- **Email via Resend** to `CONTACT_TO_EMAIL`, from `Portfolio <onboarding@resend.dev>` until a domain is verified. Note: the `onboarding@resend.dev` sender only delivers to the email address that owns the Resend account, so `CONTACT_TO_EMAIL` must be that address until a custom domain is verified. Subject `New message from {name}`, plain text body (name, contact, message, locale, ISO timestamp). No HTML.
- **Telegram:** `POST https://api.telegram.org/bot{TOKEN}/sendMessage` to `TELEGRAM_CHAT_ID`, plain text (no `parse_mode`): `New portfolio message\nName: ...\nContact: ...\nMessage: ...`.

Result:
- At least one channel succeeded: `200 { ok: true }`.
- Both failed: `502 { ok: false }` (the UI shows the email fallback).
- Never return provider errors or secrets to the client. Log errors server-side only.

Environment variables (document in `.env.example`, never commit real values; `.gitignore` needs `!.env.example`):
```
RESEND_API_KEY=
CONTACT_TO_EMAIL=n3ssar.swe@gmail.com
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_SITE_URL=
```

## 11. i18n and RTL

- Locales `en`, `ar`. Routes `/en` and `/ar`. Root `/` redirects using next-intl's locale detection in `proxy.ts`: it picks from the whole `Accept-Language` list, remembers the last locale in the `NEXT_LOCALE` session cookie, and falls back to English. The language toggle preserves the current hash.
- `<html lang dir>`: `dir="rtl"` for Arabic.
- **Tailwind logical utilities only:** `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`, `border-s`, `border-e`, `rounded-s`, `rounded-e`. Never `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`.
- Mirror directional icons (arrows, chevrons) in RTL.
- The star system and constellation SVGs are **not mirrored**; only their text labels and cards follow the direction.
- Technical terms stay in English inside Arabic text; wrap them in `<bdi>` where needed. Western digits (0-9) in both languages.
- Arabic body line-height 1.8. Arabic pages use IBM Plex Sans Arabic first, with Inter for Latin text.

## 12. Non-translatable data (`content/*.ts`)

```ts
// content/site.ts
export const site = {
  name: "Muhammad Nassar",
  email: "n3ssar.swe@gmail.com",
  whatsapp: "https://wa.me/201067376362",
  links: {
    github: "https://github.com/N3ssar",
    linkedin: "https://www.linkedin.com/in/muhammad-ahmad-nassar/",
    figma: "https://www.figma.com/@nassar1",
    x: "https://x.com/MuhmdANassar",
  },
  // Brand names for the footer links. Not translated.
  linkLabels: { github: "GitHub", linkedin: "LinkedIn", figma: "Figma", x: "X" },
  cv: "/Muhammad_Nassar_CV.pdf",
  github_user: "N3ssar",
} as const;
```

```ts
// content/projects.ts
export type ProjectStatus = "done" | "in-progress" | "planned";
export type ProjectKind = "fullstack" | "frontend" | "backend";
export type Link = string | null | "TODO";

export type Project = {
  id: string;
  status: ProjectStatus;
  kind: ProjectKind;
  featured: boolean;
  orbit?: 1 | 2 | 3;   // required unless status is "planned"
  angle?: number;      // degrees, required unless status is "planned"
  stack: string[];
  links: { live: Link; repo: Link };
  images: string[];    // paths under /public; [] = no screenshots
};

// Array order = display order (list view, Fast mode).
export const projects: Project[] = [
  { id: "nabd-masr", status: "done", kind: "frontend", featured: true, orbit: 1, angle: 40,
    stack: ["React", "TypeScript", "Material UI", "Vite"],
    links: { live: null, repo: "https://github.com/N3ssar/nabd-masr" },
    images: [
      "/projects/nabd-masr/landing-page.png",
      "/projects/nabd-masr/search-results.png",
      "/projects/nabd-masr/loading-state.png",
    ] },

  { id: "around-the-world", status: "done", kind: "frontend", featured: true, orbit: 2, angle: 150,
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "React Router"],
    links: { live: null, repo: "TODO" }, // live hidden until the app is fixed: https://around-the-w0rld.vercel.app/
    images: [] },

  { id: "notenest", status: "done", kind: "backend", featured: true, orbit: 2, angle: 285,
    stack: ["Node.js", "Express.js", "MongoDB", "Mongoose", "Postman"],
    links: { live: null, repo: "https://github.com/N3ssar/NoteNest" },
    images: [] },

  { id: "forsa", status: "in-progress", kind: "fullstack", featured: true, orbit: 1, angle: 225,
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS"], // TODO owner: add the database and auth library once chosen
    links: { live: null, repo: "https://github.com/N3ssar/forsa" }, // live demo hidden on purpose until applying/admin work
    images: [] },

  { id: "kanban", status: "done", kind: "frontend", featured: false, orbit: 3, angle: 90,
    stack: ["React", "Redux Toolkit", "Tailwind CSS"],
    links: { live: "https://flowban-app.netlify.app/", repo: "TODO" },
    images: ["/projects/kanban/board.png", "/projects/kanban/task-details.png"] },

  { id: "caltrack", status: "done", kind: "frontend", featured: false, orbit: 3, angle: 210,
    stack: ["React", "TypeScript", "React Router", "CSS Modules"],
    links: { live: "https://clatrack.netlify.app/", repo: "TODO" },
    images: ["/projects/caltrack/tracker.png", "/projects/caltrack/form-validation.png"] },

  { id: "portfolio", status: "done", kind: "fullstack", featured: false, orbit: 3, angle: 355,
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "next-intl", "Resend"],
    links: { live: null, repo: "TODO" }, // live is null: the visitor is already on it
    images: [] },

  { id: "wasla", status: "planned", kind: "fullstack", featured: false,
    stack: ["MongoDB", "Express.js", "React", "Node.js"],
    links: { live: null, repo: null },
    images: [] },
];
```

```ts
// content/skills.ts
export type SkillStatus = "core" | "learning" | "studied";
export type SkillGroup = "frontend" | "backend" | "tools" | "design" | "university";

export type Skill = {
  id: string;
  label: string;             // technical name, not translated
  group: SkillGroup;
  status: SkillStatus;
  star?: boolean;            // shown in the constellation
  x?: number; y?: number;    // fixed star position in viewBox 340x260 (agent fills once)
  usedIn?: string[];         // project ids
  note?: string;             // key in messages.skills.notes
};

export const skills: Skill[] = [
  // Frontend
  { id: "react", label: "React", group: "frontend", status: "core", star: true,
    usedIn: ["nabd-masr", "around-the-world", "kanban", "caltrack", "forsa"] },
  { id: "typescript", label: "TypeScript", group: "frontend", status: "core", star: true,
    usedIn: ["nabd-masr", "around-the-world", "caltrack", "forsa", "portfolio"] },
  { id: "javascript", label: "JavaScript (ES6+)", group: "frontend", status: "core" },
  { id: "router", label: "React Router", group: "frontend", status: "core", star: true,
    usedIn: ["around-the-world", "caltrack"] },
  { id: "html", label: "HTML5", group: "frontend", status: "core" },
  { id: "css", label: "CSS3", group: "frontend", status: "core" },
  { id: "tailwind", label: "Tailwind CSS", group: "frontend", status: "core", star: true,
    usedIn: ["around-the-world", "kanban", "forsa", "portfolio"] },
  { id: "mui", label: "Material UI", group: "frontend", status: "core", star: true,
    usedIn: ["nabd-masr"] },
  { id: "cssmodules", label: "CSS Modules", group: "frontend", status: "core",
    usedIn: ["caltrack"] },
  { id: "nextjs", label: "Next.js", group: "frontend", status: "learning", star: true,
    usedIn: ["forsa", "portfolio"], note: "nextNote" },
  { id: "redux", label: "Redux Toolkit", group: "frontend", status: "learning", star: true,
    usedIn: ["kanban"] },

  // Backend and APIs
  { id: "rest", label: "REST APIs", group: "backend", status: "core", star: true,
    usedIn: ["nabd-masr", "around-the-world", "notenest"] },
  { id: "node", label: "Node.js and Express", group: "backend", status: "learning", star: true,
    usedIn: ["notenest"] },
  { id: "mongo", label: "MongoDB and Mongoose", group: "backend", status: "learning", star: true,
    usedIn: ["notenest"] },

  // Testing, tools and OS
  { id: "vitest", label: "Vitest", group: "tools", status: "core", star: true, note: "vitestNote" },
  { id: "postman", label: "Postman", group: "tools", status: "core", usedIn: ["notenest"] },
  { id: "git", label: "Git", group: "tools", status: "core" },
  { id: "github", label: "GitHub", group: "tools", status: "core" },
  { id: "vite", label: "Vite", group: "tools", status: "core", usedIn: ["nabd-masr", "around-the-world"] },
  { id: "netlify", label: "Netlify", group: "tools", status: "core" },
  { id: "vercel", label: "Vercel", group: "tools", status: "core" },
  { id: "linux", label: "Linux (Fedora)", group: "tools", status: "core" },
  { id: "cli", label: "Command line", group: "tools", status: "core" },

  // Design and UI
  { id: "figma", label: "Figma", group: "design", status: "core", star: true, note: "figmaNote" },
  { id: "responsive", label: "Responsive design", group: "design", status: "core" },
  { id: "a11y", label: "Web accessibility", group: "design", status: "core" },
  { id: "theming", label: "Light/dark theming", group: "design", status: "core" },

  // University coursework (owner may delete any of these, see TODO.md)
  { id: "python", label: "Python", group: "university", status: "studied" },
  { id: "cpp", label: "C++", group: "university", status: "studied" },
  { id: "csharp", label: "C#", group: "university", status: "studied" },
  { id: "sqlserver", label: "SQL Server", group: "university", status: "studied" },
  { id: "oop", label: "OOP", group: "university", status: "studied" },
  { id: "dsa", label: "Data structures and algorithms", group: "university", status: "studied" },
];
```

## 13. Content: English (`messages/en.json`)

Copy as is. Strings marked `TODO` are for the owner.

```json
{
  "nav": {
    "projects": "Projects",
    "skills": "Skills",
    "about": "About",
    "contact": "Contact",
    "fast": "Fast mode",
    "lang": "العربية",
    "menu": "Menu"
  },
  "common": {
    "live": "Live demo",
    "code": "Code",
    "follow": "Follow progress",
    "listView": "List view",
    "mapView": "Map view",
    "backToTop": "Back to launch pad",
    "copy": "Copy",
    "copied": "Copied",
    "close": "Close",
    "skipToContent": "Skip to content"
  },
  "hero": {
    "availability": "Available for immediate start",
    "title": "Hi, I'm Muhammad. I build web apps people actually use.",
    "subtitle": "Frontend developer in Cairo. I work with React and TypeScript, and I'm now building full-stack apps with Next.js and Node.js.",
    "ctaProjects": "See my projects",
    "ctaCv": "Download CV",
    "ctaContact": "Contact me",
    "id": {
      "label": "EXPLORER ID",
      "status": "ONLINE",
      "statusSr": "Status: online",
      "countdown": [
        "T-3",
        "T-2",
        "T-1"
      ],
      "role": "Role",
      "roleValue": "Frontend Developer",
      "mission": "Mission",
      "missionValue": "Build clean, reliable web products",
      "available": "Available",
      "availableValue": "Immediately",
      "based": "Based in",
      "basedValue": "Cairo, Egypt",
      "military": "Military status",
      "militaryValue": "Exempted"
    },
    "scroll": "Scroll to start the journey"
  },
  "projects": {
    "title": "My universe of projects",
    "hint": "Each planet is a project. Tap one to see what it does.",
    "sun": "Me",
    "kinds": {
      "fullstack": "Full-stack",
      "frontend": "Frontend",
      "backend": "Backend"
    },
    "status": {
      "done": "Done",
      "in-progress": "In progress",
      "planned": "Planned"
    },
    "labels": {
      "challenge": "Challenge",
      "did": "What I did",
      "built": "What I built",
      "building": "What I'm building",
      "screenshots": "Screenshots"
    },
    "items": {
      "nabd-masr": {
        "name": "Nabd Masr",
        "summary": "An Arabic news app that shows live Egyptian news by category.",
        "challenge": "The news API often failed or returned empty results for Arabic categories.",
        "did": "I designed a \"Smart Query\" with boolean search logic on a broader search endpoint, so each Arabic category returns accurate results instead of errors.",
        "note": "The live demo is offline: the news API's free plan only accepts requests from localhost, and my attempts to proxy it in production didn't work. The code and screenshots are on GitHub.",
        "built": [
          "Responsive Arabic news feed for Egypt using NewsAPI, with category filtering, search and pagination.",
          "A \"Smart Query\" strategy with boolean search logic that removed recurring HTTP 500 errors and empty results.",
          "Skeleton loading states, a 500ms search debounce, fallback images, and clear error screens for network failures and API rate limits."
        ]
      },
      "around-the-world": {
        "name": "Around The World",
        "summary": "An explorer for 250+ countries, with details for each country and its neighbors.",
        "challenge": "Clicking a neighboring country sometimes opened the wrong one.",
        "did": "I switched from matching by name to unique country codes (cca3), and refactored state handling to remove loading flicker.",
        "built": [
          "Responsive explorer for 250+ countries using the REST Countries API, with strict TypeScript types for nested API data.",
          "API responses cached in Local Storage to avoid repeated network requests for returning users."
        ]
      },
      "notenest": {
        "name": "NoteNest",
        "summary": "A notes API: create, read, update and delete notes, saved in a database.",
        "built": [
          "RESTful API with Node.js and Express.js providing full CRUD operations, with data stored in MongoDB through Mongoose models.",
          "Custom middleware and centralized error handling for consistent error responses, tested with Postman."
        ]
      },
      "forsa": {
        "name": "Forsa",
        "summary": "A job board web app built with Next.js, where candidates browse jobs and apply.",
        "note": "I'm learning Next.js by building this project, so it changes often.",
        "building": [
          "Job listings and job detail pages (done).",
          "Applying to jobs, an admin dashboard to manage postings, and sign-in with role-based access, backed by a database.",
          "Later: an AI feature that estimates how well a candidate fits each job."
        ]
      },
      "kanban": {
        "name": "Kanban Board",
        "summary": "A task board where you add, edit and move tasks between columns, with light and dark themes.",
        "built": [
          "Responsive, accessible task board built from a Frontend Mentor design, with task state managed in Redux Toolkit.",
          "Pre-filled edit forms, status selection to move tasks, and a light/dark theme driven by CSS variables."
        ]
      },
      "caltrack": {
        "name": "CalTrack",
        "summary": "A calorie tracker with a form that reacts to your input in real time.",
        "built": [
          "Multi-condition form state and real-time input handled with useReducer and strict TypeScript types.",
          "Client-side routing with React Router and component-scoped CSS Modules to prevent style conflicts."
        ]
      },
      "portfolio": {
        "name": "This portfolio",
        "summary": "The site you're on: bilingual (English and Arabic), accessible, with a contact form that reaches me by email and Telegram.",
        "built": [
          "Next.js App Router with full English and Arabic support, including right-to-left layout.",
          "Interactive SVG star system and skill constellation, each with an accessible list view.",
          "Contact API route with validation, rate limiting and spam protection, tested with Vitest and Playwright."
        ]
      },
      "wasla": {
        "name": "Wasla",
        "summary": "A chat app built with the MERN stack (MongoDB, Express, React, Node.js)."
      }
    }
  },
  "skills": {
    "title": "Skills",
    "hint": "Each star is a skill. Lines connect skills I used together in the same project. Hollow stars are skills I'm still learning. Tap a star.",
    "usedIn": "Used in",
    "learning": "Currently learning",
    "notes": {
      "nextNote": "I'm learning Next.js now and applying it directly in Forsa and in this portfolio.",
      "vitestNote": "Learned in the React with TypeScript track, where I wrote many tests.",
      "figmaNote": "I read and implement Figma designs as a developer. UI/UX scholarship at Nile University."
    },
    "groups": {
      "frontend": "Frontend",
      "backend": "Backend and APIs",
      "tools": "Testing, tools and OS",
      "design": "Design and UI",
      "learning": "Currently learning",
      "university": "University coursework"
    }
  },
  "rightNow": {
    "title": "Right now",
    "building": "Building",
    "learning": "Learning",
    "next": "Next mission",
    "looking": {
      "label": "Looking for",
      "value": "A junior Frontend or Full-Stack role"
    },
    "updated": "TODO",
    "updatedLabel": "Last updated",
    "comingSoon": "Coming soon"
  },
  "about": {
    "title": "About",
    "log": [
      {
        "label": "LOG 01",
        "text": "I studied Information Systems at Port Said University (2021 to 2025). My graduation project was HomeTech, a platform for household services such as plumbing, electrical work, carpentry and maintenance. I worked on the frontend, in vanilla JavaScript."
      },
      {
        "label": "LOG 02",
        "text": "I focused on modern frontend: JavaScript, React and React with TypeScript, including testing with Vitest. I built several React apps, three of them live. Now I'm learning the backend with Node.js, Express and MongoDB, and building full-stack apps with Next.js."
      },
      {
        "label": "LOG 03",
        "text": "I worked as a sales representative at compuMe (12/2025 to 04/2026), explaining laptop specs in plain language. That experience shapes how I write interfaces and explain technical decisions. In 2026 I joined a UI/UX scholarship at Nile University to strengthen the Figma-to-code workflow."
      }
    ],
    "crewTitle": "How I work",
    "crew": [
      "I turn Figma designs into clean, maintainable code.",
      "I explain technical choices in plain language.",
      "Management at compuMe recognized my professionalism, reliability and commitment to teamwork and customer service."
    ],
    "educationTitle": "Education",
    "education": [
      "Bachelor's degree in Information Systems, Port Said University (09/2021 to 07/2025)",
      "Relevant coursework: Data Structures, Databases, Web Development, Networking Fundamentals, Data Mining, Information Retrieval",
      "UI/UX Scholarship, Nile University, online (2026): user-centered design and the Figma-to-frontend workflow"
    ],
    "certsTitle": "Certifications",
    "certs": [
      "Data Structures Decode, Cloud Native Base Camp (08/2026)",
      "Node.js From Scratch, Cloud Native Base Camp (07/2026)",
      "React with TypeScript (including testing with Vitest)",
      "React.js Track",
      "JavaScript Track (03/2025)",
      "Interactive Web Design Track (10/2024)",
      "Programming Fundamentals Track (07/2024)"
    ],
    "languagesTitle": "Languages",
    "languages": [
      "Arabic: native",
      "English: professional working proficiency"
    ]
  },
  "contact": {
    "title": "Let's talk",
    "intro": "Have a role in mind or a question? Reach me whichever way is easiest for you.",
    "actions": {
      "email": "Email",
      "linkedin": "LinkedIn",
      "whatsapp": "WhatsApp",
      "github": "GitHub",
      "open": "Open",
      "copyEmail": "Copy"
    },
    "form": {
      "title": "Or leave me a message",
      "name": "Your name",
      "contact": "Email or WhatsApp number (so I can reply)",
      "message": "Your message",
      "namePh": "Sara from Acme",
      "contactPh": "sara@acme.com",
      "messagePh": "We'd love to chat about a junior role",
      "send": "Send message",
      "sending": "Sending...",
      "success": "Message received. I'll reply soon.",
      "errName": "Enter your name first",
      "errContact": "Add an email or number so I can reply",
      "errMessage": "Write a short message first (at least 10 characters)",
      "errSend": "Couldn't send. Please email me directly at",
      "errRate": "Too many messages. Please try again in a few minutes."
    }
  },
  "fast": {
    "title": "Quick summary",
    "topProjects": "Top projects",
    "inProgress": "In progress",
    "skills": "Skills",
    "experience": "Experience and education",
    "experienceItems": [
      "Sales Representative, compuMe, Cairo (12/2025 to 04/2026)",
      "B.Sc. Information Systems, Port Said University (2025)",
      "UI/UX Scholarship, Nile University (2026)"
    ],
    "contact": "Contact",
    "full": "See the full interactive portfolio",
    "back": "Back to full site"
  },
  "footer": {
    "hint": "Press Ctrl/Cmd + K"
  },
  "notFound": {
    "title": "Lost in space",
    "text": "This page doesn't exist.",
    "back": "Back to launch pad"
  },
  "meta": {
    "title": "Muhammad Nassar | Frontend Developer",
    "description": "Frontend developer in Cairo. React and TypeScript, now building full-stack apps with Next.js and Node.js. Available for immediate start."
  }
}
```

## 14. Content: Arabic (`messages/ar.json`)

Same keys as section 13. Technical terms stay in English. **The owner reviews the Arabic before launch.**

```json
{
  "nav": {
    "projects": "المشاريع",
    "skills": "المهارات",
    "about": "نبذة عني",
    "contact": "تواصل معي",
    "fast": "ملخص سريع",
    "lang": "English",
    "menu": "القائمة"
  },
  "common": {
    "live": "جرّب التطبيق",
    "code": "الكود",
    "follow": "تابع التطوير",
    "listView": "عرض كقائمة",
    "mapView": "عرض كخريطة",
    "backToTop": "العودة للأعلى",
    "copy": "نسخ",
    "copied": "تم النسخ",
    "close": "إغلاق",
    "skipToContent": "انتقل إلى المحتوى"
  },
  "hero": {
    "availability": "متاح للعمل فوراً",
    "title": "أهلاً، أنا محمد. أبني تطبيقات ويب يستخدمها الناس فعلاً.",
    "subtitle": "مطوّر Frontend من القاهرة، أعمل بـ React وTypeScript، وأبني حالياً تطبيقات Full-Stack باستخدام Next.js وNode.js.",
    "ctaProjects": "شاهد مشاريعي",
    "ctaCv": "حمّل السيرة الذاتية",
    "ctaContact": "تواصل معي",
    "id": {
      "label": "EXPLORER ID",
      "status": "ONLINE",
      "statusSr": "الحالة: متصل",
      "countdown": [
        "T-3",
        "T-2",
        "T-1"
      ],
      "role": "المسمّى",
      "roleValue": "مطوّر Frontend",
      "mission": "هدفي",
      "missionValue": "منتجات ويب متقنة يُعتمد عليها",
      "available": "متاح",
      "availableValue": "فوراً",
      "based": "مقيم في",
      "basedValue": "القاهرة، مصر",
      "military": "الخدمة العسكرية",
      "militaryValue": "معفى"
    },
    "scroll": "انزل لتتعرف على أعمالي"
  },
  "projects": {
    "title": "مشاريعي",
    "hint": "كل كوكب هنا مشروع. اضغط على أي كوكب لتعرف تفاصيله.",
    "sun": "أنا",
    "kinds": {
      "fullstack": "Full-stack",
      "frontend": "Frontend",
      "backend": "Backend"
    },
    "status": {
      "done": "مكتمل",
      "in-progress": "قيد التطوير",
      "planned": "قادم"
    },
    "labels": {
      "challenge": "التحدي",
      "did": "كيف حللته",
      "built": "ما أنجزته",
      "building": "ما أعمل عليه",
      "screenshots": "صور من التطبيق"
    },
    "items": {
      "nabd-masr": {
        "name": "نبض مصر",
        "summary": "تطبيق أخبار بالعربية يعرض آخر أخبار مصر مرتبة حسب التصنيف.",
        "challenge": "كان الـ API يفشل كثيراً أو يرجع نتائج فارغة مع التصنيفات العربية.",
        "did": "صممت \"Smart Query\" يعتمد على البحث المنطقي (boolean) عبر endpoint أوسع، فأصبحت كل التصنيفات العربية ترجع نتائج دقيقة بدلاً من الأخطاء.",
        "note": "العرض المباشر متوقف: الخطة المجانية للـ API لا تقبل إلا الطلبات من localhost، ولم تنجح محاولاتي لتمريرها عبر proxy على الإنتاج. الكود والصور متاحة على GitHub.",
        "built": [
          "تطبيق أخبار متجاوب يعتمد على NewsAPI، مع فلترة حسب التصنيف وبحث وتقسيم للصفحات.",
          "استراتيجية \"Smart Query\" بالبحث المنطقي (boolean) أنهت أخطاء HTTP 500 المتكررة والنتائج الفارغة.",
          "شاشات تحميل Skeleton، وdebounce للبحث بمدة 500ms، وصور بديلة عند فشل التحميل، ورسائل خطأ واضحة عند انقطاع الشبكة أو تجاوز حدود الـ API."
        ]
      },
      "around-the-world": {
        "name": "Around The World",
        "summary": "مستكشف لأكثر من 250 دولة، يعرض تفاصيل كل دولة وجيرانها.",
        "challenge": "أحياناً كان الضغط على دولة مجاورة يفتح دولة أخرى غيرها.",
        "did": "استبدلت المطابقة بالاسم برموز الدول الفريدة (cca3)، وأعدت تنظيم إدارة الحالة لإزالة الوميض أثناء التحميل.",
        "built": [
          "مستكشف متجاوب لأكثر من 250 دولة عبر REST Countries API، مع أنواع TypeScript صارمة للبيانات المتداخلة.",
          "تخزين الاستجابات في Local Storage لتجنب تكرار الطلبات عند عودة الزائر."
        ]
      },
      "notenest": {
        "name": "NoteNest",
        "summary": "API لإدارة الملاحظات: إنشاء وقراءة وتعديل وحذف، مع حفظها في قاعدة بيانات.",
        "built": [
          "RESTful API مبني بـ Node.js وExpress.js يدعم عمليات CRUD كاملة، ويحفظ البيانات في MongoDB عبر نماذج Mongoose.",
          "Middleware مخصص ومعالجة مركزية للأخطاء تضمن ردوداً موحدة، مع اختباره عبر Postman."
        ]
      },
      "forsa": {
        "name": "فرصة",
        "summary": "منصة وظائف مبنية بـ Next.js، يتصفح فيها الباحثون عن عمل الوظائف ويتقدمون لها.",
        "note": "أتعلم Next.js من خلال بناء هذا المشروع، لذلك يتطور باستمرار.",
        "building": [
          "قائمة الوظائف وصفحة تفاصيل لكل وظيفة (اكتملت).",
          "التقديم على الوظائف، ولوحة تحكم للأدمن لإدارة الإعلانات، وتسجيل دخول بصلاحيات حسب الدور، مع قاعدة بيانات.",
          "لاحقاً: ميزة بالذكاء الاصطناعي تقيّم مدى ملاءمة المتقدم لكل وظيفة."
        ]
      },
      "kanban": {
        "name": "Kanban Board",
        "summary": "لوحة مهام تضيف فيها المهام وتعدّلها وتنقلها بين الأعمدة، بوضعين فاتح وداكن.",
        "built": [
          "لوحة مهام متجاوبة تراعي إمكانية الوصول، مبنية على تصميم من Frontend Mentor، وتُدار حالة المهام فيها بـ Redux Toolkit.",
          "نماذج تعديل مملوءة مسبقاً، واختيار الحالة لنقل المهام، ووضع فاتح وداكن يعتمد على متغيرات CSS."
        ]
      },
      "caltrack": {
        "name": "CalTrack",
        "summary": "تطبيق لحساب السعرات الحرارية، بنموذج إدخال يستجيب لما تكتبه فوراً.",
        "built": [
          "إدارة حالة نموذج متعدد الشروط والإدخال اللحظي باستخدام useReducer وأنواع TypeScript صارمة.",
          "تنقّل بين الصفحات عبر React Router، وCSS Modules لكل مكوّن لمنع تعارض الأنماط."
        ]
      },
      "portfolio": {
        "name": "هذا الموقع",
        "summary": "الموقع الذي تتصفحه الآن: بلغتين، يراعي إمكانية الوصول، وفيه نموذج تواصل تصلني رسائله على البريد وTelegram.",
        "built": [
          "Next.js App Router مع دعم كامل للعربية والإنجليزية، بما فيه الاتجاه من اليمين لليسار.",
          "نظام كواكب وكوكبة مهارات تفاعليان بـ SVG، ولكل منهما عرض بديل كقائمة.",
          "API للتواصل يتحقق من البيانات ويحدّ من عدد الرسائل ويحمي من السبام، ومختبَر بـ Vitest وPlaywright."
        ]
      },
      "wasla": {
        "name": "وصلة",
        "summary": "تطبيق محادثة مبني بـ MERN stack (MongoDB وExpress وReact وNode.js)."
      }
    }
  },
  "skills": {
    "title": "المهارات",
    "hint": "كل نجمة مهارة، والخطوط تربط المهارات التي استخدمتها معاً في مشروع واحد. النجوم المفرّغة مهارات ما زلت أتعلمها. اضغط على أي نجمة.",
    "usedIn": "استخدمتها في",
    "learning": "أتعلمها الآن",
    "notes": {
      "nextNote": "أتعلم Next.js حالياً وأطبّقه مباشرة في فرصة وفي هذا الموقع.",
      "vitestNote": "تعلمته ضمن مسار React with TypeScript، وكتبت به اختبارات كثيرة.",
      "figmaNote": "أقرأ تصميمات Figma وأحوّلها إلى كود، وأدرس UI/UX في منحة جامعة النيل."
    },
    "groups": {
      "frontend": "Frontend",
      "backend": "Backend وAPIs",
      "tools": "الاختبارات والأدوات ونظام التشغيل",
      "design": "التصميم وواجهات المستخدم",
      "learning": "أتعلمها الآن",
      "university": "درستها في الجامعة"
    }
  },
  "rightNow": {
    "title": "حالياً",
    "building": "أعمل على",
    "learning": "أتعلم",
    "next": "مشروعي القادم",
    "looking": {
      "label": "أبحث عن",
      "value": "وظيفة Junior في Frontend أو Full-Stack"
    },
    "updated": "TODO",
    "updatedLabel": "آخر تحديث",
    "comingSoon": "قريباً"
  },
  "about": {
    "title": "نبذة عني",
    "log": [
      {
        "label": "LOG 01",
        "text": "درست نظم المعلومات في جامعة بورسعيد (2021–2025). كان مشروع تخرجي HomeTech، منصة لطلب الخدمات المنزلية مثل السباكة والكهرباء والنجارة والصيانة، وتولّيت فيه الجزء الخاص بالـ Frontend باستخدام JavaScript فقط دون أي مكتبات."
      },
      {
        "label": "LOG 02",
        "text": "ركّزت بعدها على الـ Frontend الحديث: JavaScript ثم React ثم React مع TypeScript، وتعلمت الاختبار بـ Vitest. بنيت عدة تطبيقات React، ثلاثة منها منشورة على الإنترنت. وأتعلم الآن الـ Backend بـ Node.js وExpress وMongoDB، وأبني تطبيقات Full-Stack بـ Next.js."
      },
      {
        "label": "LOG 03",
        "text": "عملت مندوب مبيعات في compuMe (من 12/2025 إلى 04/2026)، وكان دوري أن أشرح مواصفات اللابتوبات للعملاء بلغة بسيطة. علّمتني هذه التجربة كيف أكتب واجهات واضحة، وكيف أشرح القرارات التقنية لأي شخص. وفي 2026 التحقت بمنحة UI/UX في جامعة النيل لأقوّي مهارة تحويل تصميمات Figma إلى كود."
      }
    ],
    "crewTitle": "طريقتي في العمل",
    "crew": [
      "أحوّل تصميمات Figma إلى كود نظيف وسهل الصيانة.",
      "أشرح القرارات التقنية بلغة بسيطة يفهمها الجميع.",
      "أشادت بي إدارة compuMe لاحترافيتي والتزامي وتعاوني مع الفريق واهتمامي بالعملاء."
    ],
    "educationTitle": "التعليم",
    "education": [
      "بكالوريوس نظم المعلومات، جامعة بورسعيد (09/2021 – 07/2025)",
      "مواد دراسية ذات صلة: Data Structures وDatabases وWeb Development وNetworking Fundamentals وData Mining وInformation Retrieval",
      "منحة UI/UX، جامعة النيل، أونلاين (2026): التصميم المتمحور حول المستخدم، وتحويل تصميمات Figma إلى واجهات"
    ],
    "certsTitle": "الشهادات",
    "certs": [
      "Data Structures Decode, Cloud Native Base Camp (08/2026)",
      "Node.js From Scratch, Cloud Native Base Camp (07/2026)",
      "React with TypeScript (بما في ذلك الاختبار بـ Vitest)",
      "React.js Track",
      "JavaScript Track (03/2025)",
      "Interactive Web Design Track (10/2024)",
      "Programming Fundamentals Track (07/2024)"
    ],
    "languagesTitle": "اللغات",
    "languages": [
      "العربية: اللغة الأم",
      "الإنجليزية: مستوى مهني"
    ]
  },
  "contact": {
    "title": "تواصل معي",
    "intro": "عندك فرصة عمل أو سؤال؟ راسلني بالطريقة الأسهل لك.",
    "actions": {
      "email": "البريد الإلكتروني",
      "linkedin": "LinkedIn",
      "whatsapp": "واتساب",
      "github": "GitHub",
      "open": "افتح",
      "copyEmail": "انسخ"
    },
    "form": {
      "title": "أو اترك لي رسالة",
      "name": "اسمك",
      "contact": "بريدك أو رقم واتساب (لأتمكن من الرد)",
      "message": "رسالتك",
      "namePh": "سارة من شركة Acme",
      "contactPh": "sara@acme.com",
      "messagePh": "نود التحدث معك بخصوص وظيفة Junior",
      "send": "إرسال",
      "sending": "جارٍ الإرسال…",
      "success": "وصلتني رسالتك، وسأرد عليك قريباً.",
      "errName": "اكتب اسمك",
      "errContact": "أضف بريدك أو رقمك لأتمكن من الرد",
      "errMessage": "اكتب رسالة قصيرة (10 أحرف على الأقل)",
      "errSend": "لم تُرسل الرسالة. راسلني مباشرة على",
      "errRate": "أرسلت رسائل كثيرة. حاول مرة أخرى بعد دقائق."
    }
  },
  "fast": {
    "title": "ملخص سريع",
    "topProjects": "أبرز المشاريع",
    "inProgress": "قيد التطوير",
    "skills": "المهارات",
    "experience": "الخبرة والتعليم",
    "experienceItems": [
      "مندوب مبيعات، compuMe، القاهرة (12/2025 إلى 04/2026)",
      "بكالوريوس نظم المعلومات، جامعة بورسعيد (2025)",
      "منحة UI/UX، جامعة النيل (2026)"
    ],
    "contact": "تواصل",
    "full": "شاهد النسخة التفاعلية الكاملة",
    "back": "العودة للموقع الكامل"
  },
  "footer": {
    "hint": "اضغط Ctrl/Cmd + K"
  },
  "notFound": {
    "title": "الصفحة غير موجودة",
    "text": "يبدو أن هذه الصفحة تاهت في الفضاء.",
    "back": "العودة للرئيسية"
  },
  "meta": {
    "title": "محمد نصار | مطوّر Frontend",
    "description": "مطوّر Frontend من القاهرة. React وTypeScript، وأبني الآن تطبيقات Full-Stack بـ Next.js وNode.js. متاح للبدء فوراً."
  }
}
```

## 15. Testing, CI and repo hygiene

The repo itself is a code sample a reviewer will open. Treat it that way.

**Unit tests (Vitest, `tests/`):**
- `lib/status.ts`: link visibility (`"TODO"`, `null`, real URL), default selected project, projects per status, Right now rows, skills moved into "Currently learning".
- `lib/constellation.ts`: edges from shared `usedIn`; `planned` projects ignored; no duplicate or self edges.
- `lib/orbit.ts`: positions for known angles.
- `lib/contact.ts`: zod schema accepts valid input, rejects each invalid field, strips control characters.
- `app/api/contact/route.ts` (with providers mocked): honeypot returns 200 and sends nothing; oversized body returns 413; one channel failing still returns 200; both failing returns 502 with no provider details.
- A test that `messages/en.json` and `messages/ar.json` have exactly the same keys.

**End-to-end (Playwright, `e2e/`, config in `playwright.config.ts`), mobile and desktop viewports, against a production build on port 3100, with reduced motion so planets hold still:**
- `/en` and `/ar` load; `dir` is correct; hero text is visible immediately.
- Selecting a planet updates the card; the list view toggle works with the keyboard.
- A "Used in" link in the skills card selects the project.
- `/en/fast` renders top projects.
- Contact form shows inline errors on empty submit (API mocked).

**CI (`.github/workflows/ci.yml`):** on push and pull request: install, typecheck (`next typegen && tsc --noEmit`, because route types are generated), lint, unit tests, `next build`, Playwright. Step 1 starts with typecheck and lint; later steps add the rest.

**README.md:** what the site is, live link, how to run locally, env vars, and a short "Decisions" section (why a status system, why computed edges, why SVG with HTML button overlays, how RTL is handled).

**CLAUDE.md:** imports `AGENTS.md`, points to this file as the single source of truth, and states the working agreement, the `pnpm add` rule and the rule to read current package docs.

## 16. Acceptance checklist

The task is done only when every item is true.

**Content integrity**
- [ ] No text on the site that is not in `messages/*.json` or `content/*.ts`.
- [ ] No invented numbers, projects, quotes, testimonials, skill percentages or contribution counts.
- [ ] Every `TODO` follows section 4.4 and is listed in `TODO.md`.

**Status system**
- [ ] Changing a project's `status` (and nothing else) moves it correctly between planet, Right now and Fast mode.
- [ ] Changing a skill's `status` (and nothing else) moves it between groups and changes the star style.

**Design**
- [ ] Only the tokens in section 5. Teal only where the accent rule allows.
- [ ] Looks right at 360px, 768px and 1280px, in both languages.
- [ ] Hero answers who, what, availability and contact without scrolling on mobile, visible on first paint.

**Behavior**
- [ ] Countdown runs only in the Explorer ID status, once per session, never delays or hides content, off with reduced motion.
- [ ] Planet drift only on desktop fine pointer, pauses on hover/focus, labels stay upright and never overlap.
- [ ] Star system and constellation fully usable by keyboard and screen reader through HTML buttons and list views.
- [ ] Fast mode renders at `/{locale}/fast`, is print-friendly, uses the same data.
- [ ] Contact form validates inline, handles all four states, shows the email fallback on failure.
- [ ] API route: honeypot, rate limit, size limit, both channels in parallel, no secret leakage, no HTML.
- [ ] 404 page and favicon exist.

**i18n**
- [ ] `/en` and `/ar` complete; `dir="rtl"` on Arabic; logical Tailwind utilities only; directional icons mirrored; language toggle keeps the section.

**Quality**
- [ ] TypeScript strict, ESLint, unit tests, Playwright and `next build` all pass in CI.
- [ ] Lighthouse mobile 90+ on all four categories.
- [ ] `.env.example`, `README.md`, `CLAUDE.md`, `TODO.md` present; no secrets committed.

## 17. Build phases

**Phase 1:** everything above except the terminal. Steps (commit and stop after each, per section 0):
1. Tokens, fonts, layout shell, i18n scaffolding (`/en`, `/ar`, redirect, RTL), full `messages/*.json`, CI with typecheck and lint.
2. `content/*.ts`, `TODO.md`, and `lib/status.ts`, `lib/orbit.ts`, `lib/constellation.ts` with their unit tests.
3. Header and Hero (with Explorer ID and countdown).
4. Projects: star system, ProjectCard, list view.
5. Skills: constellation, SkillCard, SkillGroups.
6. Right now and About.
7. Contact UI, then API route with tests.
8. Footer, back-to-top button, 404, Fast mode.
9. SEO, analytics, Playwright tests, README, QA against section 16.

**Phase 2 (after Phase 1 is deployed and verified): terminal.**
- Opens with Ctrl/Cmd + K on fine-pointer devices only. Esc closes. Focus trapped while open and restored on close.
- Centered panel (`--surface`, 1px `--border`, 12px radius, JetBrains Mono 14px), prompt `visitor@mission:~$`.
- Commands (plain text from the same content files, localized): `help`, `whoami`, `projects` (grouped by status), `project <id>`, `skills` (grouped, learning marked), `now` (Right now), `contact`, `fast`, `lang en|ar`, `cv`, `clear`, `exit`. Unknown: `command not found. Type "help".`
- Arrow-up recalls history. Add the footer hint.

## 18. Open items for the owner (put these in `TODO.md`)

1. **Forsa:** add the database and auth library to `stack` once chosen. Add the live URL only when applying or the admin dashboard works.
2. ~~**Nabd Masr screenshots**~~ done: copied from the nabd-masr repo into `public/projects/nabd-masr/`.
2a. **Around The World live demo is broken:** REST Countries now answers `/v3.1/...` with a 301 redirect to a static file, so the app shows "Failed to load countries." Its Live demo button is hidden (`live: null`) until then. Fix the data source, restore the link, then run `pnpm capture:demos` with an Around The World entry added.
2b. **CalTrack deep links 404:** opening `/track` directly returns Netlify's 404 page. Add a `_redirects` file (`/* /index.html 200`) to the CalTrack repo.
3. **Repo URLs:** Around The World, Kanban, CalTrack, and this portfolio.
3a. **Wasla:** send the repo link once the first code is pushed, then switch it to `in-progress`.
3b. **Fix the CV to match the site:** remove "Netlify Serverless Function proxy" and "Serverless Functions"; change "OpenNews API" to "NewsAPI"; present Next.js, Node.js, Express and MongoDB as currently learning instead of "specializing"; add "Networking Fundamentals" to coursework.
3c. **Fix the nabd-masr README:** remove the dead Live Demo badge and the corsproxy line, and correct the LinkedIn link.
4. **Screenshots** for NoteNest, Forsa and this portfolio (optional). Kanban and CalTrack are captured from their live demos.
5. **"Last updated"** in Right now (`rightNow.updated`, both languages).
6. **University coursework group:** keep or delete each item (Python, C++, C#, SQL Server, OOP, DSA). Only keep what you can talk about in an interview.
7. **HomeTech:** if you have the code or screenshots of your frontend part, it can become a planet.
8. **CV PDF** at `public/Muhammad_Nassar_CV.pdf`. Update the CV so it matches the site's honest skill levels.
9. **Optional photo** at `public/photo.jpg` (square, 400px+).
10. **Confirm the CalTrack URL spelling** (`clatrack.netlify.app`).
11. **Accounts:** Resend (API key), Telegram bot via BotFather (token and chat id), Upstash Redis.
12. **Domain:** buy one, connect it on Vercel, verify it in Resend, then redirect the old `nassardevfolio.netlify.app`.
13. **Review the Arabic copy** in section 14.

## 19. دليل التحديث لصاحب الموقع (Owner's update guide)

> القسم ده ليك إنت، مش للـ agent. كل تحديث بيبقى تعديل في ملف أو اتنين، من غير ما تلمس أي component.

**خلصت تتعلم مهارة (مثلاً Express):**
افتح `content/skills.ts`، ولاقي السطر بتاعها، وغيّر `status: "learning"` لـ `status: "core"`. النجمة هتتملي، وهتخرج من جروب "Currently learning"، وهتختفي من صف Learning في Right now، كل ده لوحده.

**بدأت تتعلم مهارة جديدة:**
ضيف سطر جديد في `content/skills.ts` بـ `status: "learning"`. لو عايزها نجمة، حط `star: true`. ولو استخدمتها في مشروع، حط الـ id بتاعه في `usedIn`.

**خلصت فرصة:**
في `content/projects.ts`: غيّر `status` لـ `"done"`، وحط اللينكات، وكمّل الـ `stack`. وفي `messages/en.json` و`messages/ar.json`: غيّر `building` لـ `built`، واكتب فيها اللي عملته فعلاً. ممكن تشيل الـ `note`.

**بدأت تشتغل فعلاً على وصلة:**
غيّر `status` من `"planned"` لـ `"in-progress"`، وضيف `orbit` و`angle` (مثلاً `orbit: 2, angle: 60`)، وضيف `building` في ملفات الرسائل. هيتحول من "Next mission" لكوكب.

**مشروع جديد خالص:**
سطر جديد في `content/projects.ts` بـ id جديد، وبلوك بنفس الـ id في `messages/en.json` و`messages/ar.json` تحت `projects.items`.

**ضفت screenshots:**
حط الصور في `public/projects/<id>/` واكتب مساراتها في `images`.

**بعد أي تعديل:**
غيّر `rightNow.updated` للشهر الحالي في الملفين، وبعدين اعمل commit وpush، وVercel هينشر لوحده. لو الـ CI وقع، غالباً نسيت تضيف key في ملف لغة من الاتنين.
