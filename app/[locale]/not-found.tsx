import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="mx-auto flex max-w-page flex-col items-center px-4 py-24 text-center sm:px-6">
      {/* One small static planet, the only drawing on this page. */}
      <svg aria-hidden="true" viewBox="0 0 64 64" className="size-16">
        <circle cx="32" cy="32" r="14" fill="var(--text-soft)" />
        <ellipse cx="32" cy="32" rx="28" ry="8" fill="none" stroke="var(--border)" strokeWidth="1.5" />
      </svg>
      <h1 className="mt-6">{t("title")}</h1>
      <p className="mt-3 text-text-soft">{t("text")}</p>
      <Link href="/" className="btn btn-primary mt-8">
        {t("back")}
      </Link>
    </div>
  );
}
