import type { Project } from "@/content/projects";
import type { Skill } from "@/content/skills";

export function project(overrides: Partial<Project> & { id: string }): Project {
  return {
    status: "done",
    kind: "frontend",
    featured: false,
    orbit: 1,
    angle: 0,
    stack: [],
    links: { live: null, repo: null },
    images: [],
    ...overrides,
  };
}

export function skill(overrides: Partial<Skill> & { id: string }): Skill {
  return {
    label: overrides.id,
    group: "frontend",
    status: "core",
    ...overrides,
  };
}
