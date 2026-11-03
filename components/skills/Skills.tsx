import { useTranslations } from "next-intl";
import { SectionTitle } from "../SectionTitle";
import { projects } from "@/content/projects";
import { skills } from "@/content/skills";
import { constellationEdges, starRadius } from "@/lib/constellation";
import { effectiveUsedIn, starSkills } from "@/lib/status";
import { SkillCard } from "./SkillCard";
import { SkillGroups } from "./SkillGroups";
import { SkillsView } from "./SkillsView";

export function Skills() {
  const t = useTranslations("skills");
  const projectsText = useTranslations("projects.items");
  const common = useTranslations("common");
  const stars = starSkills(skills);

  return (
    <section id="skills" data-reveal className="mx-auto max-w-page px-4 py-16 sm:px-6 lg:py-24">
      <SectionTitle>{t("title")}</SectionTitle>
      <p className="mt-3 text-text-soft">{t("hint")}</p>
      <SkillsView
        stars={stars.map((skill) => ({
          id: skill.id,
          label: skill.label,
          x: skill.x ?? 0,
          y: skill.y ?? 0,
          radius: starRadius(skill, projects),
          learning: skill.status === "learning",
        }))}
        edges={constellationEdges(skills, projects)}
        cards={stars.map((skill) => ({
          id: skill.id,
          card: (
            <SkillCard
              name={skill.label}
              learningLabel={skill.status === "learning" ? t("learning") : undefined}
              usedInLabel={t("usedIn")}
              usedIn={effectiveUsedIn(skill, projects).map((id) => ({
                id,
                name: projectsText(`${id}.name`),
              }))}
              note={skill.note ? t(`notes.${skill.note}`) : undefined}
            />
          ),
        }))}
        groups={<SkillGroups />}
        listViewLabel={common("listView")}
        mapViewLabel={common("mapView")}
      />
    </section>
  );
}
