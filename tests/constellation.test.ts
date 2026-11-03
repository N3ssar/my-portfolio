import { describe, expect, it } from "vitest";
import { constellationEdges, starRadius } from "@/lib/constellation";
import { project, skill } from "./fixtures";

const projects = [
  project({ id: "a" }),
  project({ id: "b", status: "in-progress" }),
  project({ id: "planned", status: "planned" }),
];

describe("constellationEdges", () => {
  it("connects stars that share a project", () => {
    const skills = [
      skill({ id: "x", star: true, usedIn: ["a"] }),
      skill({ id: "y", star: true, usedIn: ["a", "b"] }),
      skill({ id: "z", star: true, usedIn: ["b"] }),
    ];
    expect(constellationEdges(skills, projects)).toEqual([
      { from: "x", to: "y" },
      { from: "y", to: "z" },
    ]);
  });

  it("ignores planned projects", () => {
    const skills = [
      skill({ id: "x", star: true, usedIn: ["planned"] }),
      skill({ id: "y", star: true, usedIn: ["planned"] }),
    ];
    expect(constellationEdges(skills, projects)).toEqual([]);
  });

  it("creates no duplicate or self edges", () => {
    const skills = [
      skill({ id: "x", star: true, usedIn: ["a", "b"] }),
      skill({ id: "y", star: true, usedIn: ["a", "b"] }),
    ];
    expect(constellationEdges(skills, projects)).toEqual([{ from: "x", to: "y" }]);
  });

  it("ignores skills that are not stars", () => {
    const skills = [
      skill({ id: "x", star: true, usedIn: ["a"] }),
      skill({ id: "y", usedIn: ["a"] }),
      skill({ id: "z", star: true, status: "studied", usedIn: ["a"] }),
    ];
    expect(constellationEdges(skills, projects)).toEqual([]);
  });
});

describe("starRadius", () => {
  it("grows with the number of counted projects", () => {
    const none = skill({ id: "none" });
    const one = skill({ id: "one", usedIn: ["a", "planned"] });
    const two = skill({ id: "two", usedIn: ["a", "b"] });
    expect(starRadius(one, projects)).toBeGreaterThan(starRadius(none, projects));
    expect(starRadius(two, projects)).toBeGreaterThan(starRadius(one, projects));
  });
});
