"use client";

/** Case film 04 — duplicate LOT IDs → Oracle row-level lock (SK AX).
 *  Sources: resume bullet + faangforge story/row-level-lock (lock scope/duration
 *  refinement). No collaboration quotes in sources — so no people scene. */

import NumberFlow from "@number-flow/react";
import { At, Chip, Edge, Packet, SysNode, Zone } from "../primitives";
import { CaseFilmPlayer, type Scene } from "../player";

const SCENES: Scene[] = [
  {
    id: "setup",
    tag: "SETUP",
    en: "Multiple MES instances generate date-based LOT IDs from ONE shared counter row in the database.",
    ko: "여러 MES 인스턴스가 DB의 공유 카운터 행 하나에서 날짜 기반 LOT ID를 발급한다.",
  },
  {
    id: "before",
    tag: "BEFORE",
    en: "Server A and Server B read the same counter within milliseconds. Both compute the same next number.",
    ko: "서버 A와 B가 몇 ms 차이로 같은 카운터를 읽는다 — 둘 다 같은 다음 번호를 계산한다.",
  },
  {
    id: "failure",
    tag: "FAILURE",
    en: "Two LOTs, one ID. Primary-key errors — and the production line stops while someone untangles it.",
    ko: "LOT은 둘, ID는 하나. PK 에러 — 누군가 푸는 동안 생산 라인이 멈춘다.",
  },
  {
    id: "decision",
    tag: "DECISION",
    en: "Serialize at the ROW, not the table: lock only today's counter row. Then shrink the lock further — one atomic UPDATE instead of read-then-write.",
    ko: "테이블이 아니라 행에서 직렬화 — 오늘 날짜 행만 잠근다. 그리고 read-then-write 대신 원자적 UPDATE 한 방으로 잠금을 더 줄인다.",
  },
  {
    id: "after",
    tag: "AFTER",
    en: "B waits the few milliseconds A holds the row. IDs come out unique, in order. Trade-off accepted: pessimistic = serialized — fine at this volume.",
    ko: "A가 행을 쥔 몇 ms를 B가 기다린다. ID는 유일하게, 순서대로. 트레이드오프 수용: 비관적 잠금=직렬화 — 이 볼륨에선 문제없다.",
  },
  {
    id: "impact",
    tag: "IMPACT",
    en: "Duplicate IDs gone; no more line stops from this cause.",
    ko: "중복 ID 소멸 — 이 원인으로 라인이 멈추는 일도 끝.",
  },
];

function Metric({
  label,
  value,
  active,
  suffix,
  note,
}: {
  label: string;
  value: number;
  active: boolean;
  suffix?: string;
  note?: string;
}) {
  return (
    <div className="flex w-44 flex-col items-center rounded-2xl border-2 border-slate-800 bg-white px-3 py-3 shadow-[3px_3px_0_#1e293b]">
      <span className="text-3xl font-black tabular-nums text-slate-900">
        <NumberFlow value={active ? value : 0} suffix={suffix} />
      </span>
      <span className="mt-1 text-center text-[10px] font-bold leading-tight text-slate-600">{label}</span>
      {note && <span className="text-[9px] text-slate-400">{note}</span>}
    </div>
  );
}

export function RowLockFilm() {
  return (
    <CaseFilmPlayer
      title="Case 04 · Two servers, one number"
      subtitle="Duplicate LOT IDs across instances → Oracle FOR UPDATE, scoped and shrunk"
      scenes={SCENES}
    >
      {(s) => {
        const race = s === 1 || s === 2;
        const after = s >= 4;
        const impact = s === 6;
        const diagram = !impact;
        const dimAll = s === 3;
        return (
          <>
            <Zone x={3} y={8} w={40} h={64} label="MES instances" color="sky" visible={diagram} />
            <Zone x={56} y={8} w={41} h={64} label="Oracle" color="orange" visible={diagram} />

            <At x={18} y={26} visible={diagram} dim={dimAll}>
              <SysNode icon="🖥️" label="Server A" sub={after ? "holds row · commits" : "read seq"} tone={after ? "good" : "neutral"} />
            </At>
            <At x={18} y={54} visible={diagram} dim={dimAll}>
              <SysNode
                icon="🖥️"
                label="Server B"
                sub={after ? "waits ~ms, then next" : "read seq (same ms)"}
                tone={after ? "accent" : "neutral"}
              />
            </At>
            <At x={74} y={40} visible={diagram} dim={dimAll}>
              <SysNode
                icon="🔢"
                label="counter row · today"
                sub={s === 2 ? "both got 1043" : after ? "UPDATE seq=seq+1 RETURNING" : "current_seq = 1042"}
                tone={s === 2 ? "bad" : after ? "good" : "neutral"}
                pulse={s === 2}
              />
            </At>

            {/* race reads */}
            <Edge x1={18} y1={26} x2={74} y2={40} tone={s === 2 ? "bad" : "accent"} visible={race} />
            <Edge x1={18} y1={54} x2={74} y2={40} tone={s === 2 ? "bad" : "accent"} visible={race} />
            {s === 1 && (
              <>
                <Packet from={[18, 26]} to={[74, 40]} tone="accent" duration={1.2} />
                <Packet from={[18, 54]} to={[74, 40]} tone="accent" duration={1.2} />
              </>
            )}
            {s === 2 && (
              <>
                <At x={40} y={16} z={4}>
                  <Chip tone="bad">LOT-…-1043 · twice</Chip>
                </At>
                <At x={40} y={64} z={4}>
                  <Chip tone="bad">PK violation → line stops</Chip>
                </At>
              </>
            )}

            {/* after: serialized access */}
            <Edge x1={18} y1={26} x2={74} y2={40} tone="good" visible={after && diagram} />
            <Edge x1={18} y1={54} x2={74} y2={40} tone="neutral" visible={after && diagram} />
            {s === 4 && <Packet from={[18, 26]} to={[74, 40]} tone="good" duration={1.4} />}
            <At x={40} y={16} visible={after && diagram} z={4}>
              <Chip tone="good">🔒 row lock — today&apos;s row only</Chip>
            </At>
            <At x={40} y={64} visible={after && diagram} z={4}>
              <Chip tone="accent">B queued: waits statement + commit, not the app round-trip</Chip>
            </At>

            {/* DECISION card */}
            <At x={50} y={38} visible={s === 3} z={5}>
              <div className="w-80 rounded-2xl border-2 border-slate-800 bg-white px-4 py-3 text-center shadow-[4px_4px_0_#1e293b]">
                <p className="text-[13px] font-black leading-snug text-slate-900">
                  “Serialize at the row, and hold the lock for a statement — not a conversation.”
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-500">
                  FOR UPDATE on one row → refined to atomic UPDATE … RETURNING
                </p>
              </div>
            </At>

            {impact && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
                <div className="flex flex-wrap items-stretch justify-center gap-4 px-4">
                  <Metric label="duplicate IDs after fix" value={0} active={impact} />
                  <Metric label="rows locked" value={1} active={impact} note="today's counter only" />
                  <Metric label="statements per issue" value={1} active={impact} note="atomic UPDATE…RETURNING" />
                </div>
                <a
                  href="https://faangforge.daeseon.ai/story/row-level-lock"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border-2 border-slate-800 bg-white px-4 py-1.5 text-[12px] font-bold text-slate-800 shadow-[2px_2px_0_#1e293b] hover:bg-slate-50"
                >
                  full deep-dive: lock duration · when pessimistic beats sequences →
                </a>
              </div>
            )}
          </>
        );
      }}
    </CaseFilmPlayer>
  );
}
