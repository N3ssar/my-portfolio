import type { Project } from "@/content/projects";

export const STAR_SYSTEM_VIEWBOX = { width: 340, height: 230 } as const;
export const SUN = { x: 170, y: 115, r: 18 } as const;
export const ORBIT_RADII = { 1: 42, 2: 68, 3: 92 } as const;

export const ORBIT_PERIODS_MS = { 1: 80_000, 2: 120_000, 3: 160_000 } as const;

const FEATURED_PLANET_RADIUS = 9;
const PLANET_RADIUS = 6;

export type Point = { x: number; y: number };

const round = (value: number) => Math.round(value * 100) / 100;

// 0 degrees points east and angles run clockwise, because SVG's y axis points down.
export function orbitPosition(orbit: keyof typeof ORBIT_RADII, angle: number): Point {
  const radius = ORBIT_RADII[orbit];
  const radians = (angle * Math.PI) / 180;
  return {
    x: round(SUN.x + radius * Math.cos(radians)),
    y: round(SUN.y + radius * Math.sin(radians)),
  };
}

// A planet's position after orbiting for a while. Recomputed from the angle so labels stay upright.
export function orbitPositionAt(
  orbit: keyof typeof ORBIT_RADII,
  angle: number,
  elapsedMs: number,
): Point {
  return orbitPosition(orbit, angle + (elapsedMs / ORBIT_PERIODS_MS[orbit]) * 360);
}

// Undefined for a planned project, which has no orbit.
export function projectPosition(project: Project): Point | undefined {
  if (project.orbit === undefined || project.angle === undefined) return undefined;
  return orbitPosition(project.orbit, project.angle);
}

export function planetRadius(project: Project): number {
  return project.featured ? FEATURED_PLANET_RADIUS : PLANET_RADIUS;
}

// Converts a viewBox point to percentages, for placing HTML buttons over the SVG.
export function toPercent(
  point: Point,
  viewBox: { width: number; height: number },
): Point {
  return {
    x: round((point.x / viewBox.width) * 100),
    y: round((point.y / viewBox.height) * 100),
  };
}
