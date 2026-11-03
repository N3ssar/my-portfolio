"use client";

import { track } from "@vercel/analytics";
import { Link, usePathname } from "@/i18n/navigation";

// Opens Fast mode, or leads back to the full site when already in it.
export function FastModeButton({ label, backLabel }: { label: string; backLabel: string }) {
  const onFastMode = usePathname() === "/fast";

  return (
    <Link
      href={onFastMode ? "/" : "/fast"}
      onClick={() => {
        if (!onFastMode) track("fast_mode_open");
      }}
      className="btn btn-outline btn-sm"
    >
      {onFastMode ? backLabel : label}
    </Link>
  );
}
