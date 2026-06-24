import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostList } from "@/components/PostList";
import { WikiList } from "@/components/WikiList";
import { ProfileCard } from "@/components/ProfileCard";
import { ProjectList } from "@/components/ProjectList";
import { HomeSection } from "@/components/HomeSection";
import { getPublishedPosts, listContent } from "@/lib/posts";
import { getFeaturedProjects } from "@/lib/projects";
import { getNow } from "@/lib/now";
import { formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function HomeEN() {
  const [posts, projects, now, wiki] = await Promise.all([
    getPublishedPosts("en"),
    getFeaturedProjects("en", 3),
    getNow("en"),
    listContent("knowledge", "en"),
  ]);
  const recentPosts = posts.slice(0, 5);
  const recentWiki = wiki
    .filter((w) => w.frontmatter.visibility !== "private" && w.frontmatter.status !== "draft")
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1))
    .slice(0, 4);

  return (
    <>
      <Header locale="en" currentPath="/" />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-16">
          <ProfileCard locale="en" currentPath="/" />

          <div className="space-y-12">
            {now?.headline ? (
              <HomeSection id="now" title="Now" seeAll="More" seeAllHref="/now">
                <p className="text-base leading-relaxed text-ink">{now.headline}</p>
                {now.updated ? (
                  <p className="mt-2 font-mono text-xs uppercase tracking-widest text-ink-subtle">
                    Last updated · {formatDate(now.updated, "en")}
                  </p>
                ) : null}
              </HomeSection>
            ) : null}

            <HomeSection id="about" title="About">
              <p className="text-base leading-relaxed text-ink">
                Backend engineer, 6 years building and operating data-heavy
                enterprise systems across global manufacturing, warehouse, and
                finance. The throughline is concurrency and transaction
                integrity: distributed locks that ended cross-server duplicate
                execution, a staging-table batch pattern that cut processing
                time 60%, 46 middleware endpoints consolidated into one RPC
                dispatcher across 8 plants. Now I apply the same
                fault-tolerance discipline — async workflows, retry/backoff,
                state-machine execution — to AI products: LLM pipelines, RAG,
                agent loops. Based in Toronto, open to senior backend or AI
                engineer roles.
              </p>
            </HomeSection>

            <HomeSection
              id="projects"
              title="Featured projects"
              seeAll="All projects"
              seeAllHref="/projects"
            >
              <ProjectList projects={projects} locale="en" />
            </HomeSection>

            <HomeSection
              id="writing"
              title="Recent posts"
              seeAll="All posts"
              seeAllHref="/posts"
            >
              <PostList posts={recentPosts} locale="en" />
            </HomeSection>

            {recentWiki.length > 0 ? (
              <HomeSection
                id="wiki"
                title="Wiki"
                seeAll="All wiki"
                seeAllHref="/wiki"
              >
                <WikiList entries={recentWiki} locale="en" />
              </HomeSection>
            ) : null}
          </div>
        </div>
      </main>
      <Footer locale="en" />
    </>
  );
}
