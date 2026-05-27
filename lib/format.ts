import { format, parseISO } from "date-fns";
import { enUS, ko } from "date-fns/locale";
import type { Locale } from "./i18n";

const DATE_LOCALES = { en: enUS, ko };

export function formatDate(iso: string | Date | unknown, locale: Locale): string {
  const date = iso instanceof Date ? iso : typeof iso === "string" ? parseISO(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return typeof iso === "string" ? iso : String(iso);
  try {
    return format(date, locale === "en" ? "MMM d, yyyy" : "yyyy년 M월 d일", {
      locale: DATE_LOCALES[locale],
    });
  } catch {
    return typeof iso === "string" ? iso : String(iso);
  }
}
