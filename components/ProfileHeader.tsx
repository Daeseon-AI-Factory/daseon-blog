import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { SocialGrid } from "@/components/SocialGrid";
import { type Locale, localizedPath } from "@/lib/i18n";
import { SITE } from "@/lib/site";

type Props = {
  locale: Locale;
  tagline: string;
};

export function ProfileHeader({ locale, tagline }: Props) {
  const name = locale === "ko" ? SITE.author.nameKo : SITE.author.name;
  const role = locale === "ko" ? SITE.author.roleKo : SITE.author.role;
  const location = locale === "ko" ? SITE.author.locationKo : SITE.author.location;
  const status = locale === "ko"
    ? SITE.author.available ? "구직 중 · 원격 또는 토론토" : null
    : SITE.author.available ? "Open to roles · Remote or Toronto" : null;
  const aboutLabel = locale === "ko" ? "소개" : "About";
  const nowLabel = locale === "ko" ? "지금" : "Now";

  return (
    <section className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
      <Avatar size="lg" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-medium tracking-tight md:text-3xl">{name}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {role} · {location}
        </p>
        <p className="mt-3 max-w-xl text-ink">{tagline}</p>

        {status ? (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-paper-line bg-white px-3 py-1 font-mono text-[0.7rem] uppercase tracking-widest text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            {status}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <Link
            href={localizedPath(locale, "/about")}
            className="rounded-md border border-paper-line bg-white px-3 py-1.5 text-ink-muted hover:border-accent hover:text-ink"
          >
            {aboutLabel}
          </Link>
          <Link
            href={localizedPath(locale, "/now")}
            className="rounded-md border border-paper-line bg-white px-3 py-1.5 text-ink-muted hover:border-accent hover:text-ink"
          >
            {nowLabel}
          </Link>
          <SocialGrid variant="inline" />
        </div>
      </div>
    </section>
  );
}
