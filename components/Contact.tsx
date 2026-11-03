import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import { ContactForm } from "./ContactForm";
import { CopyButton } from "./CopyButton";

const ICON_PATHS = {
  email: "M3 5h14v10H3zM3 5l7 6 7-6",
  linkedin: "M4 4h12v12H4zM7 9v4M7 7v.01M10 13v-4M10 10.5a2 2 0 0 1 3.5-1.3V13",
  whatsapp: "M4 16l1-3.5A6.5 6.5 0 1 1 7.5 15zM8 8.5c.5 2 1.5 3 3.5 3.5",
  github: "M7 6l-4 4 4 4M13 6l4 4-4 4",
};

function Icon({ name }: { name: keyof typeof ICON_PATHS }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-5 shrink-0 text-text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

const ROW = "flex min-h-11 w-full items-center gap-3 rounded-lg bg-surface px-4 py-3 text-start";

function ActionLink({ href, icon, label, action }: { href: string; icon: keyof typeof ICON_PATHS; label: string; action: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${ROW} group`}>
      <Icon name={icon} />
      <span className="flex-1">{label}</span>
      <span className="text-accent">{action}</span>
    </a>
  );
}

function Column({ children }: { children: ReactNode }) {
  return <div className="max-w-[720px] lg:max-w-none">{children}</div>;
}

export function Contact() {
  const t = useTranslations("contact");
  const common = useTranslations("common");
  const locale = useLocale() === "ar" ? "ar" : "en";

  return (
    <section id="contact" className="mx-auto max-w-page px-4 py-16 sm:px-6 lg:py-24">
      <h2>{t("title")}</h2>
      <p className="mt-3 text-text-soft">{t("intro")}</p>

      {/* From 1024px: actions on the start side (about 40%), form on the end side (about 60%). */}
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[2fr_3fr] lg:gap-12">
        <Column>
          <ul className="space-y-2">
            <li>
              <CopyButton
                text={site.email}
                label={t("actions.copyEmail")}
                copiedLabel={common("copied")}
                className={ROW}
              >
                <Icon name="email" />
                <span className="flex flex-1 flex-wrap gap-x-2">
                  {t("actions.email")}
                  <bdi className="text-text-muted">{site.email}</bdi>
                </span>
              </CopyButton>
            </li>
            <li>
              <ActionLink href={site.links.linkedin} icon="linkedin" label={t("actions.linkedin")} action={t("actions.open")} />
            </li>
            <li>
              {/* The number is only in the link, never shown as text. */}
              <ActionLink href={site.whatsapp} icon="whatsapp" label={t("actions.whatsapp")} action={t("actions.open")} />
            </li>
            <li>
              <ActionLink href={site.links.github} icon="github" label={t("actions.github")} action={t("actions.open")} />
            </li>
          </ul>
        </Column>

        <Column>
          <h3>{t("form.title")}</h3>
          <ContactForm
            email={site.email}
            locale={locale}
            labels={{
              name: t("form.name"),
              contact: t("form.contact"),
              message: t("form.message"),
              namePh: t("form.namePh"),
              contactPh: t("form.contactPh"),
              messagePh: t("form.messagePh"),
              send: t("form.send"),
              sending: t("form.sending"),
              success: t("form.success"),
              errName: t("form.errName"),
              errContact: t("form.errContact"),
              errMessage: t("form.errMessage"),
              errSend: t("form.errSend"),
              errRate: t("form.errRate"),
              copy: common("copy"),
              copied: common("copied"),
            }}
          />
        </Column>
      </div>
    </section>
  );
}
