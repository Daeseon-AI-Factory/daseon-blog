import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { SocialGrid } from "@/components/SocialGrid";
import { type Locale, localizedPath, t } from "@/lib/i18n";
import { SITE } from "@/lib/site";

type Props = {
  locale: Locale;
  tagline?: string;
  currentPath?: string;
};

export function ProfileCard({ locale, tagline, currentPath }: Props) {
  const name = locale === "ko" ? SITE.author.nameKo : SITE.author.name;
  const role = locale === "ko" ? SITE.author.roleKo : SITE.author.role;
  const location = locale === "ko" ? SITE.author.locationKo : SITE.author.location;
  const status = locale === "ko"
    ? SITE.author.available ? "구직 중 · 원격 또는 토론토" : null
    : SITE.author.available ? "Open to roles · Remote or Toronto" : null;
  const rss = localizedPath(locale, "/feed.xml");

  const nav = [
    { href: localizedPath(locale, "/about"), label: t(locale, "nav.about") },
    { href: localizedPath(locale, "/projects"), label: t(locale, "nav.projects") },
    { href: localizedPath(locale, "/posts"), label: t(locale, "nav.posts") },
    { href: localizedPath(locale, "/now"), label: t(locale, "nav.now") },
  ];

  return (
    <aside className="lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
      <div className="flex flex-col gap-5">
        <Avatar size="lg" />
        <div>
          <h1 className="text-xl font-medium tracking-tight">{name}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{role}</p>
          <p className="text-sm text-ink-muted">{location}</p>
        </div>

        {status ? (
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-paper-line bg-white px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            {status}
          </p>
        ) : null}

        {tagline ? (
          <p className="text-sm leading-relaxed text-ink">{tagline}</p>
        ) : null}

        <nav aria-label="Section navigation">
          <ul className="flex flex-col gap-1 text-sm">
            {nav.map((item) => {
              const active = currentPath === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`-mx-2 block rounded-md px-2 py-1 transition ${
                      active
                        ? "bg-paper-line/60 text-ink"
                        : "text-ink-muted hover:bg-paper-line/40 hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <SocialGrid variant="inline" rssHref={rss} />
      </div>
    </aside>
  );
}
