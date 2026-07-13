"use client";

/** Case film 02 — 46 middleware endpoints → 1 thin gateway (SK AX).
 *  Sources: resume bullet + ds-forge SKAX/GateWay.md STAR notes.
 *  Numbers (46→1, 8 sites, 1 FTE) from the resume; quotes/PoC from GateWay.md. */

import NumberFlow from "@number-flow/react";
import { At, Boundary, Chip, Edge, Packet, PersonNode, SysNode, Zone } from "../primitives";
import { CaseFilmPlayer, type Scene } from "../player";

const SCENES: Scene[] = [
  {
    id: "setup",
    tag: "SETUP",
    en: "Mobile WMS at an EV battery factory: PDA screens → Tomcat middleware → legacy C# services. Three engineers for all of it.",
    ko: "EV 배터리 공장 모바일 WMS — PDA 화면 → Tomcat 미들웨어 → 레거시 C# 서비스. 엔지니어는 셋.",
  },
  {
    id: "before",
    tag: "BEFORE",
    en: "One middleware endpoint per screen action: 46 one-to-one APIs. The middleware knew every piece of business.",
    ko: "화면 액션마다 미들웨어 엔드포인트 하나 — 1:1 API 46개. 미들웨어가 모든 비즈니스를 알고 있었다.",
  },
  {
    id: "failure",
    tag: "FAILURE",
    en: "Every legacy API change forced a middleware change + redeploy across 8 sites. One engineer became the standing bottleneck.",
    ko: "레거시가 바뀔 때마다 미들웨어 수정 + 8개 사이트 재배포. 엔지니어 한 명이 상시 병목이 됐다.",
  },
  {
    id: "decision",
    tag: "DECISION",
    en: "Proposal: middleware should FORWARD, not know. One common API; a reflection dispatcher routes key → class/method at runtime.",
    ko: "제안 — 미들웨어는 아는 게 아니라 전달만 한다. 공통 API 하나, 리플렉션 디스패처가 런타임에 라우팅.",
  },
  {
    id: "people",
    tag: "PEOPLE",
    en: "The senior pushed back on security — a valid concern. A PoC answered it (7 APIs, 3 UIs, 2 new APIs with zero redeploys); he then hardened it further.",
    ko: "시니어의 보안 우려는 타당했다. PoC(7개 API·3개 화면·재배포 0으로 신규 2개 추가)로 답했고, 그가 방어를 더 얹었다.",
  },
  {
    id: "after",
    tag: "AFTER",
    en: "46 endpoints collapse into one thin gateway. A new legacy API now needs ZERO middleware change.",
    ko: "46개가 얇은 게이트웨이 하나로. 신규 레거시 API에 미들웨어 변경이 0이 됐다.",
  },
  {
    id: "impact",
    tag: "IMPACT",
    en: "Rolled out across 8 sites; operated without the senior afterward.",
    ko: "8개 사이트 전개 — 이후 시니어 없이 혼자 운영했다.",
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
    <div className="flex w-40 flex-col items-center rounded-2xl border-2 border-slate-800 bg-white px-3 py-3 shadow-[3px_3px_0_#1e293b]">
      <span className="text-3xl font-black tabular-nums text-slate-900">
        <NumberFlow value={active ? value : 0} prefix={prefix} suffix={suffix} />
      </span>
      <span className="mt-1 text-center text-[10px] font-bold leading-tight text-slate-600">{label}</span>
      {note && <span className="text-[9px] text-slate-400">{note}</span>}
    </div>
  );
}

/** Fan of one-to-one endpoint lines for the BEFORE mess. */
const FAN_Y = [20, 26, 32, 38, 44, 50, 56, 62];

