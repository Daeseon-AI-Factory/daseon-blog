"use client";

/** Case film 01 — ERP↔MES integration (SK AX).
 *  Source of truth: resume bullets + ds-forge SKAX/ERPMES.md STAR notes.
 *  No invented facts: numbers, people, and quotes trace to those docs. */

import NumberFlow from "@number-flow/react";
import { At, Boundary, Chip, Edge, Packet, PersonNode, SysNode, Zone } from "../primitives";
import { CaseFilmPlayer, type Scene } from "../player";

const SCENES: Scene[] = [
  {
    id: "setup",
    tag: "SETUP",
    en: "Final production step: the product is physically completed and discharged. MES records the event; ERP posts the cost.",
    ko: "마지막 공정 — 제품은 물리적으로 완성되어 출고된다. MES가 기록하고, ERP가 원가를 처리한다.",
  },
  {
    id: "before",
    tag: "BEFORE",
    en: "The MES completion save and the ERP call lived inside ONE transaction boundary.",
    ko: "MES 완공 저장과 ERP 호출이 하나의 트랜잭션 안에 묶여 있었다.",
  },
  {
    id: "failure",
    tag: "FAILURE",
    en: "ERP timeout → the MES completion record rolled back too. The floor finished it; the system lost it. ~20 manual reprocessings a month.",
    ko: "ERP가 죽으면 내 완공 기록까지 롤백 — 현장엔 있는데 시스템엔 없다. 월 ~20건 수동 재처리.",
  },
  {
    id: "decision",
    tag: "DECISION",
    en: "Root cause: one shared boundary. Principle: an external system's failure must not roll back my system's core state.",
    ko: "원인은 공유된 경계. 원칙 — 외부 시스템의 실패가 내 시스템의 핵심 상태를 롤백해선 안 된다.",
  },
  {
    id: "after",
    tag: "AFTER",
    en: "One LOCAL transaction saves completion + a staging row. A batch worker delivers to ERP on its own schedule, with retries.",
    ko: "로컬 트랜잭션은 완공+스테이징만 저장하고 끝. 별도 배치 워커가 자기 스케줄로 ERP에 전달·재시도한다.",
  },
  {
    id: "people",
    tag: "PEOPLE",
    en: "Negotiated, not assumed — the ERP team OK'd eventual consistency (posting date kept), the DBA confirmed polling volume.",
    ko: "가정이 아니라 합의 — ERP팀과 지연 허용·전기일자 유지 합의, DBA와 폴링 부하 확인.",
  },
  {
    id: "impact",
    tag: "IMPACT",
    en: "Failure isolated. The floor and the system agree again.",
    ko: "장애가 격리됐다. 현장과 시스템이 다시 일치한다.",
  },
];

/** One impact tile with a rolling number. */
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
    <div className="flex w-40 flex-col items-center rounded-2xl border-2 border-slate-800 bg-white px-3 py-3 shadow-[3px_3px_0_#1e293b]">
      <span className="text-3xl font-black tabular-nums text-slate-900">
        <NumberFlow value={active ? value : 0} prefix={prefix} suffix={suffix} />
      </span>
      <span className="mt-1 text-center text-[10px] font-bold leading-tight text-slate-600">{label}</span>
      {note && <span className="text-[9px] text-slate-400">{note}</span>}
    </div>
  );
}

