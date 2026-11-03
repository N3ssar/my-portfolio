"use client";

import { useEffect, useState, type ReactNode } from "react";

const COPIED_MS = 2000;

export function CopyButton({
  text,
  label,
  copiedLabel,
  className,
  children,
}: {
  text: string;
  label: string;
  copiedLabel: string;
  className?: string;
  // Shown before the label, for example an icon and a name in a contact row.
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard access can be blocked. The text stays visible, so it can be copied by hand.
    }
  }

  return (
    <button type="button" onClick={copy} className={className}>
      {children}
      <span aria-live="polite" className="inline-flex min-w-8 justify-end text-accent">
        {copied ? (
          <>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M3 8.5l3 3 7-7" />
            </svg>
            <span className="sr-only">{copiedLabel}</span>
          </>
        ) : (
          label
        )}
      </span>
    </button>
  );
}
