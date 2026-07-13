import type { Metadata } from "next";
import { RESUME_KO, TAG_COLORS, type KoBullet } from "@/lib/resumeDataKo";

export const metadata: Metadata = {
  title: "유대선 — 이력서",
  description: "Backend Engineer 유대선 — 트랜잭션 무결성·동시성 제어·시스템 신뢰성. 케이스 필름 포함 이력서.",
  alternates: { canonical: "/ko/resume" },
};

/** 노션풍 한국어 이력서 — lib/resumeDataKo.ts에서 생성.
 *  노션의 디자인 문법(아이콘+커버, 속성 테이블, 콜아웃, 멀티셀렉트 태그,
 *  토글)을 그대로 쓰되, 토글 안에서 케이스 필름 GIF가 재생된다 —
 *  노션이 못 하는 것까지 포함한 "노션보다 노션 같은" 페이지. */

const FILM_GIF: Record<string, string> = {
  "case-01": "/films/case01-film.gif",
  "case-02": "/films/case02-film.gif",
  "case-03": "/films/case03-film.gif",
  "case-04": "/films/case04-film.gif",
  "case-05": "/films/case05-film.gif",
};

function Tag({ children, i }: { children: string; i: number }) {
  return (
    <span
      className="inline-block rounded-[3px] px-1.5 py-px text-[13px] leading-[1.5] text-[#32302c]"
      style={{ background: TAG_COLORS[i % TAG_COLORS.length] }}
    >
      {children}
    </span>
  );
}

function H2({ emoji, children }: { emoji: string; children: string }) {
  return (
    <h2 className="mb-2 mt-10 flex items-center gap-2 text-[24px] font-bold tracking-tight">
      <span>{emoji}</span>
      {children}
    </h2>
  );
}

