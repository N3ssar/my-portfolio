"use client";

import { useNow } from "./useNow";

export function CopyrightYear({ name }: { name: string }) {
  const now = useNow();
  return <span>© {now === null ? "" : `${new Date(now).getFullYear()} `}{name}</span>;
}
