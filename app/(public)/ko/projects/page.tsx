import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectList } from "@/components/ProjectList";
import { getAllProjects } from "@/lib/projects";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "프로젝트",
  description: "만들고 있거나 만든 것들.",
  alternates: { canonical: "/ko/projects", languages: { en: "/projects", ko: "/ko/projects" } },
};

export default async function ProjectsKO() {
  const projects = await getAllProjects("ko");
  const featured = projects.filter((p) => p.frontmatter.featured);
  const rest = projects.filter((p) => !p.frontmatter.featured);
  return (
    <>
      <Header locale="ko" currentPath="/ko/projects" />
      <main className="mx-auto max-w-4xl px-5 py-12">
        <header className="mb-10 max-w-2xl">
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">프로젝트</h1>
          <p className="mt-3 text-ink-muted">
            프로덕션 시스템과 출시한 제품들 — 대부분 혼자, AI 페어 프로그래밍으로. 각
            페이지엔 날짜순 빌드 로그가 붙어 있다: 뭐가 깨졌고, 뭘 바꿨고, 아직 안 되는 게
            뭔지.
          </p>
        </header>
        {featured.length > 0 ? (
          <ProjectList projects={featured} locale="ko" prominent />
        ) : null}
        {rest.length > 0 ? (
          <section className={featured.length > 0 ? "mt-14" : ""}>
            {featured.length > 0 ? (
              <h2 className="mb-5 font-mono text-xs uppercase tracking-widest text-ink-subtle">
                그 외
              </h2>
            ) : null}
            <ProjectList projects={rest} locale="ko" />
          </section>
        ) : null}
      </main>
      <Footer locale="ko" />
    </>
  );
}
