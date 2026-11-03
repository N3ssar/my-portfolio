import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { PAGE_PATHS, siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteUrl();
  return PAGE_PATHS.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${origin}/${locale}${path}`,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, `${origin}/${l}${path}`])),
      },
    })),
  );
}
