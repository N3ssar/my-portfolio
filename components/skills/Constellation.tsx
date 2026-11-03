"use client";

import { useState, type CSSProperties } from "react";
import type { Edge } from "@/lib/constellation";
import { CONSTELLATION_CENTER, CONSTELLATION_VIEWBOX } from "@/lib/constellation";
import { estimateLabelWidth, labelSide } from "@/lib/orbit";
import { atPoint, labelStyle } from "../mapPlacement";

const SELECTED_RING_GAP = 4;

// The position in the constellation's entrance sequence.
const order = (i: number) => ({ "--i": i }) as CSSProperties;
const VIEW_BOX = `0 0 ${CONSTELLATION_VIEWBOX.width} ${CONSTELLATION_VIEWBOX.height}`;

export type Star = {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  learning: boolean;
};

export function Constellation({
  stars,
  edges,
  selectedId,
  onSelect,
}: {
  stars: Star[];
  edges: Edge[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  const byId = new Map(stars.map((star) => [star.id, star]));
  const [activeId, setActiveId] = useState<string>();

  return (
    // Like the star system, the constellation is never mirrored in RTL.
    <div dir="ltr" className="relative aspect-340/260 w-full">
      <svg aria-hidden="true" viewBox={VIEW_BOX} className="absolute inset-0 size-full overflow-visible">
        {edges.map(({ from, to }, index) => {
          const a = byId.get(from);
          const b = byId.get(to);
          if (!a || !b) return null;
          return (
            <line
              key={`${from}-${to}`}
              className="edge-line"
              style={order(index)}
              pathLength={1}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--border)"
              strokeWidth="1"
            />
          );
        })}
        {stars.map((star, index) => (
          <g key={star.id} transform={`translate(${star.x} ${star.y})`}>
            <g className="star-pop" style={order(index)}>
            {selectedId === star.id && (
              <>
                <circle r={star.radius + SELECTED_RING_GAP} fill="var(--accent)" opacity="0.18" />
                <circle
                  r={star.radius + SELECTED_RING_GAP}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1"
                />
              </>
            )}
            <circle
              className="map-node"
              data-active={activeId === star.id}
              r={star.radius}
              fill={star.learning ? "var(--bg)" : "var(--text)"}
              stroke={star.learning ? "var(--text)" : "none"}
              strokeWidth="1"
            />
            </g>
          </g>
        ))}
      </svg>

      {stars.map((star, index) => {
        const side = labelSide(star, star.radius, estimateLabelWidth(star.label), CONSTELLATION_CENTER);
        return (
          <span
            key={star.id}
            aria-hidden="true"
            style={{ ...labelStyle(star, star.radius, side, CONSTELLATION_VIEWBOX), ...order(index) }}
            className="star-label pointer-events-none absolute text-[13px] leading-[18px] whitespace-nowrap text-text-soft"
          >
            {star.label}
          </span>
        );
      })}
      {stars.map((star) => (
        <button
          key={star.id}
          type="button"
          aria-label={star.label}
          aria-pressed={selectedId === star.id}
          onClick={() => onSelect(star.id)}
          onPointerEnter={() => setActiveId(star.id)}
          onPointerLeave={() => setActiveId(undefined)}
          onFocus={(event) => {
            if (event.currentTarget.matches(":focus-visible")) setActiveId(star.id);
          }}
          onBlur={() => setActiveId(undefined)}
          style={atPoint(star, CONSTELLATION_VIEWBOX)}
          className="absolute size-11 -translate-1/2 cursor-pointer rounded-full"
        />
      ))}
    </div>
  );
}
