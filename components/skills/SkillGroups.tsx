import { useTranslations } from "next-intl";
import { skills } from "@/content/skills";
import { skillGroups } from "@/lib/status";

// A plain, scannable list of every skill by group, for recruiters and ATS scanning.
// Fast mode uses the compact version.
export function SkillGroups({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("skills.groups");
  const groups = skillGroups(skills);

  if (groups.length === 0) return null;

  return (
    <div className={`grid sm:grid-cols-2 ${compact ? "gap-4" : "gap-6"}`}>
      {groups.map(({ key, skills: groupSkills }) => (
        <div key={key}>
          <h3 className={compact ? "text-sm" : undefined}>{t(key)}</h3>
          <ul className={`flex flex-wrap ${compact ? "mt-1.5 gap-1.5" : "mt-2 gap-2"}`}>
            {groupSkills.map((skill) => (
              <li
                key={skill.id}
                className={`rounded-full border border-border bg-surface text-text-soft ${compact ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}
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
