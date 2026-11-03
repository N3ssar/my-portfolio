import type { ReactNode } from "react";

export function StatusPill({
  children,
  dot = false,
  className = "inline-flex",
}: {
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`${className} items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm whitespace-nowrap text-text-soft`}
    >
      {dot && <span aria-hidden="true" className="size-2 rounded-full bg-accent" />}
      {children}
    </span>
  );
}
