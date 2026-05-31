import { SITE } from "@/lib/site";

type Variant = "inline" | "footer";

const ICONS = {
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-full w-full">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-full w-full">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-full w-full">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-full w-full">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-full w-full">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  rss: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-full w-full">
      <path d="M6.18 15.64a2.18 2.18 0 012.18 2.18C8.36 19 7.38 20 6.18 20a2.18 2.18 0 010-4.36zM4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27zM4 10.1A9.9 9.9 0 0113.9 20h-2.83A7.07 7.07 0 004 12.93z" />
    </svg>
  ),
  resume: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-full w-full">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  ),
};

type LinkKey = keyof typeof ICONS;

function buildLinks(rssHref: string): Array<{ key: LinkKey; href: string; label: string; external: boolean }> {
  const candidates: Array<{ key: LinkKey; href: string; label: string; external: boolean }> = [
    { key: "github", href: SITE.author.github, label: "GitHub", external: true },
    { key: "linkedin", href: SITE.author.linkedin, label: "LinkedIn", external: true },
    { key: "twitter", href: SITE.author.twitter, label: "X", external: true },
    { key: "youtube", href: SITE.author.youtube, label: "YouTube", external: true },
    { key: "email", href: SITE.author.email ? `mailto:${SITE.author.email}` : "", label: "Email", external: false },
    { key: "resume", href: SITE.author.resumeUrl, label: "Resume", external: false },
    { key: "rss", href: rssHref, label: "RSS", external: false },
  ];
  return candidates.filter((c) => Boolean(c.href));
}

export function SocialGrid({
  variant = "footer",
  rssHref = "/feed.xml",
}: {
  variant?: Variant;
  rssHref?: string;
}) {
  const links = buildLinks(rssHref);

  if (links.length === 0) return null;

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {links.map((l) => (
          <a
            key={l.key}
            href={l.href}
            aria-label={l.label}
            target={l.external ? "_blank" : undefined}
            rel={l.external ? "noopener noreferrer" : undefined}
            className="grid h-8 w-8 place-items-center rounded-md text-ink-muted transition hover:bg-paper-line hover:text-ink"
          >
            <span className="block h-4 w-4">{ICONS[l.key]}</span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {links.map((l) => (
        <li key={l.key}>
          <a
            href={l.href}
            target={l.external ? "_blank" : undefined}
            rel={l.external ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-2 rounded-md border border-paper-line bg-white px-3 py-1.5 text-xs text-ink-muted transition hover:border-accent hover:text-ink"
          >
            <span className="block h-3.5 w-3.5">{ICONS[l.key]}</span>
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
