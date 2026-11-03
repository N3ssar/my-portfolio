const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

// "2 hours ago" in the given locale. Arabic keeps Western digits (0-9), as the spec requires.
export function relativeTime(iso: string, now: number, locale: string): string {
  const format = new Intl.RelativeTimeFormat(locale === "ar" ? "ar-u-nu-latn" : locale, {
    numeric: "auto",
  });
  const seconds = Math.round((Date.parse(iso) - now) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  }
  return format.format(0, "minute");
}
