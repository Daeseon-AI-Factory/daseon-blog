"use client";

/** CaseFilmPlayer — scene-stepped diagram player.
 *  A case = ordered scenes; the stage renders as a function of the
 *  current scene index so actors animate BETWEEN states (BBG-style
 *  continuity) instead of cutting. Auto-plays once, then hands over
 *  to manual stepping. */

import { useEffect, useState } from "react";

export interface Scene {
  id: string;
  tag: string; // SETUP / BEFORE / FAILURE / DECISION / AFTER / PEOPLE / IMPACT
  en: string;
  ko: string;
}

const TAG_STYLE: Record<string, string> = {
  BEFORE: "bg-amber-100 text-amber-800 border-amber-300",
  FAILURE: "bg-red-100 text-red-700 border-red-300",
  DECISION: "bg-slate-800 text-white border-slate-800",
  AFTER: "bg-emerald-100 text-emerald-800 border-emerald-300",
  IMPACT: "bg-sky-100 text-sky-800 border-sky-300",
};

export function CaseFilmPlayer({
  title,
  subtitle,
  scenes,
  autoMs = 5200,
  children,
}: {
  title: string;
  subtitle: string;
  scenes: Scene[];
  autoMs?: number;
  children: (scene: number) => React.ReactNode;
}) {
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      setScene((s) => {
        if (s >= scenes.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, autoMs);
    return () => clearTimeout(t);
  }, [playing, scene, scenes.length, autoMs]);

  const cur = scenes[scene];
  const go = (i: number) => {
    setPlaying(false);
    setScene(Math.max(0, Math.min(scenes.length - 1, i)));
  };

  return (
    <figure className="not-prose my-8">
      <style>{`
        @keyframes cf-dash-kf { to { stroke-dashoffset: -22; } }
        .cf-dash { animation: cf-dash-kf 0.7s linear infinite; }
        .cf-dash-rev { animation: cf-dash-kf 0.7s linear infinite reverse; }
      `}</style>

      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${TAG_STYLE[cur.tag] ?? "bg-slate-100 text-slate-600 border-slate-300"}`}
        >
          {cur.tag}
        </span>
      </div>

      {/* Stage — fixed paper canvas, independent of blog theme */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 bg-[#fbfaf7] shadow-sm sm:aspect-[16/8]">
        {children(scene)}
      </div>

      {/* Caption */}
      <figcaption className="mt-3 min-h-[3.2rem] text-center">
        <p className="text-[15px] font-semibold leading-snug">{cur.en}</p>
        <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{cur.ko}</p>
      </figcaption>

      {/* Controls */}
      <div className="mt-2 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => go(scene - 1)}
          disabled={scene === 0}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-sm disabled:opacity-30 dark:border-slate-600"
          aria-label="Previous scene"
        >
          ◀
        </button>
        <div className="flex items-center gap-1.5">
          {scenes.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Scene ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === scene ? "w-6 bg-sky-500" : "w-2.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(scene + 1)}
          disabled={scene === scenes.length - 1}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-sm disabled:opacity-30 dark:border-slate-600"
          aria-label="Next scene"
        >
          ▶
        </button>
        <button
          type="button"
          onClick={() => {
            if (scene >= scenes.length - 1) setScene(0);
            setPlaying((p) => !p);
          }}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-sm dark:border-slate-600"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "⏸" : "▶︎ replay"}
        </button>
      </div>
    </figure>
  );
}
