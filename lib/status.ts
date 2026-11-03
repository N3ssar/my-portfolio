import type { Link, Project, ProjectStatus } from "@/content/projects";
import type { Skill } from "@/content/skills";

const TODO = "TODO";

export function isTodo(value: string | null | undefined): boolean {
  return value === TODO;
}

export function isVisibleLink(link: Link): link is string {
  return link !== null && !isTodo(link);
}

export function projectsByStatus(
  projects: readonly Project[],
  status: ProjectStatus,
): Project[] {
  return projects.filter((project) => project.status === status);
}

// Projects shown as planets and cards, in array order.
export function visibleProjects(projects: readonly Project[]): Project[] {
  return projects.filter((project) => project.status !== "planned");
}

export function defaultSelectedProject(
  projects: readonly Project[],
): Project | undefined {
  return projects.find(
    (project) => project.featured && project.status === "done",
  );
}

export function topProjects(projects: readonly Project[], limit = 3): Project[] {
  return projects
    .filter((project) => project.featured && project.status === "done")
    .slice(0, limit);
}

// Project ids in `usedIn` that count: only done and in-progress projects.
export function effectiveUsedIn(
  skill: Skill,
  projects: readonly Project[],
): string[] {
  const visibleIds = new Set(visibleProjects(projects).map(({ id }) => id));
  return (skill.usedIn ?? []).filter((id) => visibleIds.has(id));
}

export function starSkills(skills: readonly Skill[]): Skill[] {
  return skills.filter((skill) => skill.star && skill.status !== "studied");
}

export function learningSkills(skills: readonly Skill[]): Skill[] {
  return skills.filter((skill) => skill.status === "learning");
}

export type SkillGroupKey =
  | "frontend"
  | "backend"
  | "tools"
  | "design"
  | "learning"
  | "university";

const SKILL_GROUP_ORDER: readonly SkillGroupKey[] = [
  "frontend",
  "backend",
  "tools",
  "design",
  "learning",
  "university",
];

function skillGroupKey(skill: Skill): SkillGroupKey {
  if (skill.status === "learning") return "learning";
  if (skill.status === "studied") return "university";
  return skill.group;
}

// Groups in display order. Empty groups are left out.
export function skillGroups(
  skills: readonly Skill[],
): { key: SkillGroupKey; skills: Skill[] }[] {
  return SKILL_GROUP_ORDER.map((key) => ({
    key,
    skills: skills.filter((skill) => skillGroupKey(skill) === key),
  })).filter((group) => group.skills.length > 0);
}

export type RightNowRow = {
  key: "building" | "learning" | "next" | "looking" | "updated";
  values: string[];
  comingSoon: boolean;
};

type RightNowInput = {
  projects: readonly Project[];
  skills: readonly Skill[];
  locale: string;
  projectText: (id: string) => { name: string; summary: string };
  lookingFor: string;
  updated: string;
};

function textRow(key: RightNowRow["key"], value: string): RightNowRow {
  return isTodo(value)
    ? { key, values: [], comingSoon: true }
    : { key, values: [value], comingSoon: false };
}

// A row with nothing to show is left out. A TODO value is flagged as coming soon.
export function rightNowRows({
  projects,
  skills,
  locale,
  projectText,
  lookingFor,
  updated,
}: RightNowInput): RightNowRow[] {
  const list = new Intl.ListFormat(locale, {
    style: "long",
    type: "conjunction",
  });
  const building = projectsByStatus(projects, "in-progress").map(
    ({ id }) => projectText(id).name,
  );
  const learning = learningSkills(skills).map(({ label }) => label);
  const next = projectsByStatus(projects, "planned").map(({ id }) => {
    const { name, summary } = projectText(id);
    return `${name}: ${summary}`;
  });

  const rows: RightNowRow[] = [
    { key: "building", values: building.length ? [list.format(building)] : [], comingSoon: false },
    { key: "learning", values: learning.length ? [list.format(learning)] : [], comingSoon: false },
    { key: "next", values: next, comingSoon: false },
    textRow("looking", lookingFor),
    textRow("updated", updated),
  ];

  return rows.filter(
    (row) => row.comingSoon || row.values.some((value) => value !== ""),
  );
}
