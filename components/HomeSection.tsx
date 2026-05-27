import Link from "next/link";

export function HomeSection({
  id,
  title,
  seeAll,
  seeAllHref,
  children,
}: {
  id: string;
  title: string;
  seeAll?: string;
  seeAllHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-10">
      <header className="mb-4 flex items-baseline justify-between">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-subtle">
          {title}
        </h2>
        {seeAll && seeAllHref ? (
          <Link href={seeAllHref} className="text-xs text-accent hover:underline">
            {seeAll} →
          </Link>
        ) : null}
      </header>
      {children}
    </section>
  );
}
