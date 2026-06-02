import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getAllProjects, getProject } from "@/lib/projects";
import { getProjectReadme } from "@/lib/readme";
import { renderMdx } from "@/lib/mdx";
import { localizedPath } from "@/lib/i18n";
import { SITE } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export const revalidate = 300;

export async function generateStaticParams() {
  const all = await getAllProjects("en");
  const out: { slug: string }[] = [];
  for (const p of all) {
    if (await getProjectReadme(p.slug, "en")) out.push({ slug: p.slug });
  }
  return out;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject("en", slug);
  if (!project) return {};
  return {
    title: `${project.frontmatter.title} — README`,
    description: project.frontmatter.description,
    alternates: {
      canonical: `${SITE.url}/projects/${slug}/readme`,
      languages: { en: `/projects/${slug}/readme`, ko: `/ko/projects/${slug}/readme` },
    },
  };
}

export default async function ReadmePageEN({ params }: { params: Params }) {
  const { slug } = await params;
  const project = await getProject("en", slug);
  const readme = await getProjectReadme(slug, "en");
  if (!project || !readme) notFound();
  const body = await renderMdx(readme);
  return (
    <>
      <Header locale="en" currentPath={`/projects/${slug}`} />
      <article className="mx-auto max-w-3xl px-5 py-12">
        <Link
          href={localizedPath("en", `/projects/${slug}`)}
          className="font-mono text-xs uppercase tracking-widest text-accent hover:underline"
        >
          ← {project.frontmatter.title}
        </Link>
        <h1 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">README</h1>
        <p className="mt-1 text-sm text-ink-muted">
          The project&apos;s own README, mirrored here. Repo-relative links are plain text (the repo is private).
        </p>
        <div className="prose mt-8">{body}</div>
      </article>
      <Footer locale="en" />
    </>
  );
}
