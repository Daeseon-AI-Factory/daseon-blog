import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectList } from "@/components/ProjectList";
import { getAllProjects } from "@/lib/projects";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built or am building.",
  alternates: { canonical: "/projects", languages: { en: "/projects", ko: "/ko/projects" } },
};

export default async function ProjectsEN() {
  const projects = await getAllProjects("en");
  return (
    <>
      <Header locale="en" currentPath="/projects" />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">Projects</h1>
          <p className="mt-2 text-ink-muted">Things I&apos;ve built or am building.</p>
        </header>
        <ProjectList projects={projects} locale="en" />
      </main>
      <Footer locale="en" />
    </>
  );
}
