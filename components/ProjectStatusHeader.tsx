import Link from "next/link";
import { type LogEntry, JUDGMENT_KINDS, LOG_KIND_LABELS } from "@/lib/log-kinds";
import { type Locale, localizedPath } from "@/lib/i18n";
import { formatDate } from "@/lib/format";

type Props = {
  project: string;
  entries: LogEntry[];
  locale: Locale;
};

const COPY = {
  en: {
    logged: "logged",
    of: "of",
    skips: "skip-marked",
    lastUpdate: "Last update",
    architectureOverview: "Architecture overview ↓",
    none: "No log entries yet",
    judgmentLayer: "Judgment layer",
  },
  ko: {
    logged: "로그됨",
    of: "/",
    skips: "스킵",
    lastUpdate: "마지막 업데이트",
    architectureOverview: "아키텍처 오버뷰 ↓",
    none: "아직 로그 없음",
    judgmentLayer: "판단 layer",
  },
} as const;

export function ProjectStatusHeader({ project, entries, locale }: Props) {
  const copy = COPY[locale];

  if (entries.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-paper-line bg-white/40 px-4 py-3 text-sm text-ink-muted">
        {copy.none}
      </div>
    );
  }

  const sortedByDate = [...entries].sort((a, b) =>
    b.frontmatter.date.localeCompare(a.frontmatter.date),
  );
  const latestUpdate = sortedByDate[0]?.frontmatter.date;

  // Find the most recent architecture overview (kind: snapshot without a period — period means monthly)
  const archOverview = sortedByDate.find(
    (e) => e.kind === "snapshot" && !e.frontmatter.period,
  );

  const judgmentCounts: Record<string, number> = {};
  for (const k of JUDGMENT_KINDS) {
    judgmentCounts[k] = entries.filter((e) => e.kind === k).length;
  }
  const judgmentTotal = Object.values(judgmentCounts).reduce((a, b) => a + b, 0);

  const archHref = archOverview
    ? localizedPath(
        locale,
        `/projects/${project}/log/${archOverview.slug}`,
      )
    : null;

  return (
    <div className="mt-6 rounded-lg border border-paper-line bg-white/60 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-medium text-ink">
          {entries.length} {copy.logged}
        </span>
        {judgmentTotal > 0 ? (
          <span className="text-ink-muted">
            ·{" "}
            <span className="font-medium text-ink/85">{copy.judgmentLayer}</span>{" "}
            {JUDGMENT_KINDS.filter((k) => judgmentCounts[k] > 0)
              .map((k) => `${judgmentCounts[k]} ${LOG_KIND_LABELS[k][locale]}`)
              .join(" · ")}
          </span>
        ) : null}
      </div>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs text-ink-subtle">
        {latestUpdate ? (
          <span>
            {copy.lastUpdate}: {formatDate(latestUpdate, locale)}
          </span>
        ) : null}
        {archHref ? (
          <Link href={archHref} className="text-accent hover:underline">
            {copy.architectureOverview}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
