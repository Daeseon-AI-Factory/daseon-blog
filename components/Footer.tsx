import { type Locale, localizedPath, t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { SocialGrid } from "@/components/SocialGrid";

export function Footer({ locale }: { locale: Locale }) {
  const rss = localizedPath(locale, "/feed.xml");
  return (
    <footer className="mt-24 border-t border-paper-line">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-5 py-8 md:flex-row md:items-center md:justify-between">
        <SocialGrid variant="footer" rssHref={rss} />
        <div className="flex flex-col gap-1 text-xs text-ink-subtle md:items-end">
          <p>© {new Date().getFullYear()} {SITE.author.name}</p>
          <p>{t(locale, "footer.builtWith")} <a className="underline hover:text-ink" href={SITE.author.github} target="_blank" rel="noopener noreferrer">{t(locale, "footer.github")}</a>.</p>
        </div>
      </div>
    </footer>
  );
}
