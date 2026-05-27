import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getNow } from "@/lib/now";
import { renderMdx } from "@/lib/mdx";
import { formatDate } from "@/lib/format";
import { t } from "@/lib/i18n";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "지금",
  description: "지금 무엇을 만들고, 읽고, 배우는지.",
  alternates: { canonical: "/ko/now", languages: { en: "/now", ko: "/ko/now" } },
};

export default async function NowKO() {
  const doc = await getNow("ko");
  if (!doc) notFound();
  const body = await renderMdx(doc.content);
  return (
    <>
      <Header locale="ko" currentPath="/ko/now" />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">
            {t("ko", "now.heading")}
          </h1>
          <p className="mt-2 text-ink-muted">{t("ko", "now.subtitle")}</p>
          {doc.updated ? (
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-ink-subtle">
              {t("ko", "now.updated")} · {formatDate(doc.updated, "ko")}
            </p>
          ) : null}
        </header>
        <article className="prose">{body}</article>
      </main>
      <Footer locale="ko" />
    </>
  );
}
