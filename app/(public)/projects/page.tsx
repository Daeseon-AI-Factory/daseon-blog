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
  const featured = projects.filter((p) => p.frontmatter.featured);
  const rest = projects.filter((p) => !p.frontmatter.featured);
  return (
    <>
      <Header locale="en" currentPath="/projects" />
      <main className="mx-auto max-w-4xl px-5 py-12">
        <header className="mb-10 max-w-2xl">
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">Projects</h1>
          <p className="mt-3 text-ink-muted">
            Production systems and shipped products — mostly solo, AI-pair-programmed.
            Each page carries a dated build log: what broke, what I changed, and what
            it still can&apos;t do.
          </p>
        </header>
        {featured.length > 0 ? (
          <ProjectList projects={featured} locale="en" prominent />
        ) : null}
        {rest.length > 0 ? (
          <section className={featured.length > 0 ? "mt-14" : ""}>
            {featured.length > 0 ? (
              <h2 className="mb-5 font-mono text-xs uppercase tracking-widest text-ink-subtle">
                More
              </h2>
            ) : null}
            <ProjectList projects={rest} locale="en" />
          </section>
        ) : null}
      </main>
      <Footer locale="en" />
    </>
  );
}
