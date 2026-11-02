import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import { skills } from "@/content/skills";
import { CONSTELLATION_VIEWBOX } from "@/lib/constellation";
import { planetRadius, projectPosition, STAR_SYSTEM_VIEWBOX } from "@/lib/orbit";
import { starSkills, visibleProjects } from "@/lib/status";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";

function keys(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) =>
    child && typeof child === "object"
      ? keys(child, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

type ProjectText = { name?: string; summary?: string; built?: string[]; building?: string[] };

describe.each([
  ["en", en],
  ["ar", ar],
] as const)("%s messages", (_, messages) => {
  const items: Record<string, ProjectText> = messages.projects.items;
  const notes: Record<string, string> = messages.skills.notes;

  it.each(projects.map(({ id, status }) => [id, status] as const))(
    "has the text %s needs as %s",
    (id, status) => {
      expect(items[id]?.name).toBeTruthy();
      expect(items[id]?.summary).toBeTruthy();
      if (status === "done") expect(items[id]?.built?.length).toBeGreaterThan(0);
      if (status === "in-progress") expect(items[id]?.building?.length).toBeGreaterThan(0);
    },
  );

  it("has every skill note", () => {
    for (const { note } of skills) {
      if (note) expect(notes[note]).toBeTruthy();
    }
  });
});

describe("messages", () => {
  it("have exactly the same keys in English and Arabic", () => {
    expect(keys(ar).sort()).toEqual(keys(en).sort());
  });
});

describe("content", () => {
  it("has unique ids", () => {
    for (const list of [projects, skills]) {
      const ids = list.map(({ id }) => id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("gives every visible project an orbit and angle", () => {
    for (const project of visibleProjects(projects)) {
      expect(projectPosition(project), project.id).toBeDefined();
    }
  });

  it("places planets far enough apart to tap and inside the map with their labels", () => {
    // 44px on a 328px wide map is about 46 viewBox units. A label needs about 13 units below the planet.
    const planets = visibleProjects(projects).map((project) => ({
      project,
      point: projectPosition(project)!,
    }));
    for (const { project, point } of planets) {
      expect(point.y + planetRadius(project) + 13, project.id).toBeLessThanOrEqual(
        STAR_SYSTEM_VIEWBOX.height,
      );
      for (const other of planets) {
        if (other === planets.find(({ project: p }) => p === project)) continue;
        const distance = Math.hypot(point.x - other.point.x, point.y - other.point.y);
        expect(distance, `${project.id} to ${other.project.id}`).toBeGreaterThanOrEqual(46);
      }
    }
  });

  it("only uses known project ids in usedIn", () => {
    const ids = new Set(projects.map(({ id }) => id));
    for (const { usedIn = [] } of skills) {
      for (const id of usedIn) expect(ids.has(id), id).toBe(true);
    }
  });

  it("places stars inside the viewBox and far enough apart to tap", () => {
    // 44px on a 328px wide map is about 46 viewBox units.
    const minDistance = 46;
    const stars = starSkills(skills);
    for (const star of stars) {
      expect(star.x, star.id).toBeGreaterThanOrEqual(0);
      expect(star.x, star.id).toBeLessThanOrEqual(CONSTELLATION_VIEWBOX.width);
      expect(star.y, star.id).toBeGreaterThanOrEqual(0);
      expect(star.y, star.id).toBeLessThanOrEqual(CONSTELLATION_VIEWBOX.height);
      for (const other of stars) {
        if (other === star) continue;
        const distance = Math.hypot(star.x! - other.x!, star.y! - other.y!);
        expect(distance, `${star.id} to ${other.id}`).toBeGreaterThanOrEqual(minDistance);
      }
    }
  });
});
