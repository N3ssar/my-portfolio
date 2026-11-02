import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("hero");

  return (
    <div className="mx-auto max-w-page px-4 py-16 sm:px-6 lg:py-24">
      <h1>{t("title")}</h1>
    </div>
  );
}
