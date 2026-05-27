import Link from "next/link";
import { type Locale, localizedPath, otherLocale, t } from "@/lib/i18n";

export function Header({ locale, currentPath = "/" }: { locale: Locale; currentPath?: string }) {
  const switchPath = (() => {
    const target = otherLocale(locale);
    const stripped = currentPath.replace(/^\/(ko|en)(?=\/|$)/, "") || "/";
    return localizedPath(target, stripped);
  })();

  return (
    <header className="border-b border-paper-line">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Link
          href={localizedPath(locale, "/")}
          className="font-medium tracking-tight text-ink hover:text-accent"
        >
          {t(locale, "site.title")}
        </Link>
        <nav className="flex items-center gap-5 text-sm text-ink-muted">
          <Link href={localizedPath(locale, "/projects")} className="hover:text-ink">
            {t(locale, "nav.projects")}
          </Link>
          <Link href={localizedPath(locale, "/posts")} className="hover:text-ink">
            {t(locale, "nav.posts")}
          </Link>
          <Link href={localizedPath(locale, "/now")} className="hover:text-ink">
            {t(locale, "nav.now")}
          </Link>
          <Link href={localizedPath(locale, "/about")} className="hover:text-ink">
            {t(locale, "nav.about")}
          </Link>
          <Link
            href={switchPath}
            className="border-l border-paper-line pl-5 font-mono text-xs uppercase tracking-widest hover:text-ink"
          >
            {t(locale, "lang.switchTo")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