function BulletItem({ b }: { b: KoBullet }) {
  const gif = b.filmId ? FILM_GIF[b.filmId] : undefined;
  return (
    <li className="my-1.5">
      <span className="leading-[1.65]">{b.text}</span>
      {(gif || b.toggle || b.deepDive) && (
        <details className="group mt-0.5 rounded-[4px]">
          <summary className="flex w-fit cursor-pointer select-none items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-[13px] font-medium text-[#787774] hover:bg-[#f1f1ef] [&::-webkit-details-marker]:hidden">
            <span className="text-[10px] transition-transform duration-150 group-open:rotate-90">▶</span>
            {gif ? "자세히 · 케이스 필름 보기" : "자세히"}
          </summary>
          <div className="ml-1 mt-2 border-l-2 border-[#ededec] pl-4">
            {b.toggle && <p className="mb-2 text-[14px] leading-[1.65] text-[#5f5e5b]">{b.toggle}</p>}
            {gif && (
              <img
                src={gif}
                alt={`${b.filmId} 케이스 필름 애니메이션`}
                loading="lazy"
                className="w-full max-w-[640px] rounded-lg border border-[#ededec]"
              />
            )}
            {b.deepDive && (
              <p className="mt-2 text-[13px]">
                <a
                  className="font-medium text-[#37352f] underline decoration-[#c9c8c5] underline-offset-2 hover:decoration-[#37352f]"
                  href={`https://faangforge.daeseon.ai/story/${b.deepDive}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  🔬 딥다이브 — 코드 · 트레이드오프 · 팔로업 전문
                </a>
              </p>
            )}
          </div>
        </details>
      )}
    </li>
  );
}

export default function KoResumePage() {
  const r = RESUME_KO;
  return (
    <div lang="ko" className="min-h-screen bg-white font-sans text-[#37352f]" style={{ fontFamily: "ui-sans-serif, -apple-system, 'Apple SD Gothic Neo', 'Pretendard', sans-serif" }}>
      {/* 커버 + 아이콘 (노션 문법) */}
      <div className="h-[140px] w-full bg-gradient-to-r from-[#dbeafe] via-[#e0e7ff] to-[#fde8d7]" />
      <main className="mx-auto max-w-[720px] px-5 pb-24">
        <div className="-mt-8 text-[64px] leading-none">{r.emoji}</div>

        <h1 className="mt-3 text-[38px] font-bold tracking-tight">{r.name}</h1>
        <p className="mt-1 text-[17px] font-medium text-[#5f5e5b]">
          {r.title} — {r.tagline}
        </p>

        {/* 속성 테이블 */}
        <div className="mt-5 border-y border-[#ededec] py-1">
          {r.properties.map((p) => (
            <div key={p.label} className="flex items-center gap-2 rounded-[4px] px-1 py-[5px] text-[14px] hover:bg-[#f7f6f3]">
              <span className="flex w-[140px] shrink-0 items-center gap-2 text-[#787774]">
                <span>{p.icon}</span>
                {p.label}
              </span>
              {"href" in p && p.href ? (
                <a className="underline decoration-[#c9c8c5] underline-offset-2 hover:decoration-[#37352f]" href={p.href} target="_blank" rel="noreferrer">
                  {p.value}
                </a>
              ) : (
                <span>{p.value}</span>
              )}
            </div>
          ))}
        </div>

        {/* 콜아웃 */}
        <div className="mt-6 flex gap-3 rounded-[6px] bg-[#f1f1ef] p-4 text-[14.5px] leading-[1.7]">
          <span className="text-[18px]">💡</span>
          <p>{r.callout}</p>
        </div>

        <H2 emoji="🛠">기술 스택</H2>
        <div className="space-y-2">
          {r.skillGroups.map((g) => (
            <div key={g.group} className="flex items-start gap-2 text-[14px]">
              <span className="w-[110px] shrink-0 pt-px text-[#787774]">{g.group}</span>
              <span className="flex flex-wrap gap-1.5">
                {g.tags.map((t, i) => (
                  <Tag key={t} i={i}>
                    {t}
                  </Tag>
                ))}
              </span>
            </div>
          ))}
        </div>

        <H2 emoji="💼">경력</H2>
        {r.experience.map((e) => (
          <section key={e.company} className="mb-8">
            <div className="flex flex-wrap items-baseline justify-between gap-1">
              <h3 className="text-[19px] font-bold">
                {e.company} <span className="ml-1 text-[15px] font-medium text-[#5f5e5b]">{e.role}</span>
              </h3>
              <span className="rounded-[3px] bg-[#f1f1ef] px-1.5 py-px text-[13px] text-[#5f5e5b]">{e.period}</span>
            </div>
            <p className="mt-0.5 text-[14px] italic text-[#787774]">{e.summary}</p>
            <ul className="mt-2 list-disc pl-5 text-[15px] marker:text-[#c9c8c5]">
              {e.bullets.map((b) => (
                <BulletItem key={b.text.slice(0, 30)} b={b} />
              ))}
            </ul>
          </section>
        ))}

        <H2 emoji="🚀">사이드 프로젝트</H2>
        <div className="space-y-4">
          {r.projects.map((p) => (
            <section key={p.name} className="rounded-[8px] border border-[#ededec] p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <h3 className="text-[16.5px] font-bold">
                  {p.emoji} {p.name} <span className="ml-1 text-[14px] font-normal text-[#5f5e5b]">— {p.tagline}</span>
                </h3>
                <span className="flex gap-1">
                  {p.stack.map((s, i) => (
                    <Tag key={s} i={i + 2}>
                      {s}
                    </Tag>
                  ))}
                </span>
              </div>
              <ul className="mt-2 list-disc pl-5 text-[14px] leading-[1.65] text-[#44423e] marker:text-[#c9c8c5]">
                {p.lines.map((l) => (
                  <li key={l.slice(0, 30)} className="my-1">
                    {l}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <H2 emoji="🎓">학력</H2>
        <div className="flex items-baseline justify-between text-[15px]">
          <p>
            <b>{r.education.school}</b> — {r.education.degree}
          </p>
          <span className="rounded-[3px] bg-[#f1f1ef] px-1.5 py-px text-[13px] text-[#5f5e5b]">{r.education.period}</span>
        </div>

        <hr className="my-10 border-[#ededec]" />
        <p className="text-[13px] text-[#787774]">
          이 페이지는 데이터 파일에서 생성됩니다 — 모든 숫자는 영문 이력서(PDF)와 동일 원본.{" "}
          <a className="underline decoration-[#c9c8c5] underline-offset-2" href="https://daeseon.ai/portfolio">
            케이스 필름 전체 보기 →
          </a>
        </p>
      </main>
    </div>
  );
}
