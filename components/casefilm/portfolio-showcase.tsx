import Image from "next/image";
import Link from "next/link";
import { CostingFilm } from "@/components/casefilm/cases/costing";
import { ErpMesFilm } from "@/components/casefilm/cases/erp-mes";
import { GatewayFilm } from "@/components/casefilm/cases/gateway";
import { Payload413Film } from "@/components/casefilm/cases/payload-413";
import { RowLockFilm } from "@/components/casefilm/cases/row-level-lock";
import { RESUME_KO } from "@/lib/resumeDataKo";

type PortfolioLocale = "en" | "ko";

const EN_CASES = [
  {
    id: "case-01",
    number: "01",
    focus: "Transaction boundary",
    evidence: "Isolate ERP failure from MES completion",
    Film: ErpMesFilm,
  },
  {
    id: "case-02",
    number: "02",
    focus: "Change surface",
    evidence: "46 endpoints to one common API",
    Film: GatewayFilm,
  },
  {
    id: "case-03",
    number: "03",
    focus: "Payload and freshness",
    evidence: "Send keys, then read fresh state",
    Film: Payload413Film,
  },
  {
    id: "case-04",
    number: "04",
    focus: "Concurrency",
    evidence: "Keep IDs unique across instances",
    Film: RowLockFilm,
  },
  {
    id: "case-05",
    number: "05",
    focus: "Delivery flow",
    evidence: "Stabilize requests, then refactor",
    Film: CostingFilm,
  },
] as const;

const KO_CASES = [
  {
    id: "case-01",
    number: "01",
    focus: "트랜잭션 경계",
    result: "평균 처리시간 60% 단축 · 월 약 20건 수동 재처리를 거의 없앰",
    evidence: "ERP 장애와 MES 완공 상태를 분리",
    Film: ErpMesFilm,
  },
  {
    id: "case-04",
    number: "02",
    focus: "동시성 제어",
    result: "다중 인스턴스에서도 LOT ID 유일성 보장",
    evidence: "오늘 날짜의 카운터 행만 잠그고 잠금 구간 축소",
    Film: RowLockFilm,
  },
  {
    id: "case-03",
    number: "03",
    focus: "페이로드와 최신성",
    result: "모바일 스캔 배치 30 → 80",
    evidence: "PK만 전송하고 저장 시점의 최신 상태를 서버에서 조회",
    Film: Payload413Film,
  },
] as const;

const PRODUCT_COPY = {
  "Talkak (딸깍)": {
    evidence: "실제 macOS 앱 화면",
    description: "여러 AI·CLI 작업을 한 창에서 운영·승인·검증",
  },
  Mimi: {
    evidence: "iOS App Store 출시",
    description: "YouTube 클립을 영어 쉐도잉 훈련으로 변환",
  },
  DocVault: {
    evidence: "로그인 가능한 포트폴리오 데모",
    description: "Windows 엔드포인트 감사와 파일 볼트를 한곳에서 운영",
  },
} as const;

function ProductLinks({ project }: { project: (typeof RESUME_KO.projects)[number] }) {
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] font-bold">
      <a href={project.liveUrl} target="_blank" rel="noreferrer" className="underline decoration-[#cbd0d7] underline-offset-4 hover:decoration-[#111827]">
        {project.liveLabel} ↗
      </a>
      {project.repoUrl && (
        <a href={project.repoUrl} target="_blank" rel="noreferrer" className="underline decoration-[#cbd0d7] underline-offset-4 hover:decoration-[#111827]">
          GitHub ↗
        </a>
      )}
      <Link href={project.detailPath} className="underline decoration-[#cbd0d7] underline-offset-4 hover:decoration-[#111827]">
        구현 기록 ↗
      </Link>
    </p>
  );
}

function ProductFigure({ project, sizes }: { project: (typeof RESUME_KO.projects)[number]; sizes: string }) {
  return (
    <figure>
      <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] border border-[#dfe3e8] bg-[#f3f5f7]">
        <Image src={project.image} alt={project.imageAlt} fill sizes={sizes} className="object-contain" priority={project.name === "Talkak (딸깍)"} />
      </div>
      {project.imageNote && <figcaption className="mt-2 text-[11px] font-medium leading-5 text-[#667085]">{project.imageNote}</figcaption>}
    </figure>
  );
}

