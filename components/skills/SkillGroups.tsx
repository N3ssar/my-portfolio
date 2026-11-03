import { useTranslations } from "next-intl";
import { skills } from "@/content/skills";
import { skillGroups } from "@/lib/status";

// A plain, scannable list of every skill by group, for recruiters and ATS scanning.
export function SkillGroups() {
  const t = useTranslations("skills.groups");
  const groups = skillGroups(skills);

  if (groups.length === 0) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {groups.map(({ key, skills: groupSkills }) => (
        <div key={key}>
          <h3>{t(key)}</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {groupSkills.map((skill) => (
              <li
                key={skill.id}
                className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-text-soft"
              >
                <bdi>{skill.label}</bdi>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
