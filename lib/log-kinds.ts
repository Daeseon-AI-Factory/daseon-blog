// Client-safe constants AND types for the log system.
// MUST NOT import from lib/source, lib/storage, lib/posts, or anything else
// that touches node:fs / node:path. This file is the boundary.

import type { Locale } from "./i18n";

export type LogVisibility = "public" | "unlisted" | "private";

export type LogFrontmatter = {
  title: string;
  date: string;
  language: Locale;
  project: string;
  kind: LogKind;
  visibility: LogVisibility;
  summary?: string;
  tags?: string[];
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
  | "business"
  | "monetization"
  | "ux-retro";

export const LOG_KINDS: LogKind[] = [
  "update",
  "troubleshoot",
  "tech-retro",
  "business",
  "monetization",
  "ux-retro",
];

export const LOG_KIND_LABELS: Record<LogKind, { en: string; ko: string }> = {
  update: { en: "Update", ko: "업데이트" },
  troubleshoot: { en: "Troubleshoot", ko: "트러블슈팅" },
  "tech-retro": { en: "Tech retro", ko: "기술 회고" },
  business: { en: "Business", ko: "비즈니스" },
  monetization: { en: "Monetization", ko: "수익화" },
  "ux-retro": { en: "UX retro", ko: "사용성 회고" },
};
