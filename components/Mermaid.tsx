"use client";

import { useEffect, useId, useState } from "react";

export function Mermaid({ chart }: { chart: string }) {
  const rawId = useId();
  const id = `m${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setSvg(null);

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          themeVariables: {
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
            fontSize: "14px",
          },
          flowchart: { curve: "basis", padding: 12 },
          sequence: { mirrorActors: false, showSequenceNumbers: false },
        });
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled) setSvg(svg);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <pre className="my-6 overflow-auto rounded-md border border-accent/30 bg-accent/5 p-3 text-xs text-accent">
        Mermaid render error: {error}
        {"\n\n"}
        {chart}
      </pre>
    );
  }

  if (!svg) {
    return (
      <div className="my-6 rounded-md border border-paper-line bg-paper-line/20 p-6 text-center text-xs text-ink-subtle">
        Rendering diagram…
      </div>
    );
  }

  return (
    <figure
      className="my-6 flex justify-center overflow-x-auto rounded-md border border-paper-line bg-white p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
