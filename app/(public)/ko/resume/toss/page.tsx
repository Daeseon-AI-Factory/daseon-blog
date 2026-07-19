import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RESUME_KO, type KoBullet } from "@/lib/resumeDataKo";
import { RESUME_TARGETS } from "@/lib/resumeTargets";

export const metadata: Metadata = {
  title: "유대선 - 백엔드 엔지니어 이력서",
  description: "트랜잭션 경계, 동시성 제어, 외부 연동 신뢰성을 다뤄 온 백엔드 엔지니어 유대선의 이력서.",
};

const externalLinkClass =
  "font-semibold underline decoration-[#c9ced6] underline-offset-[3px] hover:decoration-[#111827]";

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={externalLinkClass}>
      {children} ↗
    </a>
  );
}

function CaseLink({ filmId }: { filmId?: string }) {
  if (!filmId) return null;
  return (
    <Link
      href={`/ko/portfolio#${filmId}`}
      className="case-link shrink-0 text-[10px] font-extrabold tracking-[0.08em] text-[#6b7280] underline decoration-[#d1d5db] underline-offset-[3px] hover:text-[#111827]"
    >
      {filmId.replace("case-", "CASE ")} ↗
    </Link>
  );
}

function CareerBullet({ bullet, index }: { bullet: KoBullet; index: number }) {
  return (
    <li className="career-bullet grid grid-cols-[22px_1fr] gap-3">
      <span className="pt-[2px] font-mono text-[10px] font-bold tabular-nums text-[#9ca3af]">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13.5px] font-medium leading-[1.58] text-[#303846]">
            {bullet.label && <strong className="font-extrabold text-[#111827]">{bullet.label}. </strong>}
            {bullet.text}
          </p>
          <CaseLink filmId={bullet.filmId} />
        </div>
      </div>
    </li>
  );
}

function RunningHeader({ page }: { page: number }) {
  return (
    <div className="running-header flex items-center justify-between border-b border-[#d9dde3] pb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7b8491]">
      <span>유대선 · Backend Engineer</span>
      <span>{String(page).padStart(2, "0")} / 02</span>
    </div>
  );
}

