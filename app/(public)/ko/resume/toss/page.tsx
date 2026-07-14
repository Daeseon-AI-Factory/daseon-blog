import type { Metadata } from "next";
import { RESUME_KO } from "@/lib/resumeDataKo";

export const metadata: Metadata = {
  title: "유대선 — 이력서 (토스풍)",
  description: "Backend Engineer 유대선 — 숫자로 증명하는 6년. 케이스 필름 포함.",
};

/** 토스풍 스킨 — 같은 resumeDataKo에서 생성되는 두 번째 디자인.
 *  토스 문법: Pretendard, 큰 볼드 숫자, 여백이 구획을 대신함,
 *  #191f28/#4e5968/#3182f6, 라운드 스탯 카드, 한 화면 한 메시지. */

const STATS = [
  { n: "−60%", label: "MES↔ERP 평균 처리시간", film: "case-01" },
  { n: "46 → 1", label: "미들웨어 엔드포인트 통합", film: "case-02" },
  { n: "30 → 80", label: "모바일 배치 처리량 (413 해결)", film: "case-03" },
  { n: "중복 0", label: "다중 인스턴스 ID 발급 (행 잠금)", film: "case-04" },
  { n: "−57%", label: "7.7K줄 PL/SQL → 공정별 CTE", film: "case-05" },
  { n: "4 → 7", label: "주간 원가 티켓 처리량", film: "case-05" },
] as const;

function FilmLink({ film, children }: { film?: string; children?: React.ReactNode }) {
  if (!film) return null;
  return (
    <a
      href={`/portfolio#${film}`}
      className="text-[14px] font-semibold text-[#191f28] underline decoration-[#d1d6db] underline-offset-4 hover:decoration-[#191f28]"
    >
      {children ?? "케이스 필름 →"}
    </a>
  );
}

export default function KoResumeToss() {
  const r = RESUME_KO;
  return (
    <div
      lang="ko"
      className="min-h-screen bg-white text-[#191f28]"
      style={{ fontFamily: "'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif" }}
    >
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
      />
      <main className="mx-auto max-w-[720px] px-6">
        {/* 히어로 — 한 화면 한 메시지 */}
        <section className="pt-28 pb-24">
          <p className="text-[17px] font-semibold text-[#8b95a1]">Backend Engineer · Toronto (캐나다 취업 가능)</p>
          <h1 className="mt-3 text-[48px] font-extrabold leading-[1.15] tracking-[-0.02em]">
            유대선
          </h1>
          <p className="mt-5 max-w-[560px] text-[19px] font-medium leading-[1.6] text-[#4e5968]">
            외부 시스템이 실패해도 제 시스템의 핵심 상태는 무너지지 않게 —{" "}
            제조 현장의 트랜잭션·동시성·신뢰성을 6년간 책임졌습니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="mailto:showep12@gmail.com"
              className="rounded-[14px] bg-[#191f28] px-5 py-3 text-[16px] font-bold text-white hover:bg-[#333d4b]"
            >
              연락하기
            </a>
            <a
              href="/portfolio"
              className="rounded-[14px] bg-[#f2f4f6] px-5 py-3 text-[16px] font-bold text-[#333d4b] hover:bg-[#e5e8eb]"
            >
              케이스 필름 보기
            </a>
            <a
              href="https://github.com/Daeseon-AI-Factory"
              className="rounded-[14px] bg-[#f2f4f6] px-5 py-3 text-[16px] font-bold text-[#333d4b] hover:bg-[#e5e8eb]"
            >
              GitHub
            </a>
          </div>
        </section>

        {/* 숫자로 보는 6년 */}
        <section className="pb-24">
          <h2 className="text-[28px] font-extrabold tracking-[-0.01em]">숫자로 보는 6년</h2>
          <p className="mt-2 text-[16px] text-[#6b7684]">
            전부 실제 운영 시스템에서 측정된 숫자입니다. 누르면 before/after 애니메이션으로 이어집니다.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {STATS.map((s) => (
              <a
                key={s.label}
                href={`/portfolio#${s.film}`}
                className="group rounded-[20px] bg-[#f9fafb] p-5 transition-colors hover:bg-[#f2f4f6]"
              >
                <p className="text-[30px] font-extrabold tracking-[-0.02em] text-[#191f28]">{s.n}</p>
                <p className="mt-1 text-[14px] font-medium leading-snug text-[#6b7684]">{s.label}</p>
                <p className="mt-2 text-[13px] font-semibold text-[#191f28] opacity-0 transition-opacity group-hover:opacity-100">
                  필름 보기 →
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* 경력 */}
        <section className="pb-24">
          <h2 className="text-[28px] font-extrabold tracking-[-0.01em]">경력</h2>
          {r.experience.map((e) => (
            <div key={e.company} className="mt-10">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[21px] font-bold">{e.company}</h3>
                <span className="text-[15px] font-medium text-[#8b95a1]">
                  {e.role} · {e.period}
                </span>
              </div>
              <p className="mt-1 text-[15.5px] text-[#6b7684]">{e.summary}</p>
              <ul className="mt-5 space-y-5">
                {e.bullets.map((b) => (
                  <li key={b.text.slice(0, 30)} className="border-l-2 border-[#e5e8eb] pl-5">
                    <p className="text-[16.5px] font-medium leading-[1.65] text-[#333d4b]">{b.text}</p>
                    {(b.filmId || b.deepDive) && (
                      <p className="mt-1.5 flex gap-4">
                        <FilmLink film={b.filmId} />
                        {b.deepDive && (
                          <a
                            href={`https://faangforge.daeseon.ai/story/${b.deepDive}`}
                            className="text-[14px] font-semibold text-[#8b95a1] hover:text-[#4e5968] hover:underline"
                          >
                            딥다이브
                          </a>
                        )}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* 프로젝트 */}
        <section className="pb-24">
          <h2 className="text-[28px] font-extrabold tracking-[-0.01em]">직접 만든 것들</h2>
          <div className="mt-8 space-y-5">
            {r.projects.map((p) => (
              <div key={p.name} className="rounded-[20px] bg-[#f9fafb] p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-[18px] font-bold">
                    {p.emoji} {p.name}
                  </h3>
                  <span className="text-[13.5px] font-medium text-[#8b95a1]">{p.stack.join(" · ")}</span>
                </div>
                <p className="mt-1 text-[15px] font-medium text-[#4e5968]">{p.tagline}</p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-[1.6] text-[#6b7684] marker:text-[#d1d6db]">
                  {p.lines.map((l) => (
                    <li key={l.slice(0, 30)}>{l}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 스킬 + 학력 */}
        <section className="pb-28">
          <h2 className="text-[28px] font-extrabold tracking-[-0.01em]">기술</h2>
          <div className="mt-6 space-y-3">
            {r.skillGroups.map((g) => (
              <div key={g.group} className="flex items-start gap-3 text-[15px]">
                <span className="w-[110px] shrink-0 pt-1 font-semibold text-[#8b95a1]">{g.group}</span>
                <span className="flex flex-wrap gap-2">
                  {g.tags.map((t) => (
                    <span key={t} className="rounded-full bg-[#f2f4f6] px-3 py-1 text-[13.5px] font-semibold text-[#4e5968]">
                      {t}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-14 flex flex-wrap items-baseline justify-between gap-2 border-t border-[#f2f4f6] pt-8">
            <p className="text-[16px] font-bold">
              {r.education.school} <span className="font-medium text-[#6b7684]">— {r.education.degree}</span>
            </p>
            <span className="text-[14px] font-medium text-[#8b95a1]">{r.education.period}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
