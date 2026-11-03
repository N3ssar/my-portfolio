import type { Metadata } from "next";
import { site } from "@/content/site";
import { routing } from "@/i18n/routing";

// The site's public origin: NEXT_PUBLIC_SITE_URL, else Vercel's production domain, else local.
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

const OG_LOCALES: Record<string, string> = { en: "en_US", ar: "ar_EG" };

// The link preview image. Absolute, so crawlers never have to resolve it against metadataBase.
function previewImage() {
  return { url: `${siteUrl()}/og.jpg`, type: "image/jpeg", width: 1200, height: 630, alt: site.name };
}

// Per-locale metadata for a page: title, description, canonical URL, hreflang alternates and the OG image.
// path is the page's path without the locale, for example "" or "/fast".
export function pageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const url = `/${locale}${path}`;
  return {
    metadataBase: new URL(siteUrl()),
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`])),
        "x-default": `/${routing.defaultLocale}${path}`,
      },
    },
    openGraph: {
      type: "website",
      url,
      siteName: site.name,
      title,
      description,
      locale: OG_LOCALES[locale],
      images: [previewImage()],
    },
    twitter: { card: "summary_large_image", title, description, images: [previewImage()] },
  };
}

// Paths that exist in every locale, for the sitemap.
export const PAGE_PATHS = ["", "/fast"] as const;
