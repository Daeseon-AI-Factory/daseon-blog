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
  return (
    <>
      <Header locale="ko" currentPath="/ko/projects" />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">프로젝트</h1>
          <p className="mt-2 text-ink-muted">만들고 있거나 만든 것들.</p>
        </header>
        <ProjectList projects={projects} locale="ko" />
      </main>
      <Footer locale="ko" />
    </>
  );
}
