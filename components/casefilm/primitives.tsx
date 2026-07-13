"use client";

/** Case-film stage primitives — BBG-style diagram grammar.
 *  Everything positions in stage-percent coordinates via <At>.
 *  Self-contained styling (paper canvas) so it reads the same in
 *  light/dark blog themes. */

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export type Tone = "neutral" | "good" | "bad" | "accent" | "warn";

const TONE_BORDER: Record<Tone, string> = {
  neutral: "border-slate-300",
  good: "border-emerald-500",
  bad: "border-red-500",
  accent: "border-sky-500",
  warn: "border-amber-500",
};
const TONE_BG: Record<Tone, string> = {
  neutral: "bg-white",
  good: "bg-emerald-50",
  bad: "bg-red-50",
  accent: "bg-sky-50",
  warn: "bg-amber-50",
};

/** Percent-positioned, centered actor. Fades/scales on visibility. */
export function At({
  x,
  y,
  z = 1,
  visible = true,
  dim = false,
  children,
}: {
  x: number;
  y: number;
  z?: number;
  visible?: boolean;
  dim?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, zIndex: z }}
      initial={false}
      animate={{
        opacity: visible ? (dim ? 0.25 : 1) : 0,
        scale: visible ? 1 : 0.85,
      }}
      transition={{ duration: 0.45 }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2">{children}</div>
    </motion.div>
  );
}

/** System box: icon + label (+sub). */
export function SysNode({
  icon,
  label,
  sub,
  tone = "neutral",
  pulse = false,
  struck = false,
}: {
  icon: string;
  label: string;
  sub?: string;
  tone?: Tone;
  pulse?: boolean;
  struck?: boolean;
}) {
  return (
    <motion.div
      className={`flex flex-col items-center gap-0.5 rounded-xl border-2 px-3 py-2 shadow-sm ${TONE_BORDER[tone]} ${TONE_BG[tone]}`}
      animate={
        pulse
          ? { boxShadow: ["0 0 0 0 rgba(239,68,68,0.6)", "0 0 0 12px rgba(239,68,68,0)"] }
          : { boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }
      }
      transition={pulse ? { duration: 1, repeat: Infinity } : undefined}
    >
      <span className="text-2xl leading-none">{icon}</span>
      <span
        className={`whitespace-nowrap text-[11px] font-bold text-slate-800 ${struck ? "line-through opacity-50" : ""}`}
      >
        {label}
      </span>
      {sub && <span className="whitespace-nowrap text-[9px] text-slate-500">{sub}</span>}
    </motion.div>
  );
}

/** Person: avatar circle + role, optional speech chip above. */
export function PersonNode({
  face,
  role,
  say,
  tone = "neutral",
}: {
  face: string;
  role: string;
  say?: string;
  tone?: Tone;
}) {
  return (
    <div className="relative flex flex-col items-center gap-1">
      {say && (
        /* positioning lives on this wrapper — motion.div owns `transform`,
           so a Tailwind translate on it would be clobbered by the y animation */
        <div className="absolute bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`w-max max-w-[180px] rounded-lg border-2 px-2 py-1 text-center text-[10px] font-medium leading-snug text-slate-700 shadow-sm ${TONE_BORDER[tone]} ${TONE_BG[tone]}`}
          >
            {say}
          </motion.div>
        </div>
      )}
      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-xl shadow-sm">
        {face}
      </span>
      <span className="whitespace-nowrap text-[10px] font-semibold text-slate-600">{role}</span>
    </div>
  );
}

/** Tinted background zone with a corner label. Percent rect. */
export function Zone({
  x,
  y,
  w,
  h,
  label,
  color,
  visible = true,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: "sky" | "orange" | "emerald";
  visible?: boolean;
}) {
  const c = {
    sky: "bg-sky-100/60 border-sky-200 text-sky-700",
    orange: "bg-orange-100/60 border-orange-200 text-orange-700",
    emerald: "bg-emerald-100/60 border-emerald-200 text-emerald-700",
  }[color];
  return (
    <motion.div
      className={`absolute rounded-2xl border ${c}`}
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.45 }}
    >
      <span className="absolute left-2 top-1 text-[10px] font-bold uppercase tracking-wide">
        {label}
      </span>
    </motion.div>
  );
}

/** Dashed boundary rect (transaction scope). */
export function Boundary({
  x,
  y,
  w,
  h,
  label,
  tone = "warn",
  visible = true,
  flash = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  tone?: Tone;
  visible?: boolean;
  flash?: boolean;
}) {
  const color =
    tone === "bad" ? "border-red-500" : tone === "good" ? "border-emerald-500" : "border-amber-500";
  const text =
    tone === "bad" ? "text-red-600 bg-red-50" : tone === "good" ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50";
  return (
    <motion.div
      className={`absolute rounded-2xl border-2 border-dashed ${color}`}
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, zIndex: 2 }}
      initial={false}
      animate={{
        opacity: visible ? (flash ? [1, 0.35, 1] : 1) : 0,
      }}
      transition={flash ? { duration: 0.9, repeat: Infinity } : { duration: 0.45 }}
    >
      <span
        className={`absolute -top-2.5 left-3 rounded px-1.5 text-[10px] font-bold ${text}`}
      >
        {label}
      </span>
    </motion.div>
  );
}

/** SVG flow edge in percent coords, marching-ants dash. */
export function Edge({
  x1,
  y1,
  x2,
  y2,
  tone = "neutral",
  visible = true,
  reverse = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tone?: Tone;
  visible?: boolean;
  reverse?: boolean;
}) {
  const stroke = { neutral: "#94a3b8", good: "#10b981", bad: "#ef4444", accent: "#0ea5e9", warn: "#f59e0b" }[tone];
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ zIndex: 1 }}
      aria-hidden
    >
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth={2.5}
        strokeDasharray="6 5"
        vectorEffect="non-scaling-stroke"
        className={visible ? (reverse ? "cf-dash-rev" : "cf-dash") : ""}
        opacity={visible ? 1 : 0}
        style={{ transition: "opacity 0.45s" }}
      />
    </svg>
  );
}

/** Traveling packet dot (repeats while visible). */
export function Packet({
  from,
  to,
  tone = "accent",
  visible = true,
  duration = 1.6,
}: {
  from: [number, number];
  to: [number, number];
  tone?: Tone;
  visible?: boolean;
  duration?: number;
}) {
  const bg = { neutral: "#94a3b8", good: "#10b981", bad: "#ef4444", accent: "#0ea5e9", warn: "#f59e0b" }[tone];
  if (!visible) return null;
  return (
    <motion.div
      className="absolute h-3 w-3 rounded-full"
      style={{ background: bg, boxShadow: `0 0 10px ${bg}`, zIndex: 3, marginLeft: -6, marginTop: -6 }}
      initial={{ left: `${from[0]}%`, top: `${from[1]}%`, opacity: 0 }}
      animate={{
        left: [`${from[0]}%`, `${to[0]}%`],
        top: [`${from[1]}%`, `${to[1]}%`],
        opacity: [0, 1, 1, 0],
      }}
      transition={{ duration, repeat: Infinity, ease: "linear", repeatDelay: 0.3 }}
    />
  );
}

/** Small fact chip. */
export function Chip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border-2 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm ${TONE_BORDER[tone]} ${TONE_BG[tone]}`}
    >
      {children}
    </span>
  );
}
