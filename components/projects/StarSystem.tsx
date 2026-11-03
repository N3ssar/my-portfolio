"use client";

import { animate } from "motion/mini";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Project } from "@/content/projects";
import { INTRO_EVENT } from "@/lib/intro";
import {
  driftPeriodMs,
  driftTransforms,
  estimateLabelWidth,
  labelSide,
  ORBIT_RADII,
  planetRadius,
  projectPosition,
  STAR_SYSTEM_VIEWBOX,
  SUN,
} from "@/lib/orbit";
import { atPoint, labelStyle } from "../mapPlacement";

const MOTION_QUERY =
  "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const SELECTED_RING_GAP = 4;
const VIEW_BOX = `0 0 ${STAR_SYSTEM_VIEWBOX.width} ${STAR_SYSTEM_VIEWBOX.height}`;

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
  const canDrift = useSyncExternalStore(
    subscribeToMotionQuery,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );
  const [sunIntro, setSunIntro] = useState(false);
  const hovered = useRef(false);
  const focused = useRef(false);
  const layers = useRef(new Map<string, HTMLDivElement>());
  const drifts = useRef<ReturnType<typeof animate>[]>([]);

  function syncDrift() {
    for (const drift of drifts.current) {
      if (hovered.current || focused.current) drift.pause();
      else drift.play();
    }
  }

  // The browser runs these transforms on the compositor, so React never renders per frame.
  useEffect(() => {
    if (!canDrift) return;
    drifts.current = planets.flatMap(({ project }, index) => {
      const layer = layers.current.get(project.id);
      const transforms = driftTransforms(project, index);
      if (!layer || !transforms) return [];
      return [
        animate(
          layer,
          { transform: transforms },
          { duration: driftPeriodMs(index) / 1000, ease: "linear", repeat: Infinity },
        ),
      ];
    });
    return () => {
      drifts.current.forEach((drift) => drift.cancel());
      drifts.current = [];
    };
  }, [canDrift, planets]);

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
      onPointerEnter={() => {
        hovered.current = true;
        syncDrift();
      }}
      onPointerLeave={() => {
        hovered.current = false;
        syncDrift();
      }}
      onFocusCapture={() => {
        focused.current = true;
        syncDrift();
      }}
      onBlurCapture={() => {
        focused.current = false;
        syncDrift();
      }}
    >
      <svg aria-hidden="true" viewBox={VIEW_BOX} className="absolute inset-0 size-full overflow-visible">
        {Object.values(ORBIT_RADII).map((radius) => (
          <circle key={radius} cx={SUN.x} cy={SUN.y} r={radius} fill="none" stroke="var(--border)" strokeWidth="1" />
        ))}
        <g
          className={sunIntro ? "sun-intro" : undefined}
          onAnimationEnd={() => setSunIntro(false)}
        >
          <circle cx={SUN.x} cy={SUN.y} r={SUN.r + 6} fill="var(--accent)" opacity="0.18" />
          <circle cx={SUN.x} cy={SUN.y} r={SUN.r} fill="var(--accent)" />
        </g>
      </svg>
      <span
        aria-hidden="true"
        dir="auto"
        style={{ ...atPoint(SUN, STAR_SYSTEM_VIEWBOX), transform: "translate(-50%, -50%)" }}
        className="pointer-events-none absolute text-[13px] leading-none text-accent-ink"
      >
        {sunLabel}
      </span>

      {planets.map(({ project, name }) => {
        const point = projectPosition(project);
        if (!point) return null;
        const radius = planetRadius(project);
        const color = project.featured ? "var(--text)" : "var(--text-soft)";
        const inProgress = project.status === "in-progress";
        const side = labelSide(point, radius, estimateLabelWidth(name));
        return (
          <div
            key={project.id}
            ref={(node) => {
              if (node) layers.current.set(project.id, node);
              else layers.current.delete(project.id);
            }}
            style={{ willChange: canDrift ? "transform" : undefined }}
            className="pointer-events-none absolute inset-0"
          >
            <svg aria-hidden="true" viewBox={VIEW_BOX} className="absolute inset-0 size-full overflow-visible">
              <g transform={`translate(${point.x} ${point.y})`}>
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
              </g>
            </svg>
            <span
              aria-hidden="true"
              dir="auto"
              style={labelStyle(point, radius, side, STAR_SYSTEM_VIEWBOX)}
              className="absolute text-[13px] leading-[18px] whitespace-nowrap text-text-soft"
            >
              {name}
            </span>
            <button
              type="button"
              aria-label={name}
              aria-pressed={selectedId === project.id}
              onClick={() => onSelect(project.id)}
              style={atPoint(point, STAR_SYSTEM_VIEWBOX)}
              className="pointer-events-auto absolute size-11 -translate-1/2 cursor-pointer rounded-full"
            />
          </div>
        );
      })}
    </div>
  );
}
