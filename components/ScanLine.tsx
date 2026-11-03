"use client";

import { useEffect, useState } from "react";
import { INTRO_EVENT } from "@/lib/intro";

// One thin teal line that sweeps down the Explorer ID card while the launch countdown runs.
// It only appears when the countdown does: first visit per session, with motion allowed.
export function ScanLine() {
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const start = () => setScanning(true);
    window.addEventListener(INTRO_EVENT, start);
    return () => window.removeEventListener(INTRO_EVENT, start);
  }, []);

  if (!scanning) return null;

  return (
    <div
      aria-hidden="true"
      onAnimationEnd={() => setScanning(false)}
      className="scan-line pointer-events-none absolute inset-0"
    >
      <div className="h-px bg-accent" />
    </div>
  );
}
