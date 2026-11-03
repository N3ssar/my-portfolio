import { describe, expect, it } from "vitest";
import {
  driftPeriodMs,
  driftTransforms,
  labelSide,
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

describe("driftTransforms", () => {
  const planet = project({ id: "a", orbit: 2, angle: 30 });

  it("loops back to where it started", () => {
    const transforms = driftTransforms(planet, 3)!;
    expect(transforms.at(-1)).toBe(transforms[0]);
  });

  it("starts from a different phase for each planet", () => {
    expect(driftTransforms(planet, 1)![0]).not.toBe(driftTransforms(planet, 2)![0]);
  });

  it("has no drift for a planned project", () => {
    const planned = project({ id: "p", status: "planned", orbit: undefined, angle: undefined });
    expect(driftTransforms(planned, 0)).toBeUndefined();
  });

  it("gives each planet its own period", () => {
    expect(driftPeriodMs(0)).not.toBe(driftPeriodMs(1));
  });
});

describe("labelSide", () => {
  it("faces away from the sun", () => {
    expect(labelSide({ x: SUN.x + 60, y: SUN.y + 5 }, 6, 40)).toBe("end");
    expect(labelSide({ x: SUN.x - 60, y: SUN.y + 5 }, 6, 40)).toBe("start");
    expect(labelSide({ x: SUN.x + 5, y: SUN.y - 60 }, 6, 40)).toBe("above");
    expect(labelSide({ x: SUN.x + 5, y: SUN.y + 60 }, 6, 40)).toBe("below");
  });

  it("moves above or below when the label wouldn't fit beside the planet", () => {
    expect(labelSide({ x: 300, y: SUN.y + 10 }, 6, 100)).toBe("below");
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
