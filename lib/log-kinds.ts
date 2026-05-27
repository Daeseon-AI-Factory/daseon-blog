// Client-safe constants for log kinds. No fs imports.

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
