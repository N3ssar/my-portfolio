import type { Project } from "@/content/projects";
import type { Skill } from "@/content/skills";
import { effectiveUsedIn, starSkills } from "./status";

export const CONSTELLATION_VIEWBOX = { width: 340, height: 260 } as const;

const BASE_STAR_RADIUS = 3;
const STAR_RADIUS_PER_PROJECT = 0.4;

export type Edge = { from: string; to: string };

// Two stars are connected if they share at least one done or in-progress project.
export function constellationEdges(
  skills: readonly Skill[],
  projects: readonly Project[],
): Edge[] {
  const stars = starSkills(skills).map((skill) => ({
    id: skill.id,
    usedIn: new Set(effectiveUsedIn(skill, projects)),
  }));

  return stars.flatMap((star, index) =>
    stars
      .slice(index + 1)
      .filter((other) => [...star.usedIn].some((id) => other.usedIn.has(id)))
      .map((other) => ({ from: star.id, to: other.id })),
  );
}

export function starRadius(skill: Skill, projects: readonly Project[]): number {
  return (
    BASE_STAR_RADIUS +
    STAR_RADIUS_PER_PROJECT * effectiveUsedIn(skill, projects).length
  );
}
