import Link from "next/link";
import { type Locale, localizedPath, otherLocale, t } from "@/lib/i18n";

export function Header({ locale, currentPath = "/" }: { locale: Locale; currentPath?: string }) {
  const switchPath = (() => {
    const target = otherLocale(locale);
    const stripped = currentPath.replace(/^\/(ko|en)(?=\/|$)/, "") || "/";
    return localizedPath(target, stripped);
  })();
  const resumePath = locale === "ko" ? "/ko/resume/toss" : "/resume";

  return (
    <header className="border-b border-paper-line">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-5">
        <Link
          href={localizedPath(locale, "/")}
          className="font-medium tracking-tight text-ink hover:text-accent"
        >
          {t(locale, "site.title")}
        </Link>
        <nav aria-label={locale === "ko" ? "주요 메뉴" : "Primary"} className="flex min-w-0 items-center gap-3 text-xs text-ink-muted sm:gap-5 sm:text-sm">
          <Link href={localizedPath(locale, "/projects")} className="hidden hover:text-ink sm:inline">
            {t(locale, "nav.projects")}
          </Link>
          <Link href={localizedPath(locale, "/posts")} className="hidden hover:text-ink md:inline">
            {t(locale, "nav.posts")}
          </Link>
          <Link href={localizedPath(locale, "/portfolio")} className="font-medium hover:text-ink">
            {t(locale, "nav.portfolio")}
          </Link>
          <Link href={resumePath} className="font-medium hover:text-ink">
            {t(locale, "nav.resume")}
          </Link>
          <Link href={localizedPath(locale, "/wiki")} className="hidden hover:text-ink lg:inline">
            {t(locale, "nav.wiki")}
          </Link>
          <Link href={localizedPath(locale, "/method")} className="hidden hover:text-ink lg:inline">
            {t(locale, "nav.method")}
          </Link>
          <Link href={localizedPath(locale, "/now")} className="hidden hover:text-ink lg:inline">
            {t(locale, "nav.now")}
          </Link>
          <Link href={localizedPath(locale, "/about")} className="hidden hover:text-ink md:inline">
            {t(locale, "nav.about")}
          </Link>
          <Link
            href={switchPath}
            className="shrink-0 border-l border-paper-line pl-3 font-mono text-[10px] uppercase tracking-wider hover:text-ink sm:pl-5 sm:text-xs sm:tracking-widest"
          >
            {t(locale, "lang.switchTo")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
