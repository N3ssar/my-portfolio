import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import { skills } from "@/content/skills";
import { CONSTELLATION_VIEWBOX } from "@/lib/constellation";
import {
  DRIFT_DEGREES,
  estimateLabelWidth,
  labelBox,
  labelSide,
  orbitPosition,
  planetRadius,
  projectPosition,
  STAR_SYSTEM_VIEWBOX,
  SUN,
  type Box,
  type Point,
} from "@/lib/orbit";
import { starSkills, visibleProjects } from "@/lib/status";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";

// The map's lowest label may hang into the gap below the map.
const MAP_BOTTOM_ROOM = 16;

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

describe.each([
  ["en", en],
  ["ar", ar],
] as const)("%s map labels across the drift range", (_, messages) => {
  const items: Record<string, { name: string }> = messages.projects.items;
  const offsets = Array.from({ length: 9 }, (_, step) => -DRIFT_DEGREES + step * 2);

  // Every position a planet and its label can reach, with the side fixed at rest.
  const reach = visibleProjects(projects).map((project) => {
    const radius = planetRadius(project);
    const width = estimateLabelWidth(items[project.id].name);
    const side = labelSide(projectPosition(project)!, radius, width);
    return {
      id: project.id,
      radius,
      positions: offsets.map((offset) => {
        const point = orbitPosition(project.orbit!, project.angle! + offset);
        return { point, box: labelBox(point, radius, side, width) };
      }),
    };
  });

  const overlaps = (a: Box, b: Box) =>
    a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

  function touchesCircle(box: Box, center: Point, radius: number) {
    const x = Math.max(box.left, Math.min(center.x, box.right));
    const y = Math.max(box.top, Math.min(center.y, box.bottom));
    return Math.hypot(x - center.x, y - center.y) < radius;
  }

  it("no two labels overlap, and no label touches another planet", () => {
    for (const a of reach) {
      for (const b of reach) {
        if (a === b) continue;
        for (const { box } of a.positions) {
          for (const other of b.positions) {
            expect(overlaps(box, other.box), `label ${a.id} on label ${b.id}`).toBe(false);
            expect(
              touchesCircle(box, other.point, b.radius),
              `label ${a.id} on planet ${b.id}`,
            ).toBe(false);
          }
        }
      }
    }
  });

  it("no label touches the sun or leaves the map", () => {
    for (const { id, positions } of reach) {
      for (const { box } of positions) {
        expect(touchesCircle(box, SUN, SUN.r + 6), `${id} on sun`).toBe(false);
        expect(box.left, id).toBeGreaterThanOrEqual(0);
        expect(box.right, id).toBeLessThanOrEqual(STAR_SYSTEM_VIEWBOX.width);
        expect(box.top, id).toBeGreaterThanOrEqual(0);
        expect(box.bottom, id).toBeLessThanOrEqual(STAR_SYSTEM_VIEWBOX.height + MAP_BOTTOM_ROOM);
      }
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

  it("places planets far enough apart to tap", () => {
    // 44px on a 328px wide map is about 46 viewBox units.
    const points = visibleProjects(projects).map((project) => ({
      id: project.id,
      point: projectPosition(project)!,
    }));
    for (const a of points) {
      for (const b of points) {
        if (a === b) continue;
        const distance = Math.hypot(a.point.x - b.point.x, a.point.y - b.point.y);
        expect(distance, `${a.id} to ${b.id}`).toBeGreaterThanOrEqual(46);
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
