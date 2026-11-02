import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/Header";
import { routing } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Only used on Arabic pages and tiny labels, so neither is preloaded on every page.
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "500"],
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("title"), description: t("description") };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${plexArabic.variable} ${jetbrainsMono.variable}`}
    >
      {/* Browser extensions such as ColorZilla add attributes to body before React hydrates. */}
      <body suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only rounded-lg bg-accent px-4 py-2 text-accent-ink focus:not-sr-only focus:absolute focus:start-4 focus:top-4"
        >
          {t("skipToContent")}
        </a>
        {/* Client components get translated labels as props, so no messages reach the browser. */}
        <NextIntlClientProvider messages={null}>
          <Header />
          <main id="main">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
