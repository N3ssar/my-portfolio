import type { ReactNode } from "react";

// Every card stays in the HTML. Map view shows the selected one, list view shows them all.
export function ProjectList({
  cards,
  selectedId,
  showAll,
}: {
  cards: { id: string; card: ReactNode }[];
  selectedId: string | undefined;
  showAll: boolean;
}) {
  return (
    <ul className="flex min-w-0 flex-col gap-6">
      {cards.map(({ id, card }) => (
        <li
          key={id}
          hidden={!showAll && id !== selectedId}
          data-selected={!showAll && id === selectedId}
          className="group"
        >
          {card}
        </li>
      ))}
    </ul>
  );
}
