"use client";

import { useState, type ReactNode } from "react";
import type { Edge } from "@/lib/constellation";
import { Constellation, type Star } from "./Constellation";

export function SkillsView({
  stars,
  edges,
  cards,
  groups,
  listViewLabel,
  mapViewLabel,
}: {
  stars: Star[];
  edges: Edge[];
  cards: { id: string; card: ReactNode }[];
  groups: ReactNode;
  listViewLabel: string;
  mapViewLabel: string;
}) {
  const [selectedId, setSelectedId] = useState(stars[0]?.id);
  const [showList, setShowList] = useState(false);

  return (
    <>
      {stars.length > 0 && (
        <button
          type="button"
          onClick={() => setShowList((current) => !current)}
          className="btn btn-outline btn-sm mt-4"
        >
          {showList ? mapViewLabel : listViewLabel}
        </button>
      )}
      {/* Every card stays in the HTML. The map shows the selected one; list view shows only the groups. */}
      <div
        hidden={showList || stars.length === 0}
        className="mt-8 grid items-start gap-8 lg:grid-cols-[3fr_2fr]"
      >
        <div className="lg:sticky lg:top-20">
          <Constellation
            stars={stars}
            edges={edges}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
        <ul className="min-w-0">
          {cards.map(({ id, card }) => (
            <li key={id} hidden={id !== selectedId}>
              {card}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-12">{groups}</div>
    </>
  );
}
