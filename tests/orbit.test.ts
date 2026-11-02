import { describe, expect, it } from "vitest";
import {
  ORBIT_RADII,
  orbitPosition,
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
