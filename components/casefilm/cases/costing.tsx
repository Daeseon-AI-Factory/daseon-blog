"use client";

/** Case film 05 — costing project trust recovery + PL/SQL refactor (SK AX).
 *  Sources: resume bullet (7.7K→CTEs, −57%, tickets 4→7/wk) + ds-forge
 *  SKAX/"Cost Manage.md" STAR (tech-lead anchor role, self-service page,
 *  thank-you letter at month 7). Quotes trace to that doc. */

import NumberFlow from "@number-flow/react";
import { At, Chip, Edge, Packet, PersonNode, SysNode, Zone } from "../primitives";
import { CaseFilmPlayer, type Scene } from "../player";

const SCENES: Scene[] = [
  {
    id: "setup",
    tag: "SETUP",
    en: "Six months into a costing project, trust is broken: delivery arguments, a replaced lead. I join as tech lead — and listen to both sides first.",
    ko: "코스팅 프로젝트 6개월 차, 신뢰 붕괴 — 지연 논쟁, 리드 교체. 테크리드로 합류해 먼저 양쪽 말을 들었다.",
  },
  {
    id: "before",
    tag: "BEFORE",
    en: "Requests fly from four customer staff to random developers. No priority, no focus — and a 7.7K-line PL/SQL monolith nobody dares to touch.",
    ko: "고객 담당자 넷이 아무 개발자에게나 요청을 던진다. 우선순위도 집중도 없음 — 그리고 아무도 못 건드리는 7.7K줄 PL/SQL 몬스터.",
  },
  {
    id: "decision",
    tag: "DECISION",
    en: "The bottleneck isn't technical — it's that no one anchors the two sides. So: one intake (me), context with every assignment, self-serve the simple things.",
    ko: "병목은 기술이 아니라 양쪽을 잇는 anchor의 부재. 그래서 — 창구 단일화(나), 모든 할당에 비즈니스 맥락, 단순 요청은 셀프서비스로.",
  },
  {
    id: "after",
    tag: "AFTER",
    en: "Requests: customer → me → prioritized → the right dev. A self-service page runs cost verification in staging, so simple checks stop queuing.",
    ko: "요청은 고객→나→우선순위→적임 개발자. 검증용 셀프서비스 페이지(스테이징·권한 제한)로 단순 확인은 줄 서지 않는다.",
  },
  {
    id: "refactor",
    tag: "AFTER",
    en: "The monolith: split by process into CTEs, dead CASE branches removed — validated with the customer before EVERY change, for a month.",
    ko: "몬스터 쿼리는 공정별 CTE로 분리, 죽은 CASE 제거 — 한 달간 매 변경마다 고객과 결과를 대조했다.",
  },
  {
    id: "people",
    tag: "PEOPLE",
    en: "Month 1: “why is it delayed?” Month 7: “can we improve this?” — plus an official thank-you letter to the team.",
    ko: "1개월 차: “왜 늦어요?” → 7개월 차: “이것도 개선해줄 수 있어요?” — 그리고 팀 앞으로 온 공식 감사 편지.",
  },
  {
    id: "impact",
    tag: "IMPACT",
    en: "Not a story about being smart — a story about being the anchor.",
    ko: "똑똑함의 이야기가 아니라, anchor가 된 이야기.",
  },
];

function Metric({
  label,
  value,
  active,
  prefix,
  suffix,
  note,
}: {
  label: string;
  value: number;
  active: boolean;
  prefix?: string;
  suffix?: string;
  note?: string;
}) {
  return (
    <div className="flex w-44 flex-col items-center rounded-2xl border-2 border-slate-800 bg-white px-3 py-3 shadow-[3px_3px_0_#1e293b]">
      <span className="text-3xl font-black tabular-nums text-slate-900">
        <NumberFlow value={active ? value : 0} prefix={prefix} suffix={suffix} />
      </span>
      <span className="mt-1 text-center text-[10px] font-bold leading-tight text-slate-600">{label}</span>
      {note && <span className="text-[9px] text-slate-400">{note}</span>}
    </div>
  );
}

const CUSTOMERS: Array<[number, number]> = [
  [12, 22],
  [12, 40],
  [12, 58],
  [12, 76],
];
const DEVS: Array<[number, number]> = [
  [86, 24],
  [86, 44],
  [86, 64],
];

