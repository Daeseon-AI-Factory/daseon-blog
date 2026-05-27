import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { getAllProjects } from "@/lib/projects";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [en, ko, projectsEn, projectsKo] = await Promise.all([
    getPublishedPosts("en"),
    getPublishedPosts("ko"),
    getAllProjects("en"),
    getAllProjects("ko"),
  ]);

  const base = SITE.url.replace(/\/$/, "");
  const now = new Date().toISOString();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, alternates: { languages: { en: `${base}/`, ko: `${base}/ko` } } },
    { url: `${base}/about`, lastModified: now, alternates: { languages: { en: `${base}/about`, ko: `${base}/ko/about` } } },
    { url: `${base}/projects`, lastModified: now, alternates: { languages: { en: `${base}/projects`, ko: `${base}/ko/projects` } } },
    { url: `${base}/posts`, lastModified: now, alternates: { languages: { en: `${base}/posts`, ko: `${base}/ko/posts` } } },
    { url: `${base}/now`, lastModified: now, alternates: { languages: { en: `${base}/now`, ko: `${base}/ko/now` } } },
    { url: `${base}/ko`, lastModified: now, alternates: { languages: { en: `${base}/`, ko: `${base}/ko` } } },
    { url: `${base}/ko/about`, lastModified: now, alternates: { languages: { en: `${base}/about`, ko: `${base}/ko/about` } } },
    { url: `${base}/ko/projects`, lastModified: now, alternates: { languages: { en: `${base}/projects`, ko: `${base}/ko/projects` } } },
    { url: `${base}/ko/posts`, lastModified: now, alternates: { languages: { en: `${base}/posts`, ko: `${base}/ko/posts` } } },
    { url: `${base}/ko/now`, lastModified: now, alternates: { languages: { en: `${base}/now`, ko: `${base}/ko/now` } } },
  ];

  const enEntries: MetadataRoute.Sitemap = en.map((p) => {
    const twin = ko.find((k) => k.frontmatter.translationKey && k.frontmatter.translationKey === p.frontmatter.translationKey);
    const languages: Record<string, string> = { en: `${base}/posts/${p.slug}` };
    if (twin) languages.ko = `${base}/ko/posts/${twin.slug}`;
    return {
      url: `${base}/posts/${p.slug}`,
      lastModified: p.frontmatter.updated ?? p.frontmatter.date,
      alternates: { languages },
    };
  });

  const koEntries: MetadataRoute.Sitemap = ko.map((p) => {
    const twin = en.find((e) => e.frontmatter.translationKey && e.frontmatter.translationKey === p.frontmatter.translationKey);
    const languages: Record<string, string> = { ko: `${base}/ko/posts/${p.slug}` };
    if (twin) languages.en = `${base}/posts/${twin.slug}`;
    return {
      url: `${base}/ko/posts/${p.slug}`,
      lastModified: p.frontmatter.updated ?? p.frontmatter.date,
      alternates: { languages },
    };
  });

  const projectEntries: MetadataRoute.Sitemap = [
    ...projectsEn.map((p) => {
      const twin = projectsKo.find((k) => k.frontmatter.translationKey && k.frontmatter.translationKey === p.frontmatter.translationKey);
      const languages: Record<string, string> = { en: `${base}/projects/${p.slug}` };
      if (twin) languages.ko = `${base}/ko/projects/${twin.slug}`;
      return {
        url: `${base}/projects/${p.slug}`,
        lastModified: p.frontmatter.date,
        alternates: { languages },
      };
    }),
    ...projectsKo.map((p) => {
      const twin = projectsEn.find((e) => e.frontmatter.translationKey && e.frontmatter.translationKey === p.frontmatter.translationKey);
      const languages: Record<string, string> = { ko: `${base}/ko/projects/${p.slug}` };
      if (twin) languages.en = `${base}/projects/${twin.slug}`;
      return {
        url: `${base}/ko/projects/${p.slug}`,
        lastModified: p.frontmatter.date,
        alternates: { languages },
      };
    }),
  ];

  return [...staticEntries, ...enEntries, ...koEntries, ...projectEntries];
}
