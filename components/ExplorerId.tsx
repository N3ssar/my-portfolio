import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { site } from "@/content/site";
import { BrandMark } from "./BrandMark";
import { ExplorerStatus } from "./ExplorerStatus";

const hasPhoto = existsSync(join(process.cwd(), "public", "photo.jpg"));

export function ExplorerId() {
  const t = useTranslations("hero.id");
  const rows = [
    [t("role"), t("roleValue")],
    [t("mission"), t("missionValue")],
    [t("available"), t("availableValue")],
    [t("based"), t("basedValue")],
    [t("military"), t("militaryValue")],
  ];

  return (
    <div className="card-lift rounded-xl border border-border bg-surface p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <span dir="ltr" className="font-mono text-xs text-text-muted">
          {t("label")}
        </span>
        <span className="sr-only">{t("statusSr")}</span>
        <ExplorerStatus status={t("status")} countdown={t.raw("countdown")} />
      </div>
      <div className="mt-4 flex items-start gap-4">
        {hasPhoto ? (
          <Image
            src="/photo.jpg"
            alt={site.name}
            width={52}
            height={52}
            className="size-13 shrink-0 rounded-full object-cover"
          />
        ) : (
          <BrandMark size={52} className="shrink-0 rounded-xl border border-border" />
        )}
        <dl className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="font-mono text-xs leading-5 text-text-muted rtl:font-sans">{label}</dt>
              <dd className="text-text-soft">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
