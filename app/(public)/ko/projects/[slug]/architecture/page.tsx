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
  const all = await getAllProjects("ko");
  const out: { slug: string }[] = [];
  for (const p of all) {
    if (await getProjectArchitecture(p.slug, "ko")) out.push({ slug: p.slug });
  }
  return out;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject("ko", slug);
  if (!project) return {};
  return {
    title: `${project.frontmatter.title} — Architecture`,
    description: project.frontmatter.description,
    alternates: {
      canonical: `${SITE.url}/ko/projects/${slug}/architecture`,
      languages: { en: `/projects/${slug}/architecture`, ko: `/ko/projects/${slug}/architecture` },
    },
  };
}

export default async function ArchitecturePageKO({ params }: { params: Params }) {
  const { slug } = await params;
  const project = await getProject("ko", slug);
  const architecture = await getProjectArchitecture(slug, "ko");
  if (!project || !architecture) notFound();
  const body = await renderMdx(architecture);
  return (
    <>
      <Header locale="ko" currentPath={`/ko/projects/${slug}`} />
      <article className="mx-auto max-w-3xl px-5 py-12">
        <Link
          href={localizedPath("ko", `/projects/${slug}`)}
          className="font-mono text-xs uppercase tracking-widest text-accent hover:underline"
        >
          ← {project.frontmatter.title}
        </Link>
        <h1 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">아키텍처</h1>
        <p className="mt-1 text-sm text-ink-muted">
          시스템이 어떻게 구성되어 있는지 — 프로세스 모델, 데이터 흐름, 트레이드오프. 실제 소스
          코드를 기준으로 작성했습니다.
        </p>
        <div className="prose mt-8">{body}</div>
      </article>
      <Footer locale="ko" />
    </>
  );
}
