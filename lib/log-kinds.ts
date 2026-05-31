// Client-safe constants AND types for the log system.
// MUST NOT import from lib/source, lib/storage, lib/posts, or anything else
// that touches node:fs / node:path. This file is the boundary.

import type { Locale } from "./i18n";

export type LogVisibility = "public" | "unlisted" | "private";

/** Bezos two-way / one-way door framing for `kind: decision` entries. */
export type DecisionReversibility = "two-way" | "hard" | "one-way";

/** ADR-style status for `kind: decision` entries. */
export type DecisionStatus = "proposed" | "accepted" | "superseded";

/** Weight tier for `kind: decision` entries — drives template heaviness. */
export type DecisionTier = "1" | "2" | "3";

export type LogFrontmatter = {
  title: string;
  date: string;
  language: Locale;
  project: string;
  kind: LogKind;
  visibility: LogVisibility;
  summary?: string;
  tags?: string[];
  /** True when the entry was written by hand (no AI). Renders a "BY HAND" meta label. */
  handwritten?: boolean;
  /** True when the entry was backfilled for a historical commit. Renders a "BACKFILLED" meta label. */
  backfilled?: boolean;

  // kind: decision
  tier?: DecisionTier;
  status?: DecisionStatus;
  reversibility?: DecisionReversibility;

  // kind: discussion
  source?: string;
  participants?: string[];
  linked_decision?: string;

  // kind: learning-gap
  related_wiki?: string[];

  // kind: snapshot (monthly variant)
  period?: string; // e.g. "2026-05"
};

export type LogEntry = {
  project: string;
  slug: string;
  kind: LogKind;
  frontmatter: LogFrontmatter;
  content: string;
  readingMinutes: number;
};

export type LogKind =
  | "update"
  | "troubleshoot"
  | "tech-retro"
  | "ux-retro"
  | "decision"
  | "discussion"
  | "learning-gap"
  | "business"
  | "monetization"
  | "snapshot";

export const LOG_KINDS: LogKind[] = [
  "update",
  "troubleshoot",
  "tech-retro",
  "ux-retro",
  "decision",
  "discussion",
  "learning-gap",
  "business",
  "monetization",
  "snapshot",
];

export const LOG_KIND_LABELS: Record<LogKind, { en: string; ko: string }> = {
  update: { en: "Update", ko: "업데이트" },
  troubleshoot: { en: "Troubleshoot", ko: "트러블슈팅" },
  "tech-retro": { en: "Tech retro", ko: "기술 회고" },
  "ux-retro": { en: "UX retro", ko: "사용성 회고" },
  decision: { en: "Decision", ko: "결정" },
  discussion: { en: "Discussion", ko: "논의" },
  "learning-gap": { en: "Learning gap", ko: "이해 공백" },
  business: { en: "Business", ko: "비즈니스" },
  monetization: { en: "Monetization", ko: "수익화" },
  snapshot: { en: "Snapshot", ko: "스냅샷" },
};

/** Kinds that count as "judgment-layer artifacts" — surfaced separately in the status header. */
export const JUDGMENT_KINDS: LogKind[] = ["decision", "discussion", "learning-gap"];
