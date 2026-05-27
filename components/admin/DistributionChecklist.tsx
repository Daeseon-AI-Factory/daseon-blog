"use client";

import { useEffect, useState } from "react";

type PostRef = { key: string; title: string; locale: string; date: string };
type State = Record<string, Record<string, boolean>>;

const STORAGE_KEY = "daseon_distribution_v1";

function loadState(): State {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as State;
  } catch {
    return {};
  }
}

export function DistributionChecklist({
  posts,
  channels,
}: {
  posts: PostRef[];
  channels: string[];
}) {
  const [state, setState] = useState<State>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  function toggle(postKey: string, channel: string) {
    setState((prev) => {
      const next: State = { ...prev, [postKey]: { ...(prev[postKey] ?? {}) } };
      next[postKey][channel] = !next[postKey][channel];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota errors */
      }
      return next;
    });
  }

  if (!ready) {
    return <p className="text-sm text-ink-muted">Loading…</p>;
  }

  if (posts.length === 0) {
    return <p className="text-sm text-ink-muted">No published posts yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-paper-line bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-paper-line text-left font-mono text-[0.7rem] uppercase tracking-widest text-ink-subtle">
          <tr>
            <th className="px-4 py-3">Post</th>
            {channels.map((c) => (
              <th key={c} className="px-3 py-3">
                {c}
              </th>
            ))}
            <th className="px-3 py-3">Done</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => {
            const checked = state[p.key] ?? {};
            const doneCount = channels.filter((c) => checked[c]).length;
            return (
              <tr key={p.key} className="border-b border-paper-line last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{p.title}</p>
                  <p className="mt-0.5 font-mono text-[0.7rem] uppercase tracking-widest text-ink-subtle">
                    {p.locale} · {p.date}
                  </p>
                </td>
                {channels.map((c) => (
                  <td key={c} className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={Boolean(checked[c])}
                      onChange={() => toggle(p.key, c)}
                      className="h-4 w-4 cursor-pointer accent-ink"
                      aria-label={`${p.title} → ${c}`}
                    />
                  </td>
                ))}
                <td className="px-3 py-3 font-mono text-xs tabular-nums text-ink-muted">
                  {doneCount}/{channels.length}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
