"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO_EVENT } from "@/lib/intro";

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

// Resolves once the hero card's CSS entrance has finished (at once if it already has).
function cardSettled(element: Element) {
  const card = element.closest(".hero-card");
  const running = card?.getAnimations().filter((animation) => animation.playState !== "finished") ?? [];
  return Promise.all(running.map((animation) => animation.finished)).catch(() => undefined);
}

// Renders the final status on the server. The countdown only runs after mount, and only
// once the Explorer ID card has settled, so it never competes with the hero entrance.
export function ExplorerStatus({
  status,
  countdown,
}: {
  status: string;
  countdown: string[];
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    void cardSettled(ref.current!).then(() => {
      // Checked here so React's double effect run in development can't use up the intro.
      if (cancelled || !shouldPlayIntro()) return;
      window.dispatchEvent(new Event(INTRO_EVENT));
      setStep(0);
      for (let next = 1; next <= countdown.length; next++) {
        timers.push(setTimeout(() => setStep(next), next * STEP_MS));
      }
    });
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      setStep(null);
    };
  }, [countdown.length]);

  // A fixed-width box, so the changing text never moves anything (in either font).
  return (
    <span ref={ref} aria-hidden="true" className="inline-block w-14 text-end font-mono text-xs text-accent">
      {/* Keyed, so each step is a new node rather than the same text changing size in place. */}
      <bdi key={step ?? "status"}>{step === null ? status : (countdown[step] ?? status)}</bdi>
    </span>
  );
}
