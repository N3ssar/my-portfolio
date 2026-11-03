"use client";

import type { MouseEvent } from "react";
import { useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

export function LangToggle({ label }: { label: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const otherLocale = locale === "ar" ? "en" : "ar";

  // The hash only exists in the browser, so it is added when the link is clicked.
  function switchLocale(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    router.replace(`${pathname}${window.location.hash}`, { locale: otherLocale });
  }

  return (
    <Link
      href={pathname}
      locale={otherLocale}
      lang={otherLocale}
      onClick={switchLocale}
      className="btn btn-outline btn-sm"
    >
      {label}
    </Link>
  );
}
