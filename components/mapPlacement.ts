import type { CSSProperties } from "react";
import { LABEL_GAP, toPercent, type LabelSide, type Point } from "@/lib/orbit";

type ViewBox = { width: number; height: number };

const LABEL_TRANSFORMS: Record<LabelSide, string> = {
  start: "translate(-100%, -50%)",
  end: "translateY(-50%)",
  above: "translate(-50%, -100%)",
  below: "translateX(-50%)",
};

// Places an HTML element over an SVG map, at a point in the map's viewBox.
export function atPoint(point: Point, viewBox: ViewBox): CSSProperties {
  const percent = toPercent(point, viewBox);
  return { left: `${percent.x}%`, top: `${percent.y}%` };
}

// Places a label next to a planet or star, on the given side.
export function labelStyle(
  point: Point,
  radius: number,
  side: LabelSide,
  viewBox: ViewBox,
): CSSProperties {
  const offset = radius + LABEL_GAP;
  const anchor = {
    start: { x: point.x - offset, y: point.y },
    end: { x: point.x + offset, y: point.y },
    above: { x: point.x, y: point.y - offset },
    below: { x: point.x, y: point.y + offset },
  }[side];
  return { ...atPoint(anchor, viewBox), transform: LABEL_TRANSFORMS[side] };
}
