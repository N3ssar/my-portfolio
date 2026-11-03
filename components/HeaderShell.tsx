"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";

const SCROLL_THRESHOLD = 8;
const ALWAYS_VISIBLE_UNTIL = 64;
const MENU_LINK_STAGGER_MS = 40;

type Anchor = { id: string; label: string };
type Indicator = { x: number; width: number } | null;

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
  const [indicator, setIndicator] = useState<Indicator>(null);
  const desktopNav = useRef<HTMLElement>(null);

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

  // The active-section underline is one bar that slides to the active link.
  useEffect(() => {
    function measure() {
      const link = activeId
        ? desktopNav.current?.querySelector<HTMLElement>(`[data-anchor="${activeId}"]`)
        : null;
      setIndicator(link ? { x: link.offsetLeft, width: link.offsetWidth } : null);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeId]);

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

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur focus-within:translate-y-0 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out ${hidden && !menuOpen ? "-translate-y-full" : ""}`}
    >
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6">
        {logo}
        <nav ref={desktopNav} className="relative hidden items-center gap-6 lg:flex">
          {anchors.map(({ id, label }) => (
            <Link
              key={id}
              href={`/#${id}`}
              data-anchor={id}
              aria-current={activeId === id ? "location" : undefined}
              className="py-2 text-sm text-text-soft hover:text-accent"
            >
              {label}
            </Link>
          ))}
          {/* Positioned in physical pixels from the nav's left edge, so it works in both directions. */}
          <span
            aria-hidden="true"
            style={{
              left: 0,
              width: 1,
              transform: `translateX(${indicator?.x ?? 0}px) scaleX(${indicator?.width ?? 0})`,
            }}
            className={`absolute bottom-0.5 h-0.5 origin-left bg-accent motion-safe:transition-[transform,opacity] motion-safe:duration-300 motion-safe:ease-out ${indicator ? "opacity-100" : "opacity-0"}`}
          />
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {actions}
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? closeLabel : menuLabel}
            onClick={() => setMenuOpen((open) => !open)}
            className="btn btn-outline btn-sm relative w-11 px-0 lg:hidden"
          >
            {/* Three bars that morph into an X. */}
            {[
              menuOpen ? "translate-y-0 rotate-45" : "-translate-y-[5px]",
              menuOpen ? "scale-x-0 opacity-0" : "",
              menuOpen ? "translate-y-0 -rotate-45" : "translate-y-[5px]",
            ].map((state, index) => (
              <span
                key={index}
                aria-hidden="true"
                className={`absolute h-[1.5px] w-4 rounded-full bg-current motion-safe:transition-[translate,rotate,scale,opacity] motion-safe:duration-200 motion-safe:ease-out ${state}`}
              />
            ))}
          </button>
        </div>
      </div>
      {/* Stays mounted so it can animate out. inert takes it out of the tab order and accessibility tree when closed. */}
      <nav
        id="mobile-menu"
        inert={!menuOpen}
        className={`absolute inset-x-0 top-full flex flex-col border-b border-border bg-bg px-4 py-2 sm:px-6 lg:hidden motion-safe:transition-[opacity,translate,visibility] motion-safe:duration-200 motion-safe:ease-out ${menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}
      >
        {anchors.map(({ id, label }, index) => (
          <Link
            key={id}
            href={`/#${id}`}
            onClick={() => setMenuOpen(false)}
            aria-current={activeId === id ? "location" : undefined}
            style={{ transitionDelay: menuOpen ? `${index * MENU_LINK_STAGGER_MS}ms` : "0ms" }}
            className={`py-3 text-text-soft hover:text-accent aria-[current=location]:text-accent motion-safe:transition-[opacity,translate,color] motion-safe:duration-200 motion-safe:ease-out ${menuOpen ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
