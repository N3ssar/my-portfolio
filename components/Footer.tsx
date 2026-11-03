import { getTranslations } from "next-intl/server";
import { site } from "@/content/site";
import { getLastActivity } from "@/lib/github";
import { BackToTop, CopyrightYear, LastActivity } from "./FooterClient";

export async function Footer() {
  const t = await getTranslations("footer");
  const common = await getTranslations("common");
  const pushedAt = await getLastActivity();
  const socials = (["github", "linkedin", "figma", "x"] as const).map((key) => ({
    key,
    href: site.links[key],
    label: site.linkLabels[key],
  }));

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-page flex-col gap-6 px-4 py-10 text-sm sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1 text-text-soft">
          <p>{t("built")}</p>
          <p>
            <CopyrightYear name={site.name} />
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {socials.map(({ key, href, label }) => (
            <li key={key}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-text-soft hover:text-accent"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex flex-col items-start gap-3">
          {pushedAt && <LastActivity pushedAt={pushedAt} label={t("lastCommit")} />}
          <BackToTop label={common("backToTop")} />
        </div>
      </div>
    </footer>
  );
}
