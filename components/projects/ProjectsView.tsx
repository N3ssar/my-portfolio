"use client";

import { useState, type ReactNode } from "react";
import { ProjectList } from "./ProjectList";
import { StarSystem, type Planet } from "./StarSystem";

export function ProjectsView({
  planets,
  cards,
  defaultSelectedId,
  sunLabel,
  listViewLabel,
  mapViewLabel,
}: {
  planets: Planet[];
  cards: { id: string; card: ReactNode }[];
  defaultSelectedId: string | undefined;
  sunLabel: string;
  listViewLabel: string;
  mapViewLabel: string;
}) {
  const [selectedId, setSelectedId] = useState(defaultSelectedId);
  const [showList, setShowList] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowList((current) => !current)}
        className="btn btn-outline btn-sm mt-4"
      >
        {showList ? mapViewLabel : listViewLabel}
      </button>
      <div
        className={`mt-8 grid items-start gap-8 ${showList ? "" : "lg:grid-cols-[3fr_2fr]"}`}
      >
        {!showList && (
          <StarSystem
            planets={planets}
            sunLabel={sunLabel}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}
        <ProjectList cards={cards} selectedId={selectedId} showAll={showList} />
      </div>
    </>
  );
}
