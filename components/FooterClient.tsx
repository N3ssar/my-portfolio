"use client";

import { useLocale } from "next-intl";
import { relativeTime } from "@/lib/time";
import { useNow } from "./useNow";

export function CopyrightYear({ name }: { name: string }) {
  const now = useNow();
  return <span>© {now === null ? "" : `${new Date(now).getFullYear()} `}{name}</span>;
}

export function LastActivity({ pushedAt, label }: { pushedAt: string; label: string }) {
  const now = useNow();
  const locale = useLocale();
  if (now === null) return null;
  return (
    <p className="text-text-muted">
      {label}: {relativeTime(pushedAt, now, locale)}
    </p>
  );
}

export function BackToTop({ label }: { label: string }) {
  function scrollToTop() {
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
    document.getElementById("main")?.focus({ preventScroll: true });
  }

  return (
    <button type="button" onClick={scrollToTop} className="btn btn-outline btn-sm">
      {label}
    </button>
  );
}
