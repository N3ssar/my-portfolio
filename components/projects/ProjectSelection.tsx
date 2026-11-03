"use client";

import { track } from "@vercel/analytics";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ProjectSelection = {
  selectedId: string | undefined;
  select: (id: string) => void;
  showList: boolean;
  setShowList: (showList: boolean) => void;
  highlightedId: string | undefined;
  // Used by "Used in" buttons in Skills: selects or highlights a project and brings it into view.
  showProject: (id: string) => void;
};

const ProjectSelectionContext = createContext<ProjectSelection | null>(null);

export const projectCardId = (id: string) => `project-${id}`;

// Shared by Projects and Skills, so a skill can point at a project.
export function ProjectSelectionProvider({
  defaultSelectedId,
  children,
}: {
  defaultSelectedId: string | undefined;
  children: ReactNode;
}) {
  const [selectedId, setSelectedId] = useState(defaultSelectedId);
  const [showList, setShowListState] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string>();
  const [scrollTarget, setScrollTarget] = useState<{ id: string } | null>(null);

  // Scrolls after React has shown the card, then moves focus there for keyboard users.
  useEffect(() => {
    if (!scrollTarget) return;
    const card = document.getElementById(projectCardId(scrollTarget.id));
    const target = showList ? card : document.getElementById("projects");
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    card?.focus({ preventScroll: true });
  }, [scrollTarget, showList]);

  const value: ProjectSelection = {
    selectedId,
    select: (id) => {
      setSelectedId(id);
      track("project_select", { project: id });
    },
    showList,
    setShowList: (next) => {
      setShowListState(next);
      setHighlightedId(undefined);
    },
    highlightedId,
    showProject: (id) => {
      if (showList) setHighlightedId(id);
      else setSelectedId(id);
      track("project_select", { project: id });
      setScrollTarget({ id });
    },
  };

  return (
    <ProjectSelectionContext.Provider value={value}>{children}</ProjectSelectionContext.Provider>
  );
}

export function useProjectSelection(): ProjectSelection {
  const selection = useContext(ProjectSelectionContext);
  if (!selection) throw new Error("useProjectSelection needs a ProjectSelectionProvider");
  return selection;
}
