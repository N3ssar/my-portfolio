import { describe, expect, it, vi } from "vitest";

// getLastActivity uses Next's cache, which only works inside Next. These tests cover the pure parts.
vi.mock("next/cache", () => ({ cacheLife: () => {} }));

const { latestPushedAt } = await import("@/lib/github");
const { relativeTime } = await import("@/lib/time");

describe("latestPushedAt", () => {
  it("returns the newest pushed_at", () => {
    expect(
      latestPushedAt([
        { pushed_at: "2026-10-01T10:00:00Z" },
        { pushed_at: "2026-10-31T18:04:51Z" },
        { pushed_at: "2026-09-12T08:00:00Z" },
      ]),
    ).toBe("2026-10-31T18:04:51Z");
  });

  it("ignores missing or invalid dates, and returns null when there are none", () => {
    expect(latestPushedAt([{ pushed_at: null }, { pushed_at: "2026-10-31T18:04:51Z" }])).toBe(
      "2026-10-31T18:04:51Z",
    );
    expect(latestPushedAt([{ name: "repo" }, { pushed_at: "not a date" }])).toBeNull();
    expect(latestPushedAt({ message: "API rate limit exceeded" })).toBeNull();
    expect(latestPushedAt([])).toBeNull();
  });
});

describe("relativeTime", () => {
  const now = Date.parse("2026-11-03T12:00:00Z");

  it("picks the largest whole unit", () => {
    expect(relativeTime("2026-11-03T10:00:00Z", now, "en")).toBe("2 hours ago");
    expect(relativeTime("2026-11-03T11:55:00Z", now, "en")).toBe("5 minutes ago");
    expect(relativeTime("2026-11-01T12:00:00Z", now, "en")).toBe("2 days ago");
    expect(relativeTime("2026-11-03T11:59:40Z", now, "en")).toBe("this minute");
  });

  it("uses Western digits in Arabic", () => {
    const text = relativeTime("2026-10-31T12:00:00Z", now, "ar");
    expect(text).toMatch(/3/);
    expect(text).not.toMatch(/[٠-٩]/);
  });
});
