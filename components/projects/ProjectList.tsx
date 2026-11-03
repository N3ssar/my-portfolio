import type { ReactNode } from "react";
import { projectCardId } from "./ProjectSelection";

// Every card stays in the HTML. Map view shows the selected one, list view shows them all.
export function ProjectList({
  cards,
  selectedId,
  highlightedId,
  showAll,
}: {
  cards: { id: string; card: ReactNode }[];
  selectedId: string | undefined;
  highlightedId: string | undefined;
  showAll: boolean;
}) {
  return (
    <ul className="flex min-w-0 flex-col gap-6">
      {cards.map(({ id, card }) => (
        <li
          key={id}
          id={projectCardId(id)}
          tabIndex={-1}
          hidden={!showAll && id !== selectedId}
          data-selected={!showAll && id === selectedId}
          data-highlighted={showAll && id === highlightedId}
          className="group card-in relative scroll-mt-20 rounded-xl outline-offset-4 data-[highlighted=true]:outline data-[highlighted=true]:outline-1 data-[highlighted=true]:outline-accent"
        >
          {card}
        </li>
      ))}
    </ul>
  );
}
