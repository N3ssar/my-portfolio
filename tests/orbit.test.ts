import { describe, expect, it } from "vitest";
import {
  ORBIT_PERIODS_MS,
  ORBIT_RADII,
  orbitPosition,
  orbitPositionAt,
  planetRadius,
  projectPosition,
  SUN,
  toPercent,
} from "@/lib/orbit";
import { project } from "./fixtures";

describe("orbitPosition", () => {
  it("places known angles, running clockwise from east", () => {
    expect(orbitPosition(1, 0)).toEqual({ x: SUN.x + ORBIT_RADII[1], y: SUN.y });
    expect(orbitPosition(2, 90)).toEqual({ x: SUN.x, y: SUN.y + ORBIT_RADII[2] });
    expect(orbitPosition(3, 180)).toEqual({ x: SUN.x - ORBIT_RADII[3], y: SUN.y });
    expect(orbitPosition(1, 270)).toEqual({ x: SUN.x, y: SUN.y - ORBIT_RADII[1] });
  });

  it("handles a diagonal angle", () => {
    const { x, y } = orbitPosition(1, 45);
    expect(x).toBeCloseTo(SUN.x + ORBIT_RADII[1] * Math.SQRT1_2, 1);
    expect(y).toBeCloseTo(SUN.y + ORBIT_RADII[1] * Math.SQRT1_2, 1);
  });
});

describe("orbitPositionAt", () => {
  it("starts at the base angle and returns there after a full period", () => {
    expect(orbitPositionAt(2, 30, 0)).toEqual(orbitPosition(2, 30));
    expect(orbitPositionAt(2, 30, ORBIT_PERIODS_MS[2])).toEqual(orbitPosition(2, 30));
  });

  it("moves a quarter turn in a quarter period", () => {
    expect(orbitPositionAt(1, 0, ORBIT_PERIODS_MS[1] / 4)).toEqual(orbitPosition(1, 90));
  });

  it("uses a different period for each orbit, between 80 and 160 seconds", () => {
    const periods = Object.values(ORBIT_PERIODS_MS);
    expect(new Set(periods).size).toBe(periods.length);
    for (const period of periods) {
      expect(period).toBeGreaterThanOrEqual(80_000);
      expect(period).toBeLessThanOrEqual(160_000);
    }
  });
});

describe("project helpers", () => {
  it("has no position for a planned project", () => {
    const planned = project({
      id: "p",
      status: "planned",
      orbit: undefined,
      angle: undefined,
    });
    expect(projectPosition(planned)).toBeUndefined();
  });

  it("makes featured planets larger", () => {
    expect(planetRadius(project({ id: "a", featured: true }))).toBe(9);
    expect(planetRadius(project({ id: "b" }))).toBe(6);
  });
});

describe("toPercent", () => {
  it("converts viewBox coordinates to percentages", () => {
    expect(toPercent({ x: 170, y: 115 }, { width: 340, height: 230 })).toEqual({
      x: 50,
      y: 50,
    });
  });
});
