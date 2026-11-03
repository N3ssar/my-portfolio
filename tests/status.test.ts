import { describe, expect, it } from "vitest";
import {
  defaultSelectedProject,
  effectiveUsedIn,
  isVisibleLink,
  learningSkills,
  projectsByStatus,
  rightNowRows,
  skillGroups,
  starSkills,
  topProjects,
  visibleProjects,
} from "@/lib/status";
import { project, skill } from "./fixtures";

describe("isVisibleLink", () => {
  it("hides TODO and null links", () => {
    expect(isVisibleLink("TODO")).toBe(false);
    expect(isVisibleLink(null)).toBe(false);
  });

  it("shows a real URL", () => {
    expect(isVisibleLink("https://example.com")).toBe(true);
  });
});

describe("project helpers", () => {
  const done = project({ id: "done" });
  const featuredDone = project({ id: "featured-done", featured: true });
  const featuredBuilding = project({
    id: "featured-building",
    featured: true,
    status: "in-progress",
  });
  const planned = project({ id: "planned", status: "planned" });
  const all = [featuredBuilding, done, planned, featuredDone];

  it("groups projects per status in array order", () => {
    expect(projectsByStatus(all, "done")).toEqual([done, featuredDone]);
    expect(projectsByStatus(all, "in-progress")).toEqual([featuredBuilding]);
    expect(projectsByStatus(all, "planned")).toEqual([planned]);
  });

  it("excludes planned projects from the visible list", () => {
    expect(visibleProjects(all)).toEqual([featuredBuilding, done, featuredDone]);
  });

  it("selects the first featured done project by default", () => {
    expect(defaultSelectedProject(all)).toBe(featuredDone);
    expect(defaultSelectedProject([done, planned])).toBeUndefined();
  });

  it("limits top projects to featured done projects", () => {
    const others = ["a", "b", "c"].map((id) => project({ id, featured: true }));
    expect(topProjects(all)).toEqual([featuredDone]);
    expect(topProjects([...others, featuredDone])).toEqual(others);
  });
});

describe("skill helpers", () => {
  const core = skill({ id: "core", star: true });
  const learning = skill({ id: "learning", status: "learning", group: "backend" });
  const studied = skill({
    id: "studied",
    status: "studied",
    group: "university",
    star: true,
  });
  const tool = skill({ id: "tool", group: "tools" });

  it("moves learning skills out of their group", () => {
    const groups = skillGroups([core, learning, studied, tool]);
    expect(groups.map(({ key }) => key)).toEqual([
      "frontend",
      "tools",
      "learning",
      "university",
    ]);
    expect(groups.find(({ key }) => key === "learning")?.skills).toEqual([learning]);
  });

  it("keeps the required group order and leaves out empty groups", () => {
    const groups = skillGroups([
      skill({ id: "s", status: "studied", group: "university" }),
      skill({ id: "d", group: "design" }),
      skill({ id: "b", group: "backend" }),
    ]);
    expect(groups.map(({ key }) => key)).toEqual(["backend", "design", "university"]);
  });

  it("lists learning skills", () => {
    expect(learningSkills([core, learning])).toEqual([learning]);
  });

  it("never makes a studied skill a star", () => {
    expect(starSkills([core, studied, tool])).toEqual([core]);
  });

  it("only counts done and in-progress projects in usedIn", () => {
    const projects = [
      project({ id: "a" }),
      project({ id: "b", status: "in-progress" }),
      project({ id: "c", status: "planned" }),
    ];
    const used = skill({ id: "used", usedIn: ["a", "b", "c", "unknown"] });
    expect(effectiveUsedIn(used, projects)).toEqual(["a", "b"]);
    expect(effectiveUsedIn(core, projects)).toEqual([]);
  });
});

describe("rightNowRows", () => {
  const projects = [
    project({ id: "one", status: "in-progress" }),
    project({ id: "two", status: "in-progress" }),
    project({ id: "three", status: "planned" }),
    project({ id: "four" }),
  ];
  const skills = [
    skill({ id: "a", label: "A", status: "learning" }),
    skill({ id: "b", label: "B", status: "learning" }),
    skill({ id: "c", label: "C" }),
  ];
  const input = {
    projects,
    skills,
    locale: "en",
    projectText: (id: string) => ({ name: id.toUpperCase(), summary: `About ${id}` }),
    lookingFor: "A role",
    updated: "June",
  };

  it("computes every row from status", () => {
    expect(rightNowRows(input)).toEqual([
      { key: "building", values: ["ONE and TWO"], comingSoon: false },
      { key: "learning", values: ["A and B"], comingSoon: false },
      { key: "next", values: ["THREE: About three"], comingSoon: false },
      { key: "looking", values: ["A role"], comingSoon: false },
      { key: "updated", values: ["June"], comingSoon: false },
    ]);
  });

  it("formats lists for the locale", () => {
    const building = rightNowRows({ ...input, locale: "ar" }).find(
      ({ key }) => key === "building",
    );
    expect(building?.values).toEqual([
      new Intl.ListFormat("ar", { style: "long", type: "conjunction" }).format([
        "ONE",
        "TWO",
      ]),
    ]);
  });

  it("hides rows with nothing to show", () => {
    const keys = rightNowRows({
      ...input,
      projects: [],
      skills: [],
      lookingFor: "",
    }).map(({ key }) => key);
    expect(keys).toEqual(["updated"]);
  });

  it("flags a TODO value as coming soon", () => {
    const updated = rightNowRows({ ...input, updated: "TODO" }).find(
      ({ key }) => key === "updated",
    );
    expect(updated).toEqual({ key: "updated", values: [], comingSoon: true });
  });
});