export function CostingFilm() {
  return (
    <CaseFilmPlayer
      title="Case 05 · Rebuilding trust, then the query"
      subtitle="Costing project: single-intake anchor + 7.7K-line PL/SQL → per-process CTEs"
      scenes={SCENES}
    >
      {(s) => {
        const chaos = s === 1;
        const anchored = s === 3 || s === 4 || s === 5;
        const impact = s === 6;
        const diagram = !impact;
        const dimAll = s === 2;
        return (
          <>
            <Zone x={3} y={8} w={20} h={80} label="Customer · 4 staff" color="orange" visible={diagram} />
            <Zone x={77} y={8} w={20} h={80} label="Devs · 6 + PM" color="sky" visible={diagram} />

            {CUSTOMERS.map(([x, y], i) => (
              <At key={`c${i}`} x={x} y={y} visible={diagram} dim={dimAll || s === 4}>
                <PersonNode
                  face="🧑‍💼"
                  role={`staff ${i + 1}`}
                  tone={chaos ? "warn" : "neutral"}
                  say={s === 5 && i === 0 ? "Month 7: can we improve this too? 💌" : undefined}
                />
              </At>
            ))}
            {DEVS.map(([x, y], i) => (
              <At key={`d${i}`} x={x} y={y} visible={diagram} dim={dimAll || s === 4}>
                <PersonNode
                  face="🧑‍💻"
                  role={`dev ${i * 2 + 1}·${i * 2 + 2}`}
                  tone={chaos ? "bad" : "neutral"}
                  say={s === 5 && i === 1 ? "Context first — we code faster now." : undefined}
                />
              </At>
            ))}

            {/* chaos: crossing request lines */}
            {chaos &&
              CUSTOMERS.flatMap(([, cy], i) =>
                DEVS.map(([, dy], j) =>
                  (i + j) % 2 === 0 ? (
                    <Edge key={`x${i}-${j}`} x1={15} y1={cy} x2={83} y2={dy} tone="bad" visible />
                  ) : null,
                ),
              )}
            <At x={50} y={12} visible={chaos} z={4}>
              <Chip tone="bad">random requests · no priority · no focus</Chip>
            </At>

            {/* the monolith */}
            <At x={50} y={62} visible={(chaos || s === 4) && diagram} dim={false} z={3}>
              <div
                className={`flex h-24 w-32 flex-col items-center justify-center rounded-xl border-2 ${
                  s === 4 ? "border-emerald-500 bg-emerald-50" : "border-slate-700 bg-slate-800"
                } px-2 text-center shadow-md`}
              >
                {s === 4 ? (
                  <div className="flex flex-col gap-1">
                    {["CTE 1 · process A", "CTE 2 · process B", "CTE 3 · process C", "CTE 4 · D", "CTE 5 · E"].map(
                      (t) => (
                        <span key={t} className="rounded bg-white px-1 text-[8px] font-bold text-emerald-700">
                          {t}
                        </span>
                      ),
                    )}
                  </div>
                ) : (
                  <>
                    <span className="text-[10px] font-black text-red-400">7.7K lines</span>
                    <span className="text-[8px] leading-tight text-slate-300">
                      one PL/SQL · nested CASE · dead legacy branches
                    </span>
                  </>
                )}
              </div>
            </At>
            <At x={50} y={78} visible={s === 4} z={4}>
              <Chip tone="good">validated with the customer before every change · ~1 month</Chip>
            </At>

            {/* me as anchor */}
            <At x={38} y={34} visible={anchored && diagram} z={4}>
              <PersonNode face="🧑‍💻" role="me · tech lead (single intake)" tone="accent" />
            </At>
            <At x={62} y={34} visible={anchored && diagram} z={4}>
              <SysNode icon="🗂️" label="prioritized queue" sub="context attached" tone="good" />
            </At>
            <At x={38} y={62} visible={(s === 3 || s === 5) && diagram} z={4}>
              <SysNode icon="🖥️" label="self-service page" sub="staging · limited permission" tone="accent" />
            </At>

            {anchored && diagram && (
              <>
                <Edge x1={15} y1={40} x2={38} y2={34} tone="good" visible />
                <Edge x1={38} y1={34} x2={62} y2={34} tone="good" visible />
                <Edge x1={62} y1={34} x2={83} y2={44} tone="accent" visible />
                {s === 3 && (
                  <>
                    <Packet from={[15, 40]} to={[38, 34]} tone="good" duration={1.3} />
                    <Packet from={[62, 34]} to={[83, 44]} tone="accent" duration={1.3} />
                    <Edge x1={15} y1={58} x2={38} y2={62} tone="accent" visible reverse />
                  </>
                )}
              </>
            )}

            {/* DECISION card */}
            <At x={50} y={38} visible={s === 2} z={5}>
              <div className="w-80 rounded-2xl border-2 border-slate-800 bg-white px-4 py-3 text-center shadow-[4px_4px_0_#1e293b]">
                <p className="text-[13px] font-black leading-snug text-slate-900">
                  “The bottleneck isn&apos;t the code — it&apos;s that nobody anchors the two sides.”
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-500">
                  listen first → single intake → context with every assignment → then fix the code
                </p>
              </div>
            </At>

            {impact && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
                <div className="flex flex-wrap items-stretch justify-center gap-4 px-4">
                  <Metric label="PL/SQL size" value={57} prefix="−" suffix="%" active={impact} note="7.7K lines → per-process CTEs" />
                  <Metric label="weekly ticket throughput" value={7} active={impact} note="was 4" />
                  <Metric label="months to the thank-you letter" value={7} active={impact} note="official, to the team" />
                </div>
                <a
                  href="https://faangforge.daeseon.ai/story/costing"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border-2 border-slate-800 bg-white px-4 py-1.5 text-[12px] font-bold text-slate-800 shadow-[2px_2px_0_#1e293b] hover:bg-slate-50"
                >
                  full deep-dive: stabilize the workflow before the refactor →
                </a>
              </div>
            )}
          </>
        );
      }}
    </CaseFilmPlayer>
  );
}
