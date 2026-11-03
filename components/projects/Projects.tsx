import { useTranslations } from "next-intl";
import { projects } from "@/content/projects";
import { visibleProjects } from "@/lib/status";
import { ProjectCard } from "./ProjectCard";
import { ProjectsView } from "./ProjectsView";

export function Projects() {
  const t = useTranslations("projects");
  const common = useTranslations("common");
  const visible = visibleProjects(projects);

  if (visible.length === 0) return null;

  return (
    <section id="projects" data-reveal className="mx-auto max-w-page px-4 py-16 sm:px-6 lg:py-24">
      <h2>{t("title")}</h2>
      <p className="mt-3 text-text-soft">{t("hint")}</p>
      <ProjectsView
        planets={visible.map((project) => ({
          project,
          name: t(`items.${project.id}.name`),
        }))}
        cards={visible.map((project) => ({
          id: project.id,
          card: <ProjectCard project={project} />,
        }))}
        sunLabel={t("sun")}
        listViewLabel={common("listView")}
        mapViewLabel={common("mapView")}
      />
    </section>
  );
}