export function ErpMesFilm() {
  return (
    <CaseFilmPlayer
      title="Case 01 · Don't let ERP roll back the factory"
      subtitle="MES↔ERP integration — transactional-outbox redesign at SK AX"
      scenes={SCENES}
    >
      {(s) => {
        const before = s === 1 || s === 2;
        const after = s >= 4;
        const impact = s === 6;
        const peopleDim = s >= 1 && s !== 5;
        const diagram = !impact;
        return (
          <>
            {/* Zones */}
            <Zone x={3} y={8} w={51} h={64} label="MES — factory floor" color="sky" visible={diagram} />
            <Zone x={64} y={8} w={33} h={64} label="ERP — finance" color="orange" visible={diagram} />

            {/* Transaction boundaries */}
            <Boundary
              x={21}
              y={16}
              w={69}
              h={54}
              label="ONE transaction"
              tone={s === 2 ? "bad" : "warn"}
              flash={s === 2}
              visible={before}
            />
            <Boundary
              x={17}
              y={18}
              w={37}
              h={52}
              label="local tx — commits instantly"
              tone="good"
              visible={after && diagram}
            />

            {/* Systems */}
            <At x={11} y={30} visible={diagram} dim={s === 3 || s === 5}>
              <SysNode icon="🏭" label="Final process" sub="product discharged" />
            </At>
            <At x={30} y={30} visible={diagram} dim={s === 3 || s === 5}>
              <SysNode icon="⚙️" label="MES App" sub="completion save" tone={after ? "good" : "neutral"} />
            </At>
            <At x={27} y={58} visible={diagram} dim={s === 3 || s === 5}>
              <SysNode
                icon="🗄️"
                label="Completion record"
                sub="MES DB"
                tone={s === 2 ? "bad" : after ? "good" : "neutral"}
                struck={s === 2}
              />
            </At>
            <At x={47} y={58} visible={after && diagram} dim={s === 5}>
              <SysNode icon="📥" label="Staging row" sub="PENDING → SENT/FAIL" tone="good" />
            </At>
            <At x={58} y={38} visible={after && diagram} dim={s === 5}>
              <SysNode icon="🤖" label="Batch worker" sub="own schedule · retry ≤3" tone="accent" />
            </At>
            <At x={80} y={38} visible={diagram} dim={s === 3 || s === 5}>
              <SysNode
                icon="🧾"
                label="ERP"
                sub={s === 2 ? "timeout" : "cost posting"}
                tone={s === 2 ? "bad" : "neutral"}
                pulse={s === 2}
              />
            </At>

            {/* Flows */}
            <Edge x1={11} y1={30} x2={30} y2={30} visible={s === 0} />
            <Packet from={[11, 30]} to={[30, 30]} visible={s === 0} />
            <Edge x1={30} y1={30} x2={27} y2={58} tone={after ? "good" : "neutral"} visible={before || after ? diagram : false} />
            <Edge x1={30} y1={30} x2={80} y2={38} tone={s === 2 ? "bad" : "accent"} visible={before} reverse={s === 2} />
            <Packet from={[30, 30]} to={[80, 38]} visible={s === 1} />
            <Packet from={[80, 38]} to={[27, 58]} tone="bad" visible={s === 2} duration={1.2} />
            <Edge x1={30} y1={30} x2={47} y2={58} tone="good" visible={after && diagram} />
            <Packet from={[30, 30]} to={[47, 58]} tone="good" visible={s === 4} />
            <Edge x1={58} y1={38} x2={47} y2={58} tone="accent" visible={after && diagram} reverse />
            <Edge x1={58} y1={38} x2={80} y2={38} tone="accent" visible={after && diagram} />
            <Packet from={[58, 38]} to={[80, 38]} tone="accent" visible={s === 4} duration={2} />

            {/* Failure-scene chips */}
            <At x={50} y={10} visible={s === 2} z={4}>
              <Chip tone="bad">floor ✓ done · system ✗ missing</Chip>
            </At>

            {/* Decision card */}
            <At x={50} y={38} visible={s === 3} z={5}>
              <div className="w-72 rounded-2xl border-2 border-slate-800 bg-white px-4 py-3 text-center shadow-[4px_4px_0_#1e293b]">
                <p className="text-[13px] font-black leading-snug text-slate-900">
                  “An external system&apos;s failure must not roll back my system&apos;s core
                  state.”
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-500">→ cut the transaction boundary in two</p>
              </div>
            </At>

            {/* AFTER chips */}
            <At x={50} y={10} visible={s === 4} z={4}>
              <Chip tone="good">LOT number = idempotency key</Chip>
            </At>

            {/* People */}
            <At x={12} y={86} visible={diagram} dim={peopleDim}>
              <PersonNode face="🧑‍💻" role="me · backend" say={s === 5 ? "Asked first — then explained the trade-off." : undefined} tone="accent" />
            </At>
            <At x={37} y={86} visible={diagram} dim={peopleDim}>
              <PersonNode face="🧑‍🔬" role="DBA" say={s === 5 ? "Daily volume checked — polling load is fine." : undefined} tone="good" />
            </At>
            <At x={60} y={86} visible={diagram} dim={peopleDim && s !== 2}>
              <PersonNode
                face="👷"
                role="floor operator"
                say={s === 2 ? "It's done — why isn't it in the system?" : s === 5 ? "The phone stopped ringing." : undefined}
                tone={s === 2 ? "bad" : "good"}
              />
            </At>
            <At x={84} y={86} visible={diagram} dim={peopleDim}>
              <PersonNode
                face="🧑‍💼"
                role="ERP manager"
                say={s === 5 ? "Posting date = MES completion time. Agreed — after some pushback." : undefined}
                tone="warn"
              />
            </At>

            {/* Impact tiles */}
            {impact && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
                <div className="flex flex-wrap items-stretch justify-center gap-4 px-4">
                  <Metric label="avg message processing time" value={60} prefix="−" suffix="%" active={impact} />
                  <Metric label="manual reprocessings / month" value={20} active={impact} note="→ near zero" />
                  <Metric label="MES rollbacks from ERP failure" value={0} active={impact} note="after redesign" />
                </div>
                <a
                  href="https://faangforge.daeseon.ai/story/erp-mes"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border-2 border-slate-800 bg-white px-4 py-1.5 text-[12px] font-bold text-slate-800 shadow-[2px_2px_0_#1e293b] hover:bg-slate-50"
                >
                  full deep-dive: code · trade-offs · follow-ups →
                </a>
              </div>
            )}
          </>
        );
      }}
    </CaseFilmPlayer>
  );
}