function KoreanEvidencePortfolio() {
  const [talkak, mimi, docvault] = RESUME_KO.projects;

  return (
    <main lang="ko" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="grid gap-8 border-b-2 border-[#111827] pb-10 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#7b8491]">Evidence portfolio</p>
          <h1 className="mt-4 max-w-3xl text-[36px] font-black leading-[1.16] tracking-[-0.04em] text-[#111827] sm:text-[52px]">
            직접 만든 제품과<br className="hidden sm:block" /> 운영에서 바꾼 시스템
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] font-medium leading-8 text-[#4b5563]">
            실제 제품 화면 3개와 문제, 판단, 결과가 남은 운영 사례 3개만 보여드립니다. 경력과 기술 목록은 이력서로 분리했습니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-[13px] font-bold">
            <Link href="/ko/resume/toss" className="rounded-full bg-[#111827] px-5 py-3 text-white hover:bg-[#303846]">2쪽 이력서 보기</Link>
            <a href="mailto:showep12@gmail.com" className="rounded-full border border-[#cfd5dd] px-5 py-3 hover:border-[#111827]">이메일</a>
          </div>
        </div>
        <dl className="grid grid-cols-3 border-y border-[#cfd5dd] lg:grid-cols-1 lg:border-y-0 lg:border-l lg:pl-7">
          {[
            ["3", "공개 제품 표면"],
            ["3", "대표 운영 사례"],
            ["6년", "백엔드 설계·운영"],
          ].map(([value, label]) => (
            <div key={label} className="border-r border-[#dfe3e8] px-3 py-4 last:border-r-0 lg:border-b lg:border-r-0 lg:px-0">
              <dt className="text-[11px] font-bold text-[#7b8491]">{label}</dt>
              <dd className="mt-1 text-[24px] font-black tracking-[-0.03em]">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="py-14 sm:py-20" aria-labelledby="product-evidence-heading">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#7b8491]">01 · Product evidence</p>
          <h2 id="product-evidence-heading" className="mt-3 text-[28px] font-black tracking-[-0.03em] sm:text-[36px]">제품은 실제 화면과 공개 링크로</h2>
          <p className="mt-3 text-[14px] font-medium leading-7 text-[#667085]">스크린샷만으로 운영 규모를 주장하지 않습니다. 화면, 스토어·로그인 표면, 공개 소스와 구현 기록을 함께 둡니다.</p>
        </div>

        <article className="mt-9 grid gap-6 rounded-[24px] border border-[#dfe3e8] bg-white p-4 sm:p-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
          <ProductFigure project={talkak} sizes="(max-width: 1023px) 100vw, 650px" />
          <div className="px-1 pb-2 sm:px-2">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#7b8491]">{PRODUCT_COPY[talkak.name].evidence}</p>
            <h3 className="mt-2 text-[28px] font-black tracking-[-0.03em]">{talkak.name}</h3>
            <p className="mt-2 text-[15px] font-bold leading-7 text-[#303846]">{PRODUCT_COPY[talkak.name].description}</p>
            <p className="mt-4 text-[13px] font-medium leading-6 text-[#667085]">{talkak.lines[0]}</p>
            <p className="mt-4 text-[11px] font-bold text-[#7b8491]">{talkak.stack.join(" · ")}</p>
            <div className="mt-5"><ProductLinks project={talkak} /></div>
          </div>
        </article>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {[mimi, docvault].map((project) => (
            <article key={project.name} className="rounded-[24px] border border-[#dfe3e8] bg-white p-4 sm:p-6">
              <ProductFigure project={project} sizes="(max-width: 767px) 100vw, 520px" />
              <div className="mt-5">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#7b8491]">{PRODUCT_COPY[project.name].evidence}</p>
                <h3 className="mt-2 text-[24px] font-black tracking-[-0.03em]">{project.name}</h3>
                <p className="mt-2 text-[14px] font-bold leading-6 text-[#303846]">{PRODUCT_COPY[project.name].description}</p>
                <p className="mt-3 text-[12.5px] font-medium leading-6 text-[#667085]">{project.lines[0]}</p>
                <p className="mt-4 text-[11px] font-bold text-[#7b8491]">{project.stack.join(" · ")}</p>
                <div className="mt-4"><ProductLinks project={project} /></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#cfd5dd] py-12" aria-labelledby="mapping-heading">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#7b8491]">02 · Transfer</p>
        <h2 id="mapping-heading" className="mt-3 text-[28px] font-black tracking-[-0.03em]">제조에서 제품으로 이어진 설계 원칙</h2>
        <div className="mt-7 grid gap-px overflow-hidden border border-[#cfd5dd] bg-[#cfd5dd] md:grid-cols-3">
          {[
            ["트랜잭션 경계", "MES 완공과 ERP 호출을 분리", "Mimi에서 LLM 호출을 DB 트랜잭션 밖으로 이동"],
            ["상태 무결성", "Oracle 행 잠금으로 LOT ID 유일성 보장", "DocVault에서 해시체인으로 변경 흔적 보존"],
            ["실패 격리", "PK-only 요청과 서버 최신 조회", "Mimi에서 제한 재시도와 명시적 실패 상태 기록"],
          ].map(([principle, work, product]) => (
            <article key={principle} className="bg-white p-5 sm:p-6">
              <h3 className="text-[15px] font-black">{principle}</h3>
              <p className="mt-4 text-[12.5px] font-medium leading-6 text-[#4b5563]">운영 · {work}</p>
              <p className="mt-2 border-t border-[#e5e7eb] pt-2 text-[12.5px] font-medium leading-6 text-[#4b5563]">제품 · {product}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-14 sm:py-20" aria-labelledby="production-cases-heading">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#7b8491]">03 · Production decisions</p>
          <h2 id="production-cases-heading" className="mt-3 text-[28px] font-black tracking-[-0.03em] sm:text-[36px]">운영 사례 3개</h2>
          <p className="mt-3 text-[14px] font-medium leading-7 text-[#667085]">성공 화면만 보여주지 않고, 실패 상태와 선택하지 않은 대안까지 장면별로 남겼습니다.</p>
        </div>

        <div className="mt-10 space-y-16">
          {KO_CASES.map((item) => {
            const Film = item.Film;
            return (
              <article key={item.id} id={item.id} className="scroll-mt-8 border-t-2 border-[#111827] pt-6">
                <div className="grid gap-4 md:grid-cols-[70px_1fr_280px] md:items-start">
                  <span className="font-mono text-[11px] font-bold tracking-[0.16em] text-[#7b8491]">{item.number}</span>
                  <div>
                    <h3 className="text-[22px] font-black tracking-[-0.025em]">{item.focus}</h3>
                    <p className="mt-1 text-[13px] font-medium leading-6 text-[#667085]">{item.evidence}</p>
                  </div>
                  <p className="text-[13px] font-bold leading-6 text-[#303846] md:text-right">{item.result}</p>
                </div>
                <div className="mx-auto mt-4 max-w-5xl"><Film locale="ko" /></div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 border-t border-[#cfd5dd] py-10 md:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-[18px] font-black">글로 남긴 다른 운영 사례</h2>
          <p className="mt-2 text-[13px] font-medium leading-6 text-[#667085]">공통 API 통합과 원가 PL/SQL 분해는 긴 기술 기록으로 연결합니다.</p>
          <p className="mt-4 flex flex-wrap gap-4 text-[12px] font-bold">
            <a id="case-02" href="https://faangforge.daeseon.ai/story/gateway" target="_blank" rel="noreferrer" className="scroll-mt-8 underline decoration-[#cbd0d7] underline-offset-4">46개 엔드포인트 → 1개 ↗</a>
            <a id="case-05" href="https://faangforge.daeseon.ai/story/costing" target="_blank" rel="noreferrer" className="scroll-mt-8 underline decoration-[#cbd0d7] underline-offset-4">7.7K줄 PL/SQL 분해 ↗</a>
          </p>
        </div>
        <div className="border-l-0 border-[#dfe3e8] md:border-l md:pl-8">
          <h2 className="text-[18px] font-black">이력서는 2쪽으로 분리했습니다</h2>
          <p className="mt-2 text-[13px] font-medium leading-6 text-[#667085]">경력, 수치, 기술과 학력은 제출용 문서에서 빠르게 훑을 수 있습니다.</p>
          <p className="mt-4"><Link href="/ko/resume/toss" className="text-[12px] font-black underline decoration-[#cbd0d7] underline-offset-4">한국어 이력서 보기 ↗</Link></p>
        </div>
      </section>
    </main>
  );
}

function EnglishCaseFilmPortfolio() {
  return (
    <main lang="en" className="mx-auto max-w-3xl px-5 py-12">
      <header className="mb-8 border-b border-paper-line pb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-subtle">Production case films</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">Five production problems, shown as engineering decisions</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink-muted">Five incidents and redesigns from manufacturing systems. Each film keeps the sequence short: context, failure, decision, change, and the recorded result.</p>
      </header>
      <nav aria-label="Jump to a production case" className="mb-12">
        <ol className="grid gap-2 sm:grid-cols-2 md:grid-cols-5">
          {EN_CASES.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="flex h-full min-h-28 flex-col rounded-xl border border-paper-line bg-white p-3 transition-colors hover:border-ink-subtle hover:bg-paper-line/20">
                <span className="font-mono text-[10px] tracking-widest text-ink-subtle">{item.number}</span>
                <span className="mt-3 text-xs font-semibold leading-snug text-ink">{item.focus}</span>
                <span className="mt-1 text-[11px] leading-snug text-ink-muted">{item.evidence}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div>
        {EN_CASES.map((item) => {
          const Film = item.Film;
          return (
            <section key={item.id} id={item.id} className="scroll-mt-6 border-t border-paper-line pt-7 first:border-t-0 first:pt-0">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] tracking-widest text-ink-subtle">{item.number}</span>
                <h2 className="text-sm font-semibold tracking-tight text-ink">{item.focus}</h2>
              </div>
              <Film />
            </section>
          );
        })}
      </div>
    </main>
  );
}

export function PortfolioShowcase({ locale }: { locale: PortfolioLocale }) {
  return locale === "ko" ? <KoreanEvidencePortfolio /> : <EnglishCaseFilmPortfolio />;
}
