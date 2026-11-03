"use client";

import { useProjectSelection } from "../projects/ProjectSelection";
import { StatusPill } from "../StatusPill";

export function SkillCard({
  name,
  learningLabel,
  usedInLabel,
  usedIn,
  note,
}: {
  name: string;
  // Set only for skills still being learned.
  learningLabel?: string;
  usedInLabel: string;
  usedIn: { id: string; name: string }[];
  note?: string;
}) {
  const { showProject } = useProjectSelection();

  return (
    <article className="rounded-xl bg-surface p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="me-1 text-base">
          <bdi>{name}</bdi>
        </h3>
        {learningLabel && <StatusPill>{learningLabel}</StatusPill>}
      </div>
      {usedIn.length > 0 && (
        <div className="mt-3">
          <h4 className="font-medium">{usedInLabel}</h4>
          <ul className="mt-2 flex flex-wrap gap-2">
            {usedIn.map((project) => (
              <li key={project.id}>
                <button
                  type="button"
                  onClick={() => showProject(project.id)}
                  className="btn btn-outline btn-sm"
                >
                  {project.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {note && <p className="mt-3 text-text-soft">{note}</p>}
    </article>
  );
}
