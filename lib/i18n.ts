export const LOCALES = ["en", "ko"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

type StringDict = Record<string, string>;

const COPY: Record<Locale, StringDict> = {
  en: {
    "site.title": "Daeseon Yoo",
    "site.tagline": "Backend & AI engineer in Toronto. Notes on building reliable backends and practical AI products.",
    "nav.posts": "Writing",
    "nav.about": "About",
    "nav.now": "Now",
    "nav.projects": "Projects",
    "home.heading": "Notes",
    "home.empty": "No posts yet.",
    "post.readingTime": "min read",
    "post.translation": "한국어 버전 →",
    "post.publishedOn": "Published",
    "post.updatedOn": "Updated",
    "footer.builtWith": "Hand-rolled in Next.js. Source on",
    "footer.github": "GitHub",
    "lang.switchTo": "한국어",
    "now.updated": "Last updated",
    "now.heading": "Now",
    "now.subtitle": "What I'm working on, reading, and learning right now.",
    "about.currently": "Currently",
    "about.previously": "Previously",
    "about.writingAbout": "Writing about",
    "about.stack": "Stack",
    "about.contact": "Get in touch",
  },
  ko: {
    "site.title": "유대선",
    "site.tagline": "토론토의 백엔드 & AI 엔지니어. 견고한 백엔드와 실제로 쓰이는 AI 제품을 만드는 기록.",
    "nav.posts": "글",
    "nav.about": "소개",
    "nav.now": "지금",
    "nav.projects": "프로젝트",
    "home.heading": "글",
    "home.empty": "아직 작성된 글이 없습니다.",
    "post.readingTime": "분 소요",
    "post.translation": "English version →",
    "post.publishedOn": "발행",
    "post.updatedOn": "수정",
    "footer.builtWith": "Next.js로 직접 만들었습니다. 소스는",
    "footer.github": "GitHub",
    "lang.switchTo": "English",
    "now.updated": "최근 갱신",
    "now.heading": "지금",
    "now.subtitle": "지금 무엇을 만들고, 읽고, 배우는지.",
    "about.currently": "현재",
    "about.previously": "이전",
    "about.writingAbout": "주로 쓰는 주제",
    "about.stack": "스택",
    "about.contact": "연락",
  },
};

export function t(locale: Locale, key: keyof typeof COPY["en"]): string {
  return COPY[locale][key] ?? COPY.en[key] ?? key;
}

export function localizedPath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return normalized;
  return `/${locale}${normalized}`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "ko" : "en";
}
