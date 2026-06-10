import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getAllProjects, getProject } from "@/lib/projects";
import { getProjectArchitecture } from "@/lib/architecture";
import { renderMdx } from "@/lib/mdx";
import { localizedPath } from "@/lib/i18n";
import { SITE } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export const revalidate = 300;

export async function generateStaticParams() {
  const all = await getAllProjects("en");
  const out: { slug: string }[] = [];
  for (const p of all) {
    if (await getProjectArchitecture(p.slug, "en")) out.push({ slug: p.slug });
  }
  return out;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject("en", slug);
  if (!project) return {};
  return {
    title: `${project.frontmatter.title} — Architecture`,
    description: project.frontmatter.description,
    alternates: {
      canonical: `${SITE.url}/projects/${slug}/architecture`,
      languages: { en: `/projects/${slug}/architecture`, ko: `/ko/projects/${slug}/architecture` },
    },
  };
}

export default async function ArchitecturePageEN({ params }: { params: Params }) {
  const { slug } = await params;
  const project = await getProject("en", slug);
  const architecture = await getProjectArchitecture(slug, "en");
  if (!project || !architecture) notFound();
  const body = await renderMdx(architecture);
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
        <h1 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">Architecture</h1>
        <p className="mt-1 text-sm text-ink-muted">
          How the system is put together — process model, data flow, trade-offs. Written from the
          source code.
        </p>
        <div className="prose mt-8">{body}</div>
      </article>
      <Footer locale="en" />
    </>
  );
}
