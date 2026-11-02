import type { Project } from "@/content/projects";

export const STAR_SYSTEM_VIEWBOX = { width: 340, height: 230 } as const;
export const SUN = { x: 170, y: 115, r: 18 } as const;
export const ORBIT_RADII = { 1: 42, 2: 68, 3: 92 } as const;

export const DRIFT_DEGREES = 8;
export const LABEL_GAP = 6;

const DRIFT_BASE_PERIOD_MS = 36_000;
const DRIFT_PERIOD_STEP_MS = 4_000;
const DRIFT_SAMPLES = 48;
const GOLDEN_ANGLE_RADIANS = 2.39996;
const LABEL_HEIGHT_PX = 18;
const LABEL_CHAR_WIDTH_PX = 7.5;
// The map is narrowest on a 360px screen. Labels are a fixed 13px, so they take the most room there.
const MIN_MAP_WIDTH_PX = 328;

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

// Undefined for a planned project, which has no orbit.
export function projectPosition(project: Project): Point | undefined {
  if (project.orbit === undefined || project.angle === undefined) return undefined;
  return orbitPosition(project.orbit, project.angle);
}

export function planetRadius(project: Project): number {
  return project.featured ? FEATURED_PLANET_RADIUS : PLANET_RADIUS;
}

// Different periods and phases keep the planets from swaying in step.
export function driftPeriodMs(index: number): number {
  return DRIFT_BASE_PERIOD_MS + index * DRIFT_PERIOD_STEP_MS;
}

// One sway around the planet's fixed angle, as transforms relative to its resting place.
// Percentages are relative to the map, so the path scales with it.
export function driftTransforms(project: Project, index: number): string[] | undefined {
  const { orbit, angle } = project;
  if (orbit === undefined || angle === undefined) return undefined;
  const rest = orbitPosition(orbit, angle);
  return Array.from({ length: DRIFT_SAMPLES + 1 }, (_, step) => {
    const wave = (step / DRIFT_SAMPLES) * 2 * Math.PI + index * GOLDEN_ANGLE_RADIANS;
    const point = orbitPosition(orbit, angle + DRIFT_DEGREES * Math.sin(wave));
    const x = ((point.x - rest.x) / STAR_SYSTEM_VIEWBOX.width) * 100;
    const y = ((point.y - rest.y) / STAR_SYSTEM_VIEWBOX.height) * 100;
    return `translate(${x.toFixed(3)}%, ${y.toFixed(3)}%)`;
  });
}

export type LabelSide = "start" | "end" | "above" | "below";
export type Box = { left: number; right: number; top: number; bottom: number };

const pxToUnits = (px: number) => (px * STAR_SYSTEM_VIEWBOX.width) / MIN_MAP_WIDTH_PX;

// A slightly generous estimate, in px at the fixed 13px label size.
export function estimateLabelWidth(name: string): number {
  return name.length * LABEL_CHAR_WIDTH_PX;
}

// The side facing away from the sun. Falls back to above or below if the label would leave the map.
export function labelSide(point: Point, radius: number, widthPx: number): LabelSide {
  const dx = point.x - SUN.x;
  const dy = point.y - SUN.y;
  const reach = radius + LABEL_GAP + pxToUnits(widthPx);
  const fitsBeside =
    dx > 0 ? point.x + reach <= STAR_SYSTEM_VIEWBOX.width : point.x - reach >= 0;
  if (Math.abs(dx) > Math.abs(dy) && fitsBeside) return dx > 0 ? "end" : "start";
  return dy > 0 ? "below" : "above";
}

// The space a label takes on the narrowest map, in viewBox units.
export function labelBox(
  point: Point,
  radius: number,
  side: LabelSide,
  widthPx: number,
): Box {
  const width = pxToUnits(widthPx);
  const height = pxToUnits(LABEL_HEIGHT_PX);
  const offset = radius + LABEL_GAP;
  if (side === "start" || side === "end") {
    const left = side === "end" ? point.x + offset : point.x - offset - width;
    return { left, right: left + width, top: point.y - height / 2, bottom: point.y + height / 2 };
  }
  const top = side === "below" ? point.y + offset : point.y - offset - height;
  return { left: point.x - width / 2, right: point.x + width / 2, top, bottom: top + height };
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
