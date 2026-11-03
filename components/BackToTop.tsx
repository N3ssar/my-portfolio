"use client";

import { useEffect, useState } from "react";

// Floating, icon-only button at the bottom end corner. Shows after about one viewport of scrolling.
export function BackToTop({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function update() {
      setVisible(window.scrollY > window.innerHeight);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  function scrollToTop() {
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
    document.getElementById("main")?.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={label}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))] end-[max(1rem,env(safe-area-inset-left),env(safe-area-inset-right))] z-40 flex size-11 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-text hover:text-accent motion-safe:transition-[opacity,visibility] motion-safe:duration-200 motion-safe:ease-out ${visible ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 13V3M4 7l4-4 4 4" />
      </svg>
    </button>
  );
}
