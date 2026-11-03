import { cacheLife } from "next/cache";
import { site } from "@/content/site";

// The newest pushed_at from GitHub's "list repositories for a user" response.
export function latestPushedAt(repos: unknown): string | null {
  if (!Array.isArray(repos)) return null;
  const times = repos
    .map((repo) => (repo && typeof repo === "object" ? (repo as { pushed_at?: unknown }).pushed_at : null))
    .filter((time): time is string => typeof time === "string" && !Number.isNaN(Date.parse(time)));
  if (times.length === 0) return null;
  return times.reduce((latest, time) => (Date.parse(time) > Date.parse(latest) ? time : latest));
}

// When the owner last pushed to a public repo, or null if GitHub can't be reached.
// Success is cached for an hour; a failure only for minutes, so the footer line comes back soon.
export async function getLastActivity(): Promise<string | null> {
  "use cache";

  try {
    const token = process.env.GITHUB_TOKEN;
    const response = await fetch(
      `https://api.github.com/users/${site.github_user}/repos?sort=pushed&per_page=5`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "portfolio-footer",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
    const pushedAt = response.ok ? latestPushedAt(await response.json()) : null;
    if (pushedAt) {
      cacheLife("hours");
      return pushedAt;
    }
  } catch {
    // Network errors fall through to the short cache below.
  }

  cacheLife("minutes");
  return null;
}
