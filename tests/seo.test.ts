import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { pageMetadata } from "@/lib/seo";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("link preview image", () => {
  it("is an absolute JPEG URL built from NEXT_PUBLIC_SITE_URL, for Open Graph and Twitter", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://n3ssar.vercel.app/");
    const metadata = pageMetadata({ locale: "ar", path: "/fast", title: "Title", description: "Description" });
    const expected = {
      url: "https://n3ssar.vercel.app/og.jpg",
      type: "image/jpeg",
      width: 1200,
      height: 630,
    };
    expect(metadata.openGraph?.images).toEqual([expect.objectContaining(expected)]);
    expect(metadata.twitter?.images).toEqual([expect.objectContaining(expected)]);
  });

  it("exists in public/ and stays under 200KB, which WhatsApp needs", () => {
    const file = join(process.cwd(), "public", "og.jpg");
    expect(existsSync(file)).toBe(true);
    expect(statSync(file).size).toBeLessThan(200 * 1024);
  });
});
