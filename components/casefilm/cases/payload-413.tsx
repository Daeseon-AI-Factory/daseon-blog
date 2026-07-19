"use client";

/** Case film 03 — HTTP 413 → PK-only payloads (SK AX).
 *  Sources: resume bullet (batch 30→80) + ds-forge SKAX/Payload413.md.
 *  The "easy fix rejected" and staleness discovery are from the STAR notes. */

import NumberFlow from "@number-flow/react";
import { At, Chip, Edge, Packet, PersonNode, SysNode, Zone } from "../primitives";
import { CaseFilmPlayer, type CaseFilmLocale, type Scene } from "../player";

const SCENES: Scene[] = [
  {
    id: "setup",
    tag: "SETUP",
    en: "Operators scan LOTs on PDAs and save in batches. The save travels through middleware to a legacy C# server — SHARED with other services.",
    ko: "작업자가 PDA로 LOT를 스캔해 배치로 저장 — 저장은 미들웨어를 거쳐 다른 서비스와 '공유 중인' 레거시 서버로 간다.",
  },
  {
    id: "before",
    tag: "BEFORE",
    en: "The client shipped the FULL state of every LOT — fields the server could re-read from its own database.",
    ko: "클라이언트가 LOT의 전체 상태를 통째로 전송 — 서버가 자기 DB에서 다시 읽을 수 있는 필드까지 전부.",
  },
  {
    id: "failure",
    tag: "FAILURE",
    en: "At ~30 LOTs the payload hit the server's limit: HTTP 413. And a hidden bug — operators scan now, save later, so shipped state goes stale.",
    ko: "~30개에서 서버 한계 — HTTP 413. 숨은 버그도: 스캔은 지금, 저장은 나중 — 실어 보낸 상태가 낡는다.",
  },
  {
    id: "decision",
    tag: "DECISION",
    en: "Easy fix — raise the shared server's limit — rejected: it pushes risk onto other services. Instead: send identifiers, not state.",
    ko: "쉬운 수선(공유 서버 한도 증설)은 기각 — 남의 서비스에 위험을 떠넘긴다. 대신: 상태가 아니라 식별자를 보낸다.",
  },
  {
    id: "after",
    tag: "AFTER",
    en: "The client sends key fields only (plant code + LOT number). The server re-fetches FRESH state from the DB at save time.",
    ko: "클라이언트는 키만(플랜트 코드+LOT 번호). 서버가 저장 시점에 DB에서 신선한 상태를 다시 읽는다.",
  },
  {
    id: "impact",
    tag: "IMPACT",
    en: "Bigger batches, zero 413s, shared infrastructure untouched — and the stale-data bug died with it.",
    ko: "배치는 커지고 413은 0, 공유 인프라는 무접촉 — 낡은 데이터 버그도 함께 사라졌다.",
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
    <div className="flex w-40 flex-col items-center rounded-2xl border-2 border-slate-800 bg-white px-3 py-3 shadow-[3px_3px_0_#1e293b]">
      <span className="text-3xl font-black tabular-nums text-slate-900">
        <NumberFlow value={active ? value : 0} suffix={suffix} />
      </span>
      <span className="mt-1 text-center text-[10px] font-bold leading-tight text-slate-600">{label}</span>
      {note && <span className="text-[9px] text-slate-400">{note}</span>}
    </div>
  );
}

