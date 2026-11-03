import { useLocale, useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { projects } from "@/content/projects";
import { skills } from "@/content/skills";
import { rightNowRows, type RightNowRow } from "@/lib/status";

export function RightNow() {
  const t = useTranslations("rightNow");
  const items = useTranslations("projects.items");
  const locale = useLocale();

  const rows = rightNowRows({
    projects,
    skills,
    locale,
    projectText: (id) => ({ name: items(`${id}.name`), summary: items(`${id}.summary`) }),
    lookingFor: t("looking.value"),
    updated: t("updated"),
  });
  const updated = rows.find(({ key }) => key === "updated");
  const listRows = rows.filter(({ key }) => key !== "updated");

  if (rows.length === 0) return null;

  const label = (key: RightNowRow["key"]) => (key === "looking" ? t("looking.label") : t(key));

  return (
    <section id="right-now" data-reveal className="mx-auto max-w-page px-4 py-16 sm:px-6 lg:py-24">
      <h2>{t("title")}</h2>
      <div className="mt-8 rounded-xl bg-surface p-4 sm:p-6">
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-[auto_minmax(0,1fr)]">
          {listRows.map((row, index) => (
            <div key={row.key} className="contents">
              <dt data-stagger style={{ "--i": index } as CSSProperties} className="text-sm text-text-muted">
                {label(row.key)}
              </dt>
              <dd
                data-stagger
                style={{ "--i": index } as CSSProperties}
                className={row.comingSoon ? "text-text-muted" : "text-text-soft"}
              >
                {row.comingSoon ? (
                  t("comingSoon")
                ) : row.values.length === 1 ? (
                  row.values[0]
                ) : (
                  <ul className="space-y-1">
                    {row.values.map((value) => (
                      <li key={value}>{value}</li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
          ))}
        </dl>
        {updated && (
          <p className="mt-6 text-sm text-text-muted">
            {t("updatedLabel")}: {updated.comingSoon ? t("comingSoon") : updated.values[0]}
          </p>
        )}
      </div>
    </section>
  );
}
