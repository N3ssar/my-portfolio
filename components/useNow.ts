"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, MINUTE);
  return () => clearInterval(timer);
}

// The current time, rounded to the minute, or null during server rendering.
// Dates are never computed in the prerendered shell, so nothing goes stale or mismatches on hydration.
export function useNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / MINUTE) * MINUTE,
    () => null,
  );
}
