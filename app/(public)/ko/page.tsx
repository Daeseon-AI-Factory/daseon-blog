import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostList } from "@/components/PostList";
import { ProfileCard } from "@/components/ProfileCard";
import { ProjectList } from "@/components/ProjectList";
import { HomeSection } from "@/components/HomeSection";
import { getPublishedPosts } from "@/lib/posts";
import { getFeaturedProjects } from "@/lib/projects";
import { getNow } from "@/lib/now";
import { formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function HomeKO() {
  const [posts, projects, now] = await Promise.all([
    getPublishedPosts("ko"),
    getFeaturedProjects("ko", 3),
    getNow("ko"),
  ]);
  const recentPosts = posts.slice(0, 5);

  return (
    <>
      <Header locale="ko" currentPath="/ko" />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-16">
          <ProfileCard locale="ko" currentPath="/ko" />

          <div className="space-y-12">
            {now?.headline ? (
              <HomeSection id="now" title="지금" seeAll="더 보기" seeAllHref="/ko/now">
                <p className="text-base leading-relaxed text-ink">{now.headline}</p>
                {now.updated ? (
                  <p className="mt-2 font-mono text-xs uppercase tracking-widest text-ink-subtle">
                    최근 갱신 · {formatDate(now.updated, "ko")}
                  </p>
                ) : null}
              </HomeSection>
            ) : null}

            <HomeSection id="about" title="소개">
              <p className="text-base leading-relaxed text-ink">
                제조·물류·금융 분야의 미션크리티컬 엔터프라이즈 시스템을 6년간
                만들고 현대화해온 소프트웨어 엔지니어. 지금은 Java/Spring
                백엔드 플랫폼과 AI 보조 제품 엔지니어링에 집중하고 있습니다 —
                견고한 백엔드와 실제로 쓰이는 AI 도구를 함께 만듭니다. 현재
                토론토 거주, Senior / Staff 백엔드 또는 AI 엔지니어 포지션을
                찾고 있습니다.
              </p>
            </HomeSection>

            <HomeSection
              id="projects"
              title="대표 프로젝트"
              seeAll="전체 프로젝트"
              seeAllHref="/ko/projects"
            >
              <ProjectList projects={projects} locale="ko" />
            </HomeSection>

            <HomeSection
              id="writing"
              title="최근 글"
              seeAll="전체 글"
              seeAllHref="/ko/posts"
            >
              <PostList posts={recentPosts} locale="ko" />
            </HomeSection>
          </div>
        </div>
      </main>
      <Footer locale="ko" />
    </>
  );
}
