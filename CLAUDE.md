@AGENTS.md



\# Portfolio: instructions for Claude Code



\- The full spec is docs/design.md. Read it before any change. It is the single source of truth.

\- Follow its working agreement (section 0): one step at a time, run typecheck, lint and tests, commit, then stop and summarize.

\- Install every package with `pnpm add <name>` (no version number) so you get the latest. Never type version numbers by hand, and never change versions of installed packages.

\- Your training data may be older than the installed versions. Before using any API from Next.js, Tailwind, next-intl, Motion or any other package, check its version in package.json and read its current docs. Do not assume APIs from memory.

\- If the spec conflicts with how the installed version works, tell me and propose a fix. Do not silently work around it.

