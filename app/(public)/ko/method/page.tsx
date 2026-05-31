import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Method",
  description:
    "AI에게 위임한 작업을 기록하는 방법 — positive-trigger commit hook, tiered decision template (Bezos / Klein / Nygard), AI-author + human-annotator dual column, cross-repo aggregation. daseon.ai 본체 + 4개 satellite 프로젝트에서 동일하게 사용 중인 시스템.",
  alternates: { canonical: "/ko/method", languages: { en: "/method", ko: "/ko/method" } },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-paper-line py-6">
      <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-ink-subtle">
        {title}
      </h2>
      <div className="text-ink">{children}</div>
    </section>
  );
}

export default function MethodKO() {
  return (
    <>
      <Header locale="ko" currentPath="/method" />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">
            Method
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            AI에게 위임한 작업을 기록하는 방법
          </p>
        </header>

        <p className="text-lg leading-relaxed text-ink">
          누구나 AI로 코드를 출하할 수 있는 세상에서 엔지니어의 차별 신호는 *판단의
          레이어*다 — 무엇을 만들지 고른 결정, 어떤 trade-off를 받아들였는지,
          AI가 처음에 추천한 걸 어디서 거절했는지, 자기 이해의 빈 부분을 어떻게
          알아채고 채웠는지. 이 중 무엇도 코드에 살지 않는다. 기록에 살거나
          사라진다. 사라지지 않게 만드는 시스템.
        </p>

        <Section title="네 가지 속성">
          <ol className="list-decimal space-y-2 pl-5 text-[0.95rem]">
            <li>
              <span className="font-medium">기본값으로 놓치지 않음.</span> commit
              hook에 positive trigger 레이어. commit이 200 LOC 초과, 민감 경로
              touch, 또는 architecture-flavored 키워드 포함이면{" "}
              <code className="font-mono text-xs">[no-log]</code> tag를
              override함. 작성자 판단이 약 30% 정도 미끄러지는데 — 시스템이
              잡아냄.
            </li>
            <li>
              <span className="font-medium">AI 작성 + 사람 주석.</span> 모든 AI
              작성 log entry 옆에{" "}
              <code className="font-mono text-xs">.human.mdx</code> 슬롯이
              나란히 렌더링됨. 빈 슬롯은 &ldquo;REVIEW NEEDED&rdquo;로 표시 —
              부재가 *눈에 보임*, 침묵 아님.
            </li>
            <li>
              <span className="font-medium">크로스 레포 aggregation.</span> 5개
              프로젝트 (이 hub + 4개 satellite)가 한 portfolio timeline으로
              모임. pull-on-demand 방식 — sync 없음, 두 번째 source of truth
              없음.
            </li>
            <li>
              <span className="font-medium">Tier별 결정 기록.</span> 무게별로
              templates: Tier 1 substantial → 8 슬롯 MBA-grade template, Tier 2
              notable → 6 슬롯, Tier 3 trivial → 템플릿 없음. 추가로{" "}
              <code className="font-mono text-xs">learning-gap</code> kind —
              내가 *처음에 모르던 것*을 기록. 대부분 시스템이 빠뜨리는 성장
              artifact.
            </li>
          </ol>
        </Section>

        <Section title="결정 tier">
          <p className="text-[0.95rem] text-ink-muted">
            검증된 framework에서 가져옴. 새 슬롯을 만든 게 아니라 실제 조직에서
            load-bearing이었던 것들 활용.
          </p>
          <ul className="mt-3 space-y-3 text-[0.95rem]">
            <li>
              <p className="font-medium">
                Tier 1 — substantial (architecture / vendor / monetization /
                security / data model / major refactor)
              </p>
              <p className="text-ink-muted">
                8 슬롯: Context & constraints · Goals 우선순위 · Options
                considered (≥3, &ldquo;do nothing&rdquo; 포함) 각각
                Cost/Reversibility/Risk/Evidence · Trade-off accepted ·
                Pre-mortem (6개월 뒤 실패 시나리오 3개) · Decision criteria to
                flip · Success measure · Reversal plan.
              </p>
              <p className="mt-1 text-xs text-ink-subtle">
                작성 시간: 20–30분 (제대로 할 때). 목표: 월 3–5개.
              </p>
            </li>
            <li>
              <p className="font-medium">Tier 2 — notable (feature 방향 / UX 결정 / dependency upgrade)</p>
              <p className="text-ink-muted">
                6 슬롯: Context · Options considered (≥2) · Chosen + Why ·
                Trade-off · Reversibility · Verified by. ~5–10분.
              </p>
            </li>
            <li>
              <p className="font-medium">Tier 3 — trivial (rename / lint / formatting / 동작 변경 없는 dep bump)</p>
              <p className="text-ink-muted">
                결정 entry 없음. 그냥 commit.
              </p>
            </li>
          </ul>
        </Section>

        <Section title="판단 레이어 kinds">
          <p className="text-[0.95rem] text-ink-muted">
            세 가지 log kind가 AI 엔지니어의 차별 신호를 운반:
          </p>
          <dl className="mt-3 grid gap-3 text-[0.95rem] sm:grid-cols-[8rem_1fr]">
            <dt className="font-mono text-xs uppercase tracking-widest text-ink-subtle">
              decision
            </dt>
            <dd>
              option weighing 순간의 ADR-style 기록. Tiered. reversibility 필드는
              Bezos two-way / one-way door framing.
            </dd>
            <dt className="font-mono text-xs uppercase tracking-widest text-ink-subtle">
              discussion
            </dt>
            <dd>
              옵션을 surface한 대화 — claude.ai와, 사람과, 또는 brainstorm.
              내가 AI의 default suggestion을 어디서 거절했는지 기록.
            </dd>
            <dt className="font-mono text-xs uppercase tracking-widest text-ink-subtle">
              learning-gap
            </dt>
            <dd>
              처음에 이해 못 했던 것, 그 gap이 어디서 왔는지, 무엇이 click했는지,
              아직 헷갈리는 게 무엇인지. wiki entry와 짝지어 mental model의
              성장을 시간 흐름에 따라 추적.
            </dd>
          </dl>
        </Section>

        <Section title="너의 repo에서 써보기">
          <p className="text-[0.95rem]">
            hook 스크립트, install kit, CLAUDE.md snippet 모두 공개. 한 줄
            install로 dual-write 컨벤션 + positive-trigger hook이 어떤 git
            repo에든 적용됨.
          </p>
          <Link
            href="/ko/posts/install-claude-code-project-log"
            className="mt-3 inline-flex items-center gap-2 text-accent hover:underline"
          >
            설치 가이드 → /posts/install-claude-code-project-log
          </Link>
        </Section>

        <Section title="라이브 빌드">
          <p className="text-[0.95rem]">
            시스템을 *지어가며* 동시에 기록. 아래 post는 실제 순서 — 뭘 시도했고
            뭐가 깨졌고 뭐가 출하됐는지.
          </p>
          <Link
            href="/ko/posts/project-log-system-v1"
            className="mt-3 inline-flex items-center gap-2 text-accent hover:underline"
          >
            프로젝트 로그 시스템 만들기 → /posts/project-log-system-v1
          </Link>
        </Section>

        <Section title="시스템이 참조한 framework들">
          <ul className="space-y-1.5 text-[0.9rem] text-ink-muted">
            <li>Michael Nygard, <em>Documenting Architecture Decisions</em>, 2011 — ADR 패턴.</li>
            <li>Jeff Bezos, 1997 shareholder letter — reversibility용 two-way / one-way door framing.</li>
            <li>Gary Klein, &ldquo;Performing a Project Premortem,&rdquo; <em>Harvard Business Review</em>, 2007.</li>
            <li>Atlassian DACI — decision-roles framework (솔로 작업엔 lightweight 형태).</li>
            <li>Andy Grove, <em>High Output Management</em>, 1983 — 구조화된 정보 capture가 관리 leverage.</li>
            <li>Salvatore Sanfilippo (antirez) — high-signal 개인 엔지니어링 글쓰기 devlog 전통.</li>
            <li>Obsidian / Logseq — linked atomic notes (<code className="font-mono text-xs">[[wiki-link]]</code> syntax 가져옴).</li>
          </ul>
        </Section>

        <Section title="이 시스템이 아닌 것">
          <ul className="space-y-1.5 text-[0.9rem] text-ink-muted">
            <li>CMS 아님. Log는 MDX 파일, 렌더링 레이어는 그냥 읽음.</li>
            <li>Sync 시스템 아님. hub가 satellite log를 *pull on demand*; 두 번째 source of truth 없음.</li>
            <li>관료주의 아님. Tier 3는 &ldquo;그냥 commit, entry 없음&rdquo; — 대부분 commit이 여기 머물름.</li>
            <li>코드 리뷰 대체 아님. 추론을 기록하지, 평가하지는 않음.</li>
          </ul>
        </Section>

        <p className="mt-10 text-sm text-ink-muted">
          spec은 repo의{" "}
          <a
            href="https://github.com/Daeseon-AI-Factory/daseon-blog/blob/main/docs/project-log-system-v1-blueprint.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            <code className="font-mono text-xs">docs/project-log-system-v1-blueprint.md</code>
          </a>
          에서 review 가능. 외부 비판 환영.
        </p>
      </main>
      <Footer locale="ko" />
    </>
  );
}
