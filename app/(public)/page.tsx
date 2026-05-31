import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostList } from "@/components/PostList";
import { ProfileCard } from "@/components/ProfileCard";
import { ProjectList } from "@/components/ProjectList";
import { HomeSection } from "@/components/HomeSection";
import { getPublishedPosts } from "@/lib/posts";
import { getFeaturedProjects } from "@/lib/projects";

export const revalidate = 60;

export default async function HomeEN() {
  const [posts, projects] = await Promise.all([
    getPublishedPosts("en"),
    getFeaturedProjects("en", 3),
  ]);
  const recentPosts = posts.slice(0, 5);

  return (
    <>
      <Header locale="en" currentPath="/" />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-16">
          <ProfileCard locale="en" currentPath="/" />

          <div className="space-y-12">
            <HomeSection id="about" title="About">
              <p className="text-base leading-relaxed text-ink">
                Software engineer with 6 years building and modernizing
                mission-critical enterprise systems across manufacturing,
                warehouse, and financial operations. Currently focused on
                Java/Spring backend platforms and AI-assisted product
                engineering — reliable backends plus practical AI-powered
                tools. Based in Toronto, open to senior / staff backend or AI
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
          </div>
        </div>
      </main>
      <Footer locale="en" />
    </>
  );
}
