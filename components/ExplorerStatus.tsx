"use client";

import { useEffect, useState } from "react";

const INTRO_SEEN_KEY = "mn_intro_seen";
const STEP_MS = 300;

function shouldPlayIntro() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    if (sessionStorage.getItem(INTRO_SEEN_KEY)) return false;
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

// Renders the final status on the server. The countdown only runs after mount.
export function ExplorerStatus({
  status,
  countdown,
}: {
  status: string;
  countdown: string[];
}) {
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    // Checked inside a timer so React's double effect run in development can't use up the intro.
    const timers = [
      setTimeout(() => {
        if (!shouldPlayIntro()) return;
        setStep(0);
        for (let next = 1; next <= countdown.length; next++) {
          timers.push(setTimeout(() => setStep(next), next * STEP_MS));
        }
      }, 0),
    ];
    return () => {
      timers.forEach(clearTimeout);
      setStep(null);
    };
  }, [countdown.length]);

  return (
    <span aria-hidden="true" className="font-mono text-xs text-accent">
      <bdi>{step === null ? status : (countdown[step] ?? status)}</bdi>
    </span>
  );
}
