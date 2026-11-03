"use client";

import type { ReactNode } from "react";
import { ProjectList } from "./ProjectList";
import { useProjectSelection } from "./ProjectSelection";
import { StarSystem, type Planet } from "./StarSystem";

export function ProjectsView({
  planets,
  cards,
  sunLabel,
  listViewLabel,
  mapViewLabel,
}: {
  planets: Planet[];
  cards: { id: string; card: ReactNode }[];
  sunLabel: string;
  listViewLabel: string;
  mapViewLabel: string;
}) {
  const { selectedId, select, showList, setShowList, highlightedId } = useProjectSelection();

  return (
    <>
      <button
        type="button"
        onClick={() => setShowList(!showList)}
        className="btn btn-outline btn-sm mt-4"
      >
        {showList ? mapViewLabel : listViewLabel}
      </button>
      <div
        className={`mt-8 grid items-start gap-8 ${showList ? "" : "lg:grid-cols-[3fr_2fr]"}`}
      >
        {!showList && (
          <div className="lg:sticky lg:top-20">
            <StarSystem
              planets={planets}
              sunLabel={sunLabel}
              selectedId={selectedId}
              onSelect={select}
            />
          </div>
        )}
        <ProjectList
          cards={cards}
          selectedId={selectedId}
          highlightedId={highlightedId}
          showAll={showList}
        />
      </div>
    </>
  );
}
