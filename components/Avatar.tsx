import { SITE } from "@/lib/site";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { px: number; cls: string }> = {
  sm: { px: 40, cls: "h-10 w-10" },
  md: { px: 64, cls: "h-16 w-16" },
  lg: { px: 96, cls: "h-24 w-24" },
};

export function Avatar({ size = "md", className = "" }: { size?: Size; className?: string }) {
  const s = SIZES[size];
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={SITE.author.avatar}
      width={s.px}
      height={s.px}
      alt={`${SITE.author.name} avatar`}
      className={`${s.cls} rounded-full border border-paper-line bg-ink object-cover ${className}`}
    />
  );
}