export function GatewayFilm() {
  return (
    <CaseFilmPlayer
      title="Case 02 · The middleware that knew too much"
      subtitle="46 endpoints → 1 reflection-based gateway — mobile WMS at SK AX"
      scenes={SCENES}
    >
      {(s) => {
        const messy = s === 1 || s === 2;
        const after = s >= 5;
        const impact = s === 6;
        const diagram = !impact;
        const peopleDim = s !== 4;
        return (
          <>
            <Zone x={3} y={8} w={26} h={64} label="Factory floor" color="sky" visible={diagram} />
            <Zone x={64} y={8} w={33} h={64} label="Legacy C# — IIS" color="orange" visible={diagram} />

            <At x={15} y={38} visible={diagram} dim={s === 3 || s === 4}>
              <SysNode icon="📟" label="PDA · 15 screens" sub="scan / move / save" />
            </At>
            <At x={46} y={38} visible={diagram} dim={s === 3 || s === 4}>
              <SysNode
                icon="🧱"
                label="Tomcat middleware"
                sub={
                  after
                    ? "thin gateway — forwards only"
                    : s >= 1
                      ? "46 endpoints · knows business"
                      : "between floor and legacy"
                }
                tone={s === 2 ? "bad" : after ? "good" : "neutral"}
                pulse={s === 2}
              />
            </At>
            <At x={80} y={26} visible={diagram} dim={s === 3 || s === 4}>
              <SysNode icon="🗃️" label="WMS service" sub="C# .NET" />
            </At>
            <At x={80} y={52} visible={diagram} dim={s === 3 || s === 4}>
              <SysNode icon="🗃️" label="Other services" sub="shared server" />
            </At>

            {/* BEFORE: the 1:1 fan */}
            {FAN_Y.map((y) => (
              <Edge key={y} x1={15} y1={38} x2={46} y2={y} tone={s === 2 ? "bad" : "neutral"} visible={messy} />
            ))}
            <At x={30} y={11} visible={messy} z={4}>
              <Chip tone={s === 2 ? "bad" : "warn"}>46 one-to-one APIs</Chip>
            </At>
            <At x={62} y={11} visible={s === 2} z={4}>
              <Chip tone="bad">legacy change → redeploy ×8 sites</Chip>
            </At>

            {/* AFTER: one thin pipe + dispatcher */}
            <Edge x1={15} y1={38} x2={46} y2={38} tone="good" visible={after && diagram} />
            <Packet from={[15, 38]} to={[46, 38]} tone="good" visible={s === 5} />
            <Edge x1={46} y1={38} x2={80} y2={26} tone="accent" visible={after && diagram} />
            <Edge x1={46} y1={38} x2={80} y2={52} tone="accent" visible={after && diagram} />
            <Packet from={[46, 38]} to={[80, 26]} tone="accent" visible={s === 5} duration={1.9} />
            <At x={46} y={11} visible={after && diagram} z={4}>
              <Chip tone="good">1 common API · reflection: key → class/method</Chip>
            </At>
            <At x={62} y={64} visible={after && diagram} z={4}>
              <Chip tone="good">new legacy API = zero middleware change</Chip>
            </At>

            {/* DECISION card */}
            <At x={50} y={38} visible={s === 3} z={5}>
              <div className="w-80 rounded-2xl border-2 border-slate-800 bg-white px-4 py-3 text-center shadow-[4px_4px_0_#1e293b]">
                <p className="text-[13px] font-black leading-snug text-slate-900">
                  “The middleware should forward requests — not know the business.”
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-500">
                  → one common API · dispatch by reflection at runtime
                </p>
              </div>
            </At>

            {/* People */}
            <At x={16} y={86} visible={diagram} dim={peopleDim}>
              <PersonNode
                face="🧑‍💻"
                role="me · junior"
                say={s === 4 ? "Closed network, approved IPs only — and here's the PoC." : undefined}
                tone="accent"
              />
            </At>
            <At x={50} y={86} visible={diagram} dim={peopleDim}>
              <PersonNode
                face="🧔"
                role="senior engineer"
                say={s === 4 ? "What about security? …OK — adding a rate limiter + access-IP logging." : undefined}
                tone="warn"
              />
            </At>
            <At x={82} y={86} visible={diagram} dim={peopleDim}>
              <PersonNode
                face="🧑‍🔧"
                role="team of 3"
                say={s === 4 ? "PoC: 2 new APIs shipped with zero middleware redeploys." : undefined}
                tone="good"
              />
            </At>

            {impact && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
                <div className="flex flex-wrap items-stretch justify-center gap-4 px-4">
                  <Metric label="middleware endpoints" value={46} active={impact} note="→ 1 unified API" />
                  <Metric label="sites deployed" value={8} active={impact} />
                  <Metric label="FTE freed from middleware work" value={1} active={impact} />
                  <Metric label="middleware incidents after launch" value={0} active={impact} />
                </div>
                <a
                  href="https://faangforge.daeseon.ai/story/gateway"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border-2 border-slate-800 bg-white px-4 py-1.5 text-[12px] font-bold text-slate-800 shadow-[2px_2px_0_#1e293b] hover:bg-slate-50"
                >
                  full deep-dive: reflection trade-offs · security layers →
                </a>
              </div>
            )}
          </>
        );
      }}
    </CaseFilmPlayer>
  );
}
