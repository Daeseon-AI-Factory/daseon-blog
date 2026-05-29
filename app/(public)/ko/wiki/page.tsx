import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WikiList } from "@/components/WikiList";
import { listContent, type Post } from "@/lib/posts";
import { t } from "@/lib/i18n";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "위키",
  description: "직접 쓴 상호 링크 기술 정의 — 이중언어.",
  alternates: { canonical: "/ko/wiki", languages: { en: "/wiki", ko: "/ko/wiki" } },
};

function isListable(p: Post): boolean {
  return p.frontmatter.visibility !== "private" && p.frontmatter.status !== "draft";
}

export default async function WikiIndexKO() {
  const all = await listContent("knowledge", "ko");
  const entries = all
    .filter(isListable)
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
  return (
    <>
      <Header locale="ko" currentPath="/ko/wiki" />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">
            {t("ko", "wiki.heading")}
          </h1>
          <p className="mt-2 text-ink-muted">{t("ko", "wiki.subtitle")}</p>
        </header>
        <WikiList entries={entries} locale="ko" />
      </main>
      <Footer locale="ko" />
    </>
  );
}
