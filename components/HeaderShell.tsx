"use client";

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";

const SCROLL_THRESHOLD = 8;
const ALWAYS_VISIBLE_UNTIL = 64;

type Anchor = { id: string; label: string };

export function HeaderShell({
  logo,
  actions,
  anchors,
  menuLabel,
  closeLabel,
}: {
  logo: ReactNode;
  actions: ReactNode;
  anchors: Anchor[];
  menuLabel: string;
  closeLabel: string;
}) {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < SCROLL_THRESHOLD) return;
      setHidden(y > lastY && y > ALWAYS_VISIBLE_UNTIL);
      lastY = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          setActiveId((current) => {
            if (isIntersecting) return target.id;
            return current === target.id ? null : current;
          });
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const { id } of anchors) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [anchors]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Routes stay mounted but hidden after navigation, so close the menu when hidden.
  useLayoutEffect(() => () => setMenuOpen(false), []);

  const anchorLinks = (linkClass: string, onNavigate?: () => void) =>
    anchors.map(({ id, label }) => (
      <Link
        key={id}
        href={`/#${id}`}
        onClick={onNavigate}
        aria-current={activeId === id ? "location" : undefined}
        className={`${linkClass} ${activeId === id ? "underline decoration-accent decoration-2 underline-offset-8" : ""}`}
      >
        {label}
      </Link>
    ));

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur focus-within:translate-y-0 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out ${hidden && !menuOpen ? "-translate-y-full" : ""}`}
    >
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6">
        {logo}
        <nav className="hidden items-center gap-6 lg:flex">
          {anchorLinks("text-sm text-text-soft hover:text-accent")}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {actions}
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? closeLabel : menuLabel}
            onClick={() => setMenuOpen((open) => !open)}
            className="btn btn-outline btn-sm w-11 px-0 lg:hidden"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d={menuOpen ? "M3 3l10 10M13 3L3 13" : "M2 4h12M2 8h12M2 12h12"} />
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav
          id="mobile-menu"
          className="absolute inset-x-0 top-full flex flex-col border-b border-border bg-bg px-4 py-2 sm:px-6 lg:hidden"
        >
          {anchorLinks("py-3 text-text-soft hover:text-accent", () => setMenuOpen(false))}
        </nav>
      )}
    </header>
  );
}
