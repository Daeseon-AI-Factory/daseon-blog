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

export default async function HomeKO() {
  const [posts, projects, now, wiki] = await Promise.all([
    getPublishedPosts("ko"),
    getFeaturedProjects("ko"),
    getNow("ko"),
    listContent("knowledge", "ko"),
  ]);
  const recentPosts = posts.slice(0, 5);
  const recentWiki = wiki
    .filter((w) => w.frontmatter.visibility !== "private" && w.frontmatter.status !== "draft")
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1))
    .slice(0, 4);

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
                글로벌 제조·물류·금융의 데이터 집약 엔터프라이즈 시스템을 6년간
                만들고 운영해온 백엔드 엔지니어. 핵심 축은 동시성과 트랜잭션
                무결성입니다 — 서버 간 중복 실행을 없앤 분산 락, 처리 시간을
                60% 줄인 스테이징 테이블·배치 워커 패턴, 8개 공장에 걸쳐 46개
                미들웨어 엔드포인트를 하나의 RPC 디스패처로 통합. 지금은 같은
                결함 내성 원칙 — 비동기 워크플로, 재시도/백오프, 상태 머신 실행 —
                을 AI 제품(LLM 파이프라인, RAG, 에이전트 루프)에 적용하고
                있습니다. 토론토 거주, Senior 백엔드 또는 AI 엔지니어 포지션을
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

            {recentWiki.length > 0 ? (
              <HomeSection
                id="wiki"
                title="위키"
                seeAll="전체 위키"
                seeAllHref="/ko/wiki"
              >
                <WikiList entries={recentWiki} locale="ko" />
              </HomeSection>
            ) : null}
          </div>
        </div>
      </main>
      <Footer locale="ko" />
    </>
  );
}
