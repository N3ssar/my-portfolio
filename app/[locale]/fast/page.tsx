import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { ProjectCard } from "@/components/projects/ProjectCard";
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
const LINK = "underline underline-offset-4 hover:text-accent";

// The site's card style, used for every Fast mode block.
function Card({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  return (
    <section id={id} className="break-inside-avoid scroll-mt-20 rounded-xl border border-border bg-surface p-4 sm:p-6">
      <h2>{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// Recruiter Fast Mode: the same facts as the main page, calmer. No maps, SVG visuals or motion.
export default function FastPage() {
  const t = useTranslations("fast");
  const hero = useTranslations("hero");
  const items = useTranslations("projects.items");
  const common = useTranslations("common");
  const actions = useTranslations("contact.actions");
  const top = topProjects(projects);
  const inProgress = projectsByStatus(projects, "in-progress");
  const experience: string[] = t.raw("experienceItems");
  const facts = [
    [hero("id.based"), hero("id.basedValue")],
    [hero("id.available"), hero("id.availableValue")],
    [hero("id.military"), hero("id.militaryValue")],
  ];

  return (
    <div className="mx-auto max-w-page px-4 sm:px-6">
      {/* Mirrors the hero: who and what on the start side, the facts card on the end side. */}
      <section className="hero-glow py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <p className="text-sm text-text-muted">{t("title")}</p>
            <h1 className="mt-2">{site.name}</h1>
            <p className="mt-4 text-text-soft">{hero("id.roleValue")}</p>
            <div className="mt-6 flex flex-col gap-3 xs:flex-row">
              <a href={site.cv} download className="btn btn-primary">
                {hero("ctaCv")}
              </a>
              <a href="#fast-contact" className="btn btn-outline">
                {t("contact")}
              </a>
            </div>
          </div>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-xl border border-border bg-surface p-4 text-sm sm:p-6">
            {facts.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-xs leading-5 text-text-muted">{label}</dt>
                <dd className="text-text-soft">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="space-y-12 pb-16 lg:pb-24">
        {top.length > 0 && (
          <section>
            <h2>{t("topProjects")}</h2>
            <ul className="mt-4 grid gap-6 lg:grid-cols-3">
              {top.map((project) => (
                <li key={project.id} className="break-inside-avoid">
                  <ProjectCard project={project} compact />
                </li>
              ))}
            </ul>
          </section>
        )}

        {inProgress.length > 0 && (
          <Card title={t("inProgress")}>
            <ul className="space-y-2 text-text-soft">
              {inProgress.map(({ id, links }) => (
                <li key={id}>
                  <span className="text-text">{items(`${id}.name`)}</span>: {items(`${id}.summary`)}{" "}
                  {isVisibleLink(links.repo) && (
                    <a href={links.repo} {...external} className={`text-sm ${LINK}`}>
                      {common("follow")}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card title={t("skills")}>
          <SkillGroups compact />
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title={t("experience")}>
            <ul className="list-disc space-y-1 ps-5 text-text-soft">
              {experience.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>

          <Card title={t("contact")} id="fast-contact">
            <ul className="space-y-1 text-text-soft">
              <li>
                {actions("email")}:{" "}
                <a href={`mailto:${site.email}`} className={LINK}>
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
                  <a href={href} {...external} className={LINK}>
                    {actions(key)}
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <p>
          <Link href="/" className={LINK}>
            {t("full")}
          </Link>
        </p>
      </div>
    </div>
  );
}