export function Payload413Film({ locale = "en" }: { locale?: CaseFilmLocale }) {
  return (
    <CaseFilmPlayer
      title={{
        en: "Case 03 · Send the key, not the truck",
        ko: "Case 03 · 상태 대신 식별자를 전송",
      }}
      subtitle={{
        en: "HTTP 413 on mobile scans → PK-only payloads - batch 30 → 80",
        ko: "모바일 스캔 HTTP 413 - PK-only 요청과 서버 최신 조회",
      }}
      scenes={SCENES}
      locale={locale}
    >
      {(s) => {
        const before = s === 1 || s === 2;
        const after = s >= 4;
        const impact = s === 5; // last scene of SIX — not seven
        const diagram = !impact;
        const dimAll = s === 3;
        return (
          <>
            <Zone x={3} y={8} w={30} h={64} label="Floor — PDA" color="sky" visible={diagram} />
            <Zone x={58} y={8} w={39} h={64} label="Shared legacy server" color="orange" visible={diagram} />

            <At x={16} y={36} visible={diagram} dim={dimAll}>
              <SysNode icon="📟" label="PDA batch save" sub={after ? "keys only" : "full LOT objects"} tone={after ? "good" : "neutral"} />
            </At>
            <At x={45} y={36} visible={diagram} dim={dimAll}>
              <SysNode
                icon="🚧"
                label={s === 2 ? "413 — payload too large" : "middleware"}
                sub={s === 2 ? "rejected at ~30 LOTs" : "forwards"}
                tone={s === 2 ? "bad" : "neutral"}
                pulse={s === 2}
              />
            </At>
            <At x={72} y={36} visible={diagram} dim={dimAll}>
              <SysNode
                icon="🗄️"
                label="Legacy C# server"
                sub={after ? "re-fetches fresh state" : "shared · other services live here"}
                tone={after ? "good" : "neutral"}
              />
            </At>
            <At x={88} y={56} visible={diagram} dim={dimAll}>
              <SysNode icon="📚" label="DB" sub="source of truth" tone={after ? "good" : "neutral"} />
            </At>

            {/* SETUP: the normal save path */}
            <Edge x1={16} y1={36} x2={45} y2={36} visible={s === 0} />
            <Edge x1={45} y1={36} x2={72} y2={36} visible={s === 0} />
            {s === 0 && <Packet from={[16, 36]} to={[72, 36]} duration={2.4} />}

            {/* BEFORE: fat packets */}
            <Edge x1={16} y1={36} x2={45} y2={36} tone={s === 2 ? "bad" : "warn"} visible={before} />
            {before && s === 1 && (
              <>
                <Packet from={[16, 36]} to={[45, 36]} tone="warn" duration={2.2} />
                <At x={30} y={24} z={4}>
                  <Chip tone="warn">full state · every field on the wire</Chip>
                </At>
              </>
            )}
            {s === 2 && (
              <>
                <At x={30} y={24} z={4}>
                  <Chip tone="bad">HTTP 413</Chip>
                </At>
                <At x={30} y={62} z={4}>
                  <Chip tone="bad">scan now → save later = stale fields</Chip>
                </At>
              </>
            )}

            {/* AFTER: tiny key packets + server-side fresh read */}
            <Edge x1={16} y1={36} x2={45} y2={36} tone="good" visible={after && diagram} />
            <Edge x1={45} y1={36} x2={72} y2={36} tone="good" visible={after && diagram} />
            <Edge x1={72} y1={36} x2={88} y2={56} tone="accent" visible={after && diagram} reverse />
            {s === 4 && (
              <>
                <Packet from={[16, 36]} to={[45, 36]} tone="good" duration={1.1} />
                <Packet from={[45, 36]} to={[72, 36]} tone="good" duration={1.1} />
                <Packet from={[88, 56]} to={[72, 36]} tone="accent" duration={1.4} />
              </>
            )}
            <At x={30} y={24} visible={after && diagram} z={4}>
              <Chip tone="good">plant code + LOT no. only</Chip>
            </At>
            <At x={80} y={20} visible={after && diagram} z={4}>
              <Chip tone="good">fresh read at save time</Chip>
            </At>

            {/* DECISION card */}
            <At x={50} y={36} visible={s === 3} z={5}>
              <div className="w-80 rounded-2xl border-2 border-slate-800 bg-white px-4 py-3 text-center shadow-[4px_4px_0_#1e293b]">
                <p className="text-[12px] font-bold text-slate-400 line-through">
                  just raise the shared server&apos;s payload limit
                </p>
                <p className="mt-1 text-[13px] font-black leading-snug text-slate-900">
                  “Send identifiers, not state — the DB is the source of truth.”
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-500">
                  don&apos;t push your risk onto a shared server
                </p>
              </div>
            </At>

            {/* People */}
            <At x={14} y={86} visible={diagram} dim={s !== 2}>
              <PersonNode
                face="👷"
                role="operator"
                say={s === 2 ? "It fails when I save a big batch." : undefined}
                tone={s === 2 ? "bad" : "neutral"}
              />
            </At>
            <At x={50} y={86} visible={diagram} dim={s !== 2}>
              <PersonNode
                face="🧑‍💼"
                role="customer"
                say={s === 2 ? "We need bigger batches than 30." : undefined}
                tone="warn"
              />
            </At>
            <At x={84} y={86} visible={diagram} dim={s !== 2}>
              <PersonNode
                face="🧑‍💻"
                role="me · backend"
                say={s === 2 ? "Reading the server code first — what's actually on the wire?" : undefined}
                tone="accent"
              />
            </At>

            {impact && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
                <div className="flex flex-wrap items-stretch justify-center gap-4 px-4">
                  <Metric label="batch size" value={80} active={impact} note="was 30" />
                  <Metric label="HTTP 413 after fix" value={0} active={impact} />
                  <Metric label="changes to shared infra" value={0} active={impact} note="frugality" />
                </div>
                <a
                  href="https://faangforge.daeseon.ai/story/payload-413"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border-2 border-slate-800 bg-white px-4 py-1.5 text-[12px] font-bold text-slate-800 shadow-[2px_2px_0_#1e293b] hover:bg-slate-50"
                >
                  full deep-dive: staleness · all-or-nothing batch · 26 follow-ups →
                </a>
              </div>
            )}
          </>
        );
      }}
    </CaseFilmPlayer>
  );
}
