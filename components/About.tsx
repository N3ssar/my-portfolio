import { useTranslations } from "next-intl";
import { SectionTitle } from "./SectionTitle";
import type { CSSProperties } from "react";

type LogEntry = { label: string; text: string };

function CompactList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3>{title}</h3>
      <ul className="mt-3 list-disc space-y-2 ps-5 text-text-soft">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function About() {
  const t = useTranslations("about");
  const log: LogEntry[] = t.raw("log");

  return (
    <section id="about" data-reveal className="mx-auto max-w-page px-4 py-16 sm:px-6 lg:py-24">
      <SectionTitle>{t("title")}</SectionTitle>

      {/* Captain's log: plain paragraphs, no timeline graphic. */}
      <ol className="mt-8 max-w-[720px] space-y-6">
        {log.map(({ label, text }, index) => (
          <li key={label} data-stagger style={{ "--i": index } as CSSProperties}>
            <span dir="ltr" className="font-mono text-xs text-text-muted">
              {label}
            </span>
            <p className="mt-1 text-text-soft">{text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        <CompactList title={t("crewTitle")} items={t.raw("crew")} />
        <CompactList title={t("languagesTitle")} items={t.raw("languages")} />
        <CompactList title={t("educationTitle")} items={t.raw("education")} />
        <CompactList title={t("certsTitle")} items={t.raw("certs")} />
      </div>
    </section>
  );
}
