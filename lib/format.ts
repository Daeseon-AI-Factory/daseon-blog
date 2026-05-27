import { format, parseISO } from "date-fns";
import { enUS, ko } from "date-fns/locale";
import type { Locale } from "./i18n";

const DATE_LOCALES = { en: enUS, ko };

export function formatDate(iso: string, locale: Locale): string {
  try {
    const date = parseISO(iso);
    return format(date, locale === "en" ? "MMM d, yyyy" : "yyyy년 M월 d일", {
      locale: DATE_LOCALES[locale],
    });
  } catch {
    return iso;
  }
}
