"use client";

import { useEffect } from "react";

// Fades sections in once as they scroll into view. Content is visible by default:
// only sections that start below the fold are hidden, and only once JavaScript runs
// with motion allowed. Sections already on screen, or above it, are never hidden.
export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const reveal = (element: Element) => {
      element.classList.remove("reveal-pending");
      element.classList.add("reveal-in");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    for (const element of document.querySelectorAll("[data-reveal]:not(.reveal-in)")) {
      // Where the section's content starts: when only its top padding is on screen,
      // nothing visible is hidden, so it still waits to reveal.
      const contentTop = element.getBoundingClientRect().top + parseFloat(getComputedStyle(element).paddingTop);
      if (contentTop < window.innerHeight) {
        // Already reached: never leave it hidden.
        if (element.classList.contains("reveal-pending")) reveal(element);
        continue;
      }
      element.classList.add("reveal-pending");
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
