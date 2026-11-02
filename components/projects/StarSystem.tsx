"use client";

import { useAnimationFrame } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Project } from "@/content/projects";
import { INTRO_EVENT } from "@/lib/intro";
import {
  ORBIT_RADII,
  orbitPositionAt,
  planetRadius,
  projectPosition,
  STAR_SYSTEM_VIEWBOX,
  SUN,
  toPercent,
  type Point,
} from "@/lib/orbit";

const MOTION_QUERY =
  "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const MAX_FRAME_MS = 100;
const SELECTED_RING_GAP = 4;
const LABEL_GAP = 13;

export type Planet = { project: Project; name: string };

function subscribeToMotionQuery(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function StarSystem({
  planets,
  sunLabel,
  selectedId,
  onSelect,
}: {
  planets: Planet[];
  sunLabel: string;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  const canOrbit = useSyncExternalStore(
    subscribeToMotionQuery,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );
  const [sunIntro, setSunIntro] = useState(false);
  const elapsedMs = useRef(0);
  const hovered = useRef(false);
  const focused = useRef(false);
  const groups = useRef(new Map<string, SVGGElement>());
  const buttons = useRef(new Map<string, HTMLButtonElement>());

  function placePlanets() {
    for (const { project } of planets) {
      if (project.orbit === undefined || project.angle === undefined) continue;
      const point = orbitPositionAt(project.orbit, project.angle, elapsedMs.current);
      const percent = toPercent(point, STAR_SYSTEM_VIEWBOX);
      groups.current.get(project.id)?.setAttribute("transform", translate(point));
      const button = buttons.current.get(project.id);
      if (button) {
        button.style.left = `${percent.x}%`;
        button.style.top = `${percent.y}%`;
      }
    }
  }

  useAnimationFrame((_, delta) => {
    if (!canOrbit || hovered.current || focused.current) return;
    elapsedMs.current += Math.min(delta, MAX_FRAME_MS);
    placePlanets();
  });

  // Back to the static map when the screen stops qualifying for motion.
  useEffect(() => {
    if (canOrbit) return;
    elapsedMs.current = 0;
    placePlanets();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- placePlanets only reads refs and planets.
  }, [canOrbit]);

  useEffect(() => {
    const playIntro = () => setSunIntro(true);
    window.addEventListener(INTRO_EVENT, playIntro);
    return () => window.removeEventListener(INTRO_EVENT, playIntro);
  }, []);

  return (
    // The map is never mirrored in RTL, only its labels follow the language.
    <div
      dir="ltr"
      className="relative aspect-340/230 w-full"
      onPointerEnter={() => (hovered.current = true)}
      onPointerLeave={() => (hovered.current = false)}
      onFocusCapture={() => (focused.current = true)}
      onBlurCapture={() => (focused.current = false)}
    >
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${STAR_SYSTEM_VIEWBOX.width} ${STAR_SYSTEM_VIEWBOX.height}`}
        className="absolute inset-0 size-full overflow-visible"
      >
        {Object.values(ORBIT_RADII).map((radius) => (
          <circle key={radius} cx={SUN.x} cy={SUN.y} r={radius} fill="none" stroke="var(--border)" strokeWidth="1" />
        ))}
        <g
          className={sunIntro ? "sun-intro" : undefined}
          onAnimationEnd={() => setSunIntro(false)}
        >
          <circle cx={SUN.x} cy={SUN.y} r={SUN.r + 6} fill="var(--accent)" opacity="0.18" />
          <circle cx={SUN.x} cy={SUN.y} r={SUN.r} fill="var(--accent)" />
          <text
            x={SUN.x}
            y={SUN.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="13"
            fill="var(--accent-ink)"
          >
            {sunLabel}
          </text>
        </g>
        {planets.map(({ project, name }) => {
          const point = projectPosition(project);
          if (!point) return null;
          const radius = planetRadius(project);
          const color = project.featured ? "var(--text)" : "var(--text-soft)";
          const inProgress = project.status === "in-progress";
          return (
            <g
              key={project.id}
              transform={translate(point)}
              ref={(node) => {
                if (node) groups.current.set(project.id, node);
                else groups.current.delete(project.id);
              }}
            >
              {selectedId === project.id && (
                <>
                  <circle r={radius + SELECTED_RING_GAP} fill="var(--accent)" opacity="0.18" />
                  <circle r={radius + SELECTED_RING_GAP} fill="none" stroke="var(--accent)" strokeWidth="1" />
                </>
              )}
              <circle
                r={radius}
                fill={inProgress ? "none" : color}
                stroke={inProgress ? color : "none"}
                strokeWidth="1"
                strokeDasharray={inProgress ? "2 2" : undefined}
              />
              <text
                y={radius + LABEL_GAP}
                textAnchor="middle"
                fontSize="13"
                fill="var(--text-soft)"
              >
                {name}
              </text>
            </g>
          );
        })}
      </svg>
      {planets.map(({ project, name }) => {
        const point = projectPosition(project);
        if (!point) return null;
        const percent = toPercent(point, STAR_SYSTEM_VIEWBOX);
        return (
          <button
            key={project.id}
            type="button"
            aria-label={name}
            aria-pressed={selectedId === project.id}
            onClick={() => onSelect(project.id)}
            style={{ left: `${percent.x}%`, top: `${percent.y}%` }}
            className="absolute size-11 -translate-1/2 cursor-pointer rounded-full"
            ref={(node) => {
              if (node) buttons.current.set(project.id, node);
              else buttons.current.delete(project.id);
            }}
          />
        );
      })}
    </div>
  );
}

function translate({ x, y }: Point) {
  return `translate(${x} ${y})`;
}
