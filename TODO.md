# TODO for the owner

Open items from section 18 of `docs/design.md`.

## Content values still set to `TODO`

- [ ] **Repo URLs** in `content/projects.ts`: Around The World, Kanban, CalTrack and this portfolio. Their Code buttons stay hidden until then.
- [ ] **"Last updated"** in Right now: `rightNow.updated` in `messages/en.json` and `messages/ar.json`.

## Files to provide

- [ ] **CV PDF** at `public/Muhammad_Nassar_CV.pdf`. Update the CV so it matches the site's honest skill levels.
- [ ] **Optional photo** at `public/photo.jpg` (square, 400px+).
- [ ] **Nabd Masr screenshots:** copy `docs/landing-page.png`, `docs/loading-state.png` and `docs/search-results.png` from the nabd-masr repo into `public/projects/nabd-masr/` and list them in `images`.
- [ ] **Screenshots** for the other projects (optional but strongly recommended).

## Projects

- [ ] **Forsa:** add the database and auth library to `stack` once chosen. Add the live URL only when applying or the admin dashboard works.
- [ ] **Wasla:** send the repo link once the first code is pushed, then switch it to `in-progress`.
- [ ] **HomeTech:** if you have the code or screenshots of your frontend part, it can become a planet.
- [ ] **Confirm the CalTrack URL spelling** (`clatrack.netlify.app`).

## Fix outside this repo

- [ ] **Fix the CV to match the site:** remove "Netlify Serverless Function proxy" and "Serverless Functions"; change "OpenNews API" to "NewsAPI"; present Next.js, Node.js, Express and MongoDB as currently learning instead of "specializing"; add "Networking Fundamentals" to coursework.
- [ ] **Fix the nabd-masr README:** remove the dead Live Demo badge and the corsproxy line, and correct the LinkedIn link.

## Decide and review

- [ ] **University coursework group:** keep or delete each item (Python, C++, C#, SQL Server, OOP, DSA). Only keep what you can talk about in an interview.
- [ ] **Review the Arabic copy** in `messages/ar.json`, including the new `hero.ctaContact`.

## Accounts and launch

- [ ] **Accounts:** Resend (API key), Telegram bot via BotFather (token and chat id), Upstash Redis. The Resend account must own `n3ssar.swe@gmail.com` until a custom domain is verified.
- [ ] **Domain:** buy one, connect it on Vercel, verify it in Resend, then redirect the old `nassardevfolio.netlify.app`.
