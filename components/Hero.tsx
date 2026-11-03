import { useTranslations } from "next-intl";
import { site } from "@/content/site";
import { ExplorerId } from "./ExplorerId";
import { StatusPill } from "./StatusPill";
import { TrackedLink } from "./TrackedLink";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="hero-glow mx-auto max-w-page px-4 py-16 sm:px-6 lg:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <div className="hero-rise">
            <StatusPill dot>{t("availability")}</StatusPill>
          </div>
          <h1 className="hero-rise mt-4">{t("title")}</h1>
          <p className="hero-1 mt-4 max-w-[560px] text-text-soft">
            {t("subtitle")}
          </p>
          <div className="hero-2 mt-6 flex flex-col gap-3 xs:flex-row">
            <a href="#projects" className="btn btn-primary">
              {t("ctaProjects")}
            </a>
            <TrackedLink event="cv_download" href={site.cv} download className="btn btn-outline">
              {t("ctaCv")}
            </TrackedLink>
          </div>
          <a
            href="#contact"
            className="hero-2 mt-3 inline-block py-2 text-sm text-text-soft underline underline-offset-4 hover:text-accent"
          >
            {t("ctaContact")}
          </a>
        </div>
        <div className="hero-card">
          <ExplorerId />
        </div>
      </div>
      <p className="mt-12 flex items-center gap-2 text-sm text-text-muted">
        {t("scroll")}
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 3v10M4 9l4 4 4-4" />
        </svg>
      </p>
    </section>
  );
}
