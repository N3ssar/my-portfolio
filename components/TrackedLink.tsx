"use client";

import { track } from "@vercel/analytics";
import type { AnchorHTMLAttributes } from "react";

// A plain link that also records an analytics event when clicked. Events carry no personal data.
export function TrackedLink({
  event,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { event: string }) {
  return <a {...props} onClick={() => track(event)} />;
}
