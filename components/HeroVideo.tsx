"use client";

import { useEffect, useRef } from "react";

/**
 * Project hero video. React only sets `muted` as an attribute, not as the DOM
 * property the browser's autoplay policy checks — so `<video autoPlay muted>`
 * often won't start and the poster sticks. Setting `v.muted = true` on mount
 * (property) and calling play() makes muted autoplay actually fire; `controls`
 * + `poster` keep it usable if a browser still blocks autoplay.
 */
export function HeroVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      controls
      preload="metadata"
      className={className}
    />
  );
}
