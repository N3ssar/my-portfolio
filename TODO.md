# TODO for the owner

Open items from section 18 of `docs/design.md`.

## Content values still set to `TODO`

- [ ] **Repo URLs** in `content/projects.ts`: Around The World, Kanban, CalTrack and this portfolio. Their Code buttons stay hidden until then.

## Files to provide

- [ ] **CV PDF** at `public/Muhammad_Nassar_CV.pdf`. Update the CV so it matches the site's honest skill levels.
- [ ] **Screenshots** for NoteNest, Forsa and this portfolio (optional). Nabd Masr, Kanban and CalTrack are done.

## Projects

- [ ] **Forsa:** add the database and auth library to `stack` once chosen. Add the live URL only when applying or the admin dashboard works.
- [ ] **Wasla:** send the repo link once the first code is pushed, then switch it to `in-progress`.
- [ ] **HomeTech:** if you have the code or screenshots of your frontend part, it can become a planet.
- [ ] **Confirm the CalTrack URL spelling** (`clatrack.netlify.app`).
- [ ] **Around The World live demo is broken:** REST Countries now answers `/v3.1/...` with a 301 redirect to a static file, so the app shows "Failed to load countries." Its Live demo button is hidden for now (`live: null`, with the URL kept in a comment). Fix the data source, restore the link, then add it to `scripts/capture-demo-screenshots.mjs` and run `pnpm capture:demos`.
- [ ] **CalTrack deep links 404:** opening `/track` directly returns Netlify's 404 page. Add a `public/_redirects` file with `/* /index.html 200` to the CalTrack repo.

## Fix outside this repo

- [ ] **Fix the CV to match the site:** remove "Netlify Serverless Function proxy" and "Serverless Functions"; change "OpenNews API" to "NewsAPI"; present Next.js, Node.js, Express and MongoDB as currently learning instead of "specializing"; add "Networking Fundamentals" to coursework.
- [ ] **Fix the nabd-masr README:** remove the dead Live Demo badge and the corsproxy line, and correct the LinkedIn link.

## Decide and review

- [ ] **University coursework group:** keep or delete each item (Python, C++, C#, SQL Server, OOP, DSA). Only keep what you can talk about in an interview.
- [ ] **Review the Arabic copy** in `messages/ar.json`, including the new `hero.ctaContact`.

## Accounts and launch

- [ ] **Accounts:** Resend (API key), Telegram bot via BotFather (token and chat id), Upstash Redis. The Resend account must own `n3ssar.swe@gmail.com` until a custom domain is verified.
- [ ] **Domain:** buy one, connect it on Vercel, verify it in Resend, then redirect the old `nassardevfolio.netlify.app`.