export default async function KoResumeToss({
  searchParams,
}: {
  searchParams: Promise<{ target?: string; pdf?: string }>;
}) {
  const r = RESUME_KO;
  const params = await searchParams;
  const target = params.target ? RESUME_TARGETS[params.target] : undefined;
  const pdfMode = params.pdf === "1";
  const [primaryCareer, earlierCareer] = r.experience;
  const primaryBullets = primaryCareer.bullets.slice(0, 5);
  const additionalBullets = primaryCareer.bullets.slice(5);
  const resumeProjects = r.projects.filter((project) => project.showInResume);

  return (
    <div
      lang="ko"
      className="min-h-screen bg-[#eef1f4] text-[#111827]"
      style={{ fontFamily: "'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif" }}
    >
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
      />
      <style>{`
        * { box-sizing: border-box; }
        .resume-sheet { width: 100%; max-width: 210mm; min-height: 297mm; }
        .resume-copy { word-break: keep-all; overflow-wrap: break-word; }
        @page { size: A4; margin: 0; }
        @media print {
          html, body { width: 210mm; background: #fff !important; }
          .screen-only { display: none !important; }
          .resume-shell { display: block !important; padding: 0 !important; }
          .resume-sheet {
            width: 210mm !important;
            max-width: none !important;
            height: 297mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 11mm 13mm 10mm !important;
            overflow: hidden !important;
            box-shadow: none !important;
            break-after: page;
            page-break-after: always;
          }
          .resume-sheet:last-child { break-after: auto; page-break-after: auto; }
          .resume-page-two {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .resume-page-two > * { margin-top: 0 !important; flex-shrink: 0 !important; }
          .career-bullet, .project-proof, .additional-proof, .education-block {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          h1, h2, h3, .company-heading { break-after: avoid; page-break-after: avoid; }
          p, li { orphans: 3; widows: 3; }
          a { color: #111827 !important; }
        }
        @media screen and (max-width: 767px) {
          .resume-sheet { min-height: auto; }
          .case-link { display: none; }
        }
      `}</style>

      {!pdfMode && (
        <nav className="screen-only border-b border-[#dfe3e8] bg-white" aria-label="이력서 탐색">
          <div className="mx-auto flex max-w-[900px] flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
            <Link href="/ko/resume/toss" className="text-[14px] font-extrabold tracking-[-0.01em]">
              유대선 · Backend Engineer
            </Link>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-semibold text-[#667085]">
              <Link href="/ko/portfolio" className="hover:text-[#111827]">포트폴리오</Link>
              <Link href="/ko/projects" className="hover:text-[#111827]">프로젝트</Link>
              <Link href="/resume" className="hover:text-[#111827]">English resume</Link>
            </div>
          </div>
        </nav>
      )}

      <main className="resume-shell resume-copy grid gap-8 px-0 py-0 md:px-6 md:py-10 print:block">
        <section className="resume-sheet mx-auto bg-white px-5 py-8 shadow-none md:px-[13mm] md:py-[11mm] md:shadow-[0_16px_60px_rgba(15,23,42,0.12)]" aria-label="이력서 1쪽">
          <header>
            <div className="flex flex-col gap-5 border-b-2 border-[#111827] pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#7b8491]">
                  Backend Engineer · 6 years
                </p>
                <h1 className="mt-2 text-[42px] font-black leading-none tracking-[-0.045em]">{r.name}</h1>
              </div>
              <div className="text-[11.5px] font-medium leading-[1.75] text-[#4b5563] sm:text-right">
                <p><a href={r.links.email} className={externalLinkClass}>showep12@gmail.com</a></p>
                <p><ExternalLink href={r.links.linkedin}>LinkedIn</ExternalLink> · <ExternalLink href={r.links.github}>GitHub</ExternalLink></p>
                <p><Link href={r.links.portfolio} className={externalLinkClass}>daeseon.ai/ko/portfolio ↗</Link></p>
              </div>
            </div>

            <p className="mt-5 max-w-[690px] text-[24px] font-black leading-[1.36] tracking-[-0.028em]">
              {r.tagline}
            </p>
            <p className="mt-3 max-w-[720px] text-[13.5px] font-medium leading-[1.7] text-[#4b5563]">
              {r.summary}
            </p>
          </header>

          <section className="mt-6" aria-labelledby="proof-heading">
            <div className="flex items-end justify-between gap-4">
              <h2 id="proof-heading" className="text-[11px] font-black uppercase tracking-[0.14em] text-[#111827]">대표 결과</h2>
              <p className="text-[9.5px] font-medium text-[#7b8491]">각 항목은 포트폴리오의 운영 사례로 연결됩니다.</p>
            </div>
            <div className="mt-3 grid gap-px overflow-hidden border-y border-[#111827] bg-[#d9dde3] sm:grid-cols-3">
              {r.outcomes.map((outcome) => (
                <Link key={outcome.filmId} href={`/ko/portfolio#${outcome.filmId}`} className="bg-white px-3 py-3.5 hover:bg-[#f8fafc]">
                  <p className="text-[14px] font-black leading-tight tracking-[-0.01em]">{outcome.value}</p>
                  <p className="mt-1.5 text-[10.5px] font-medium leading-[1.45] text-[#667085]">{outcome.label}</p>
                </Link>
              ))}
            </div>
          </section>

          {target && (
            <aside className="screen-only mt-6 border-l-4 border-[#111827] bg-[#f7f8fa] p-5" aria-label={`${target.company} 지원 매핑`}>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#667085]">{target.company} · {target.team}</p>
              <p className="mt-2 text-[17px] font-extrabold leading-[1.5]">{target.headline}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {target.contributions.map((contribution) => (
                  <div key={contribution.need}>
                    <p className="text-[11px] font-bold text-[#667085]">{contribution.need}</p>
                    <p className="mt-1 text-[12.5px] leading-[1.6] text-[#303846]">{contribution.how}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11.5px] leading-[1.6] text-[#667085]"><strong className="text-[#111827]">경험의 경계.</strong> {target.honestGap}</p>
            </aside>
          )}

          <section className="mt-7" aria-labelledby="career-heading">
            <div className="flex items-end justify-between border-b border-[#111827] pb-2.5">
              <h2 id="career-heading" className="text-[22px] font-black tracking-[-0.025em]">경력</h2>
              <span className="font-mono text-[10px] font-bold tracking-[0.08em] text-[#7b8491]">2020.06 - 2026.05</span>
            </div>

            <article className="mt-5">
              <div className="company-heading flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <h3 className="text-[18px] font-black tracking-[-0.02em]">{primaryCareer.company}</h3>
                  <p className="mt-1 text-[11.5px] font-medium text-[#667085]">{primaryCareer.summary}</p>
                </div>
                <p className="text-[11.5px] font-bold text-[#4b5563]">{primaryCareer.role} · {primaryCareer.period}</p>
              </div>
              <ol className="mt-4 space-y-3">
                {primaryBullets.map((bullet, index) => (
                  <CareerBullet key={`${bullet.label}-${bullet.text}`} bullet={bullet} index={index} />
                ))}
              </ol>
            </article>

            <article className="mt-5 border-t border-[#d9dde3] pt-4">
              <div className="company-heading flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <h3 className="text-[15px] font-black">{earlierCareer.company}</h3>
                  <p className="mt-0.5 text-[10.5px] font-medium text-[#667085]">{earlierCareer.summary}</p>
                </div>
                <p className="text-[10.5px] font-bold text-[#4b5563]">{earlierCareer.role} · {earlierCareer.period}</p>
              </div>
              <div className="mt-2.5">
                <CareerBullet bullet={earlierCareer.bullets[0]} index={0} />
              </div>
            </article>
          </section>

          <footer className="mt-5 flex items-center justify-between border-t border-[#d9dde3] pt-3 text-[9px] font-medium text-[#8a93a0]">
            <span>상세 구현과 트레이드오프: daeseon.ai/ko/portfolio</span>
            <span>01 / 02</span>
          </footer>
        </section>

        <section className="resume-sheet resume-page-two mx-auto flex flex-col bg-white px-5 py-8 shadow-none md:px-[13mm] md:py-[11mm] md:shadow-[0_16px_60px_rgba(15,23,42,0.12)]" aria-label="이력서 2쪽">
          <RunningHeader page={2} />

          <section className="mt-6" aria-labelledby="products-heading">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#7b8491]">Applied beyond manufacturing</p>
            <h2 id="products-heading" className="mt-2 text-[24px] font-black tracking-[-0.03em]">제품에서 다시 검증한 설계</h2>
            <p className="mt-2 max-w-[720px] text-[12.5px] font-medium leading-[1.65] text-[#4b5563]">{r.callout}</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {resumeProjects.map((project) => (
                <article key={project.name} className="project-proof border-t-2 border-[#111827] pt-4">
                  <div>
                    <div>
                      <p className="text-[9.5px] font-black uppercase tracking-[0.1em] text-[#7b8491]">{project.signal}</p>
                      <h3 className="mt-1 text-[18px] font-black tracking-[-0.02em]">{project.name}</h3>
                    </div>
                  </div>
                  <p className="mt-2 text-[12px] font-bold leading-[1.5] text-[#303846]">{project.tagline}</p>
                  <ul className="mt-3 space-y-2 text-[11.5px] font-medium leading-[1.58] text-[#4b5563]">
                    {project.lines.map((line) => (
                      <li key={line} className="grid grid-cols-[7px_1fr] gap-2">
                        <span aria-hidden className="mt-[7px] h-[3px] w-[3px] rounded-full bg-[#111827]" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[10px] font-bold leading-[1.5] text-[#7b8491]">{project.stack.join(" · ")}</p>
                  <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10.5px]">
                    <ExternalLink href={project.liveUrl}>{project.liveLabel}</ExternalLink>
                    {project.repoUrl && <ExternalLink href={project.repoUrl}>GitHub</ExternalLink>}
                    <Link href={project.detailPath} className={externalLinkClass}>상세 기록 ↗</Link>
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-7" aria-labelledby="additional-heading">
            <div className="flex items-end justify-between border-b border-[#111827] pb-2.5">
              <h2 id="additional-heading" className="text-[18px] font-black tracking-[-0.02em]">추가 운영·전달 성과</h2>
              <span className="text-[9.5px] font-medium text-[#7b8491]">SK AX</span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {additionalBullets.map((bullet, index) => (
                <article key={bullet.text} className="additional-proof border-l-2 border-[#d9dde3] pl-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] font-medium leading-[1.58] text-[#303846]">
                      {bullet.label && <strong className="font-black text-[#111827]">{bullet.label}. </strong>}
                      {bullet.text}
                    </p>
                    <CaseLink filmId={bullet.filmId} />
                  </div>
                  <span className="sr-only">추가 성과 {index + 1}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-7 grid gap-6 border-t-2 border-[#111827] pt-5 sm:grid-cols-[1.55fr_0.9fr]" aria-label="기술과 학력">
            <div>
              <h2 className="text-[17px] font-black tracking-[-0.02em]">기술</h2>
              <dl className="mt-3 border-t border-[#d9dde3]">
                {r.skillGroups.map((group) => (
                  <div key={group.group} className="grid grid-cols-[78px_1fr] gap-3 border-b border-[#e5e7eb] py-2 text-[10.5px] leading-[1.5]">
                    <dt className="font-black text-[#667085]">{group.group}</dt>
                    <dd className="font-medium text-[#303846]">{group.tags.join(" · ")}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="education-block">
              <h2 className="text-[17px] font-black tracking-[-0.02em]">학력</h2>
              <div className="mt-3 border-t border-[#d9dde3] pt-3">
                <p className="text-[12.5px] font-black">{r.education.school}</p>
                <p className="mt-1 text-[11px] font-medium text-[#4b5563]">{r.education.degree}</p>
                <p className="mt-2 font-mono text-[9.5px] font-bold text-[#7b8491]">{r.education.period}</p>
              </div>
            </div>
          </section>

          <aside className="mt-7 border border-[#cfd5dd] bg-[#f8fafc] px-4 py-3.5" aria-label="웹 포트폴리오 안내">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11.5px] font-black">실제 화면과 before/after 케이스 필름은 웹 포트폴리오에서 확인할 수 있습니다.</p>
                <p className="mt-1 text-[9.5px] font-medium text-[#667085]">Talkak macOS 화면 · Mimi App Store · DocVault 데모 · 제조 운영 사례</p>
              </div>
              <Link href="/ko/portfolio" className="shrink-0 text-[11px] font-black underline decoration-[#9ca3af] underline-offset-4">daeseon.ai/ko/portfolio ↗</Link>
            </div>
          </aside>

          <footer className="mt-6 flex flex-col gap-2 border-t border-[#111827] pt-4 text-[10px] font-medium text-[#4b5563] sm:flex-row sm:items-center sm:justify-between">
            <p>showep12@gmail.com · linkedin.com/in/daeseon-yoo · github.com/Daeseon-AI-Factory</p>
            <p className="font-mono font-bold text-[#7b8491]">02 / 02</p>
          </footer>
        </section>
      </main>
    </div>
  );
}
