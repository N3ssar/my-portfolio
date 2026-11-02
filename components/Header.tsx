import { useTranslations } from "next-intl";
import { site } from "@/content/site";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "./BrandMark";
import { FastModeButton } from "./FastModeButton";
import { HeaderShell } from "./HeaderShell";
import { LangToggle } from "./LangToggle";

const ANCHORS = ["projects", "skills", "about", "contact"] as const;

export function Header() {
  const nav = useTranslations("nav");
  const common = useTranslations("common");

  return (
    <HeaderShell
      menuLabel={nav("menu")}
      closeLabel={common("close")}
      anchors={ANCHORS.map((id) => ({ id, label: nav(id) }))}
      logo={
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <BrandMark size={32} className="shrink-0" />
          <span dir="ltr" className="sr-only text-sm font-medium whitespace-nowrap min-[480px]:not-sr-only">
            {site.name}
          </span>
        </Link>
      }
      actions={
        <>
          <FastModeButton label={nav("fast")} />
          <LangToggle label={nav("lang")} />
        </>
      }
    />
  );
}
