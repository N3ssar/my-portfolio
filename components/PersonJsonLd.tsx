import { useLocale, useTranslations } from "next-intl";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/seo";

// Structured data describing the site's owner, for search engines.
export function PersonJsonLd() {
  const t = useTranslations("hero.id");
  const locale = useLocale();
  const origin = siteUrl();

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: t("roleValue"),
    url: `${origin}/${locale}`,
    image: `${origin}/photo.jpg`,
    email: `mailto:${site.email}`,
    sameAs: Object.values(site.links),
  };

  return (
    <script
      type="application/ld+json"
      // Escaping "<" keeps the JSON from closing the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }}
    />
  );
}
