import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { SkillGroups } from "@/components/skills/SkillGroups";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { Link } from "@/i18n/navigation";
import { isVisibleLink, projectsByStatus, topProjects } from "@/lib/status";

export async function generateMetadata({ params }: PageProps<"/[locale]/fast">): Promise<Metadata> {
  const { locale } = await params;
  const fast = await getTranslations({ locale, namespace: "fast" });
  const meta = await getTranslations({ locale, namespace: "meta" });
  return { title: `${fast("title")} | ${meta("title")}`, description: meta("description") };
}

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

function Block({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-10 break-inside-avoid">
      <h2 className="text-lg">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

// Recruiter Fast Mode: the same facts as the main page, with no space theme, animation or SVG.
export default function FastPage() {
  const t = useTranslations("fast");
  const hero = useTranslations("hero");
  const items = useTranslations("projects.items");
  const common = useTranslations("common");
  const actions = useTranslations("contact.actions");
  const inProgress = projectsByStatus(projects, "in-progress");
  const experience: string[] = t.raw("experienceItems");

  return (
    <div className="mx-auto max-w-[720px] px-4 py-12 sm:px-6" data-fast-mode>
      {/* Covers the starfield: Fast mode has no space theme. */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-bg" />
      <p className="text-sm text-text-muted">{t("title")}</p>
      <h1 className="mt-1">{site.name}</h1>
      <ul className="mt-3 space-y-1 text-text-soft">
        <li>{hero("id.roleValue")}</li>
        <li>{hero("id.basedValue")}</li>
        <li>{hero("availability")}</li>
        <li>{t("military")}</li>
      </ul>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={site.cv} download className="btn btn-primary">
          {hero("ctaCv")}
        </a>
        <a href="#fast-contact" className="btn btn-outline">
          {t("contact")}
        </a>
      </div>

      <Block title={t("topProjects")}>
        <ul className="space-y-6">
          {topProjects(projects).map(({ id, stack, links }) => (
            <li key={id}>
              <h3>{items(`${id}.name`)}</h3>
              <p className="mt-1 text-text-soft">{items(`${id}.summary`)}</p>
              <p className="mt-1 text-sm text-text-muted">
                <bdi>{stack.join(" · ")}</bdi>
              </p>
              <p className="mt-1 flex flex-wrap gap-x-4 text-sm">
                {isVisibleLink(links.live) && (
                  <a href={links.live} {...external} className="underline underline-offset-4 hover:text-accent">
                    {common("live")}
                  </a>
                )}
                {isVisibleLink(links.repo) && (
                  <a href={links.repo} {...external} className="underline underline-offset-4 hover:text-accent">
                    {common("code")}
                  </a>
                )}
              </p>
            </li>
          ))}
        </ul>
      </Block>

      {inProgress.length > 0 && (
        <Block title={t("inProgress")}>
          <ul className="space-y-2 text-text-soft">
            {inProgress.map(({ id, links }) => (
              <li key={id}>
                <span className="text-text">{items(`${id}.name`)}</span>: {items(`${id}.summary`)}{" "}
                {isVisibleLink(links.repo) && (
                  <a href={links.repo} {...external} className="text-sm underline underline-offset-4 hover:text-accent">
                    {common("follow")}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Block>
      )}

      <Block title={t("skills")}>
        <SkillGroups compact />
      </Block>

      <Block title={t("experience")}>
        <ul className="list-disc space-y-1 ps-5 text-text-soft">
          {experience.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Block>

      <Block title={t("contact")} id="fast-contact">
        <ul className="space-y-1 text-text-soft">
          <li>
            {actions("email")}:{" "}
            <a href={`mailto:${site.email}`} className="underline underline-offset-4 hover:text-accent">
              <bdi>{site.email}</bdi>
            </a>
          </li>
          {(
            [
              ["linkedin", site.links.linkedin],
              ["whatsapp", site.whatsapp],
              ["github", site.links.github],
            ] as const
          ).map(([key, href]) => (
            <li key={key}>
              <a href={href} {...external} className="underline underline-offset-4 hover:text-accent">
                {actions(key)}
              </a>
            </li>
          ))}
        </ul>
      </Block>

      <p className="mt-12">
        <Link href="/" className="underline underline-offset-4 hover:text-accent">
          {t("full")}
        </Link>
      </p>
    </div>
  );
}
