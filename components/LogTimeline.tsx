"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type LogEntry, type LogKind, LOG_KINDS, LOG_KIND_LABELS } from "@/lib/log-kinds";
import { type Locale, localizedPath } from "@/lib/i18n";
import { formatDate } from "@/lib/format";

type Props = {
  project: string;
  entries: LogEntry[];
  locale: Locale;
};

const KIND_COLOR: Record<LogKind, string> = {
  update: "bg-paper-line/60 text-ink",
  troubleshoot: "bg-accent/15 text-accent",
  "tech-retro": "bg-ink/8 text-ink",
  "ux-retro": "bg-ink/8 text-ink",
  decision: "bg-ink/10 text-ink border border-ink/20",
  discussion: "bg-paper-line/40 text-ink-muted italic",
  "learning-gap": "bg-accent/8 text-accent/90 italic",
  business: "bg-paper-line/60 text-ink-muted",
  monetization: "bg-paper-line/60 text-ink-muted",
  snapshot: "bg-ink/15 text-ink font-medium",
};

export function LogTimeline({ project, entries, locale }: Props) {
  const [activeKind, setActiveKind] = useState<LogKind | "all">("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: entries.length };
    for (const k of LOG_KINDS) c[k] = entries.filter((e) => e.kind === k).length;
    return c;
  }, [entries]);

  const sorted = useMemo(
    () =>
      [...entries].sort((a, b) =>
        b.frontmatter.date.localeCompare(a.frontmatter.date),
      ),
    [entries],
  );

  const filtered = useMemo(
    () => (activeKind === "all" ? sorted : sorted.filter((e) => e.kind === activeKind)),
    [sorted, activeKind],
  );

  const HIGHLIGHT: LogKind[] = ["decision", "snapshot"];
  const isAll = activeKind === "all";
  const highlights = isAll ? filtered.filter((e) => HIGHLIGHT.includes(e.kind)) : [];
  const rest = isAll ? filtered.filter((e) => !HIGHLIGHT.includes(e.kind)) : filtered;

  const renderEntry = (e: LogEntry) => (
    <li key={`${e.project}-${e.slug}`} className="relative">
      <span
        aria-hidden
        className="absolute -left-[1.65rem] top-2 grid h-3 w-3 place-items-center"
      >
        <span className="block h-2 w-2 rounded-full border border-paper-line bg-paper" />
      </span>
      <Link
        href={localizedPath(locale, `/projects/${project}/log/${e.slug}`)}
        className="group block rounded-md border border-paper-line bg-white p-4 transition hover:border-accent"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-medium text-ink group-hover:text-accent">
            {e.frontmatter.title}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest ${KIND_COLOR[e.kind]}`}
          >
            {LOG_KIND_LABELS[e.kind][locale]}
          </span>
        </div>
        <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-widest text-ink-subtle">
          {formatDate(e.frontmatter.date, locale)} · {e.readingMinutes}{" "}
          {locale === "ko" ? "분" : "min"}
          {e.frontmatter.handwritten
            ? ` · ${locale === "ko" ? "직접" : "By hand"}`
            : ""}
        </p>
        {e.frontmatter.summary ? (
          <p className="mt-2 text-sm text-ink-muted">{e.frontmatter.summary}</p>
        ) : null}
      </Link>
    </li>
  );

  if (entries.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        {locale === "ko" ? "아직 로그가 없습니다." : "No log entries yet."}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">
          {locale === "ko" ? "필터" : "filter"}
        </span>
        <button
          type="button"
          onClick={() => setActiveKind("all")}
          className={`rounded-full border px-3 py-1 text-xs ${
            activeKind === "all"
              ? "border-ink bg-ink text-paper"
              : "border-paper-line text-ink-muted hover:border-accent"
          }`}
        >
          {locale === "ko" ? "전체" : "All"} ({counts.all})
        </button>
        {LOG_KINDS.map((k) =>
          counts[k] > 0 ? (
            <button
              type="button"
              key={k}
              onClick={() => setActiveKind(k)}
              className={`rounded-full border px-3 py-1 text-xs ${
                activeKind === k
                  ? "border-ink bg-ink text-paper"
                  : "border-paper-line text-ink-muted hover:border-accent"
              }`}
            >
              {LOG_KIND_LABELS[k][locale]} ({counts[k]})
            </button>
          ) : null,
        )}
      </div>

      {isAll && highlights.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">
            {locale === "ko" ? "결정 · 마일스톤" : "Decisions & milestones"}
          </h3>
          <ol className="relative ml-3 space-y-5 border-l border-paper-line pl-6">
            {highlights.map(renderEntry)}
          </ol>
        </div>
      ) : null}

      <div className="space-y-3">
        {isAll && highlights.length > 0 ? (
          <h3 className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">
            {locale === "ko" ? "전체 빌드 로그" : "Full build log"}
          </h3>
        ) : null}
        <ol className="relative ml-3 space-y-5 border-l border-paper-line pl-6">
          {rest.map(renderEntry)}
        </ol>
      </div>
    </div>
  );
}
