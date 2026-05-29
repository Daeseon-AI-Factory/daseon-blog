import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WikiList } from "@/components/WikiList";
import { listContent, type Post } from "@/lib/posts";
import { t } from "@/lib/i18n";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Wiki",
  description: "Hand-written, cross-linked technical definitions — bilingual.",
  alternates: { canonical: "/wiki", languages: { en: "/wiki", ko: "/ko/wiki" } },
};

function isListable(p: Post): boolean {
  return p.frontmatter.visibility !== "private" && p.frontmatter.status !== "draft";
}

export default async function WikiIndexEN() {
  const all = await listContent("knowledge", "en");
  const entries = all
    .filter(isListable)
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
  return (
    <>
      <Header locale="en" currentPath="/wiki" />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">
            {t("en", "wiki.heading")}
          </h1>
          <p className="mt-2 text-ink-muted">{t("en", "wiki.subtitle")}</p>
        </header>
        <WikiList entries={entries} locale="en" />
      </main>
      <Footer locale="en" />
    </>
  );
}
