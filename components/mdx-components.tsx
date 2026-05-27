import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { Mermaid } from "@/components/Mermaid";

function CustomLink(props: ComponentPropsWithoutRef<"a">) {
  const href = props.href ?? "#";
  if (href.startsWith("/")) {
    return <Link href={href} {...props} />;
  }
  if (href.startsWith("#")) {
    return <a {...props} />;
  }
  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

function Callout({ children, kind = "note" }: { children: React.ReactNode; kind?: "note" | "warn" }) {
  const tone = kind === "warn" ? "border-accent/40 bg-accent/5" : "border-paper-line bg-paper-line/40";
  return (
    <aside className={`my-6 rounded-md border-l-2 p-4 text-[0.95em] text-ink-muted ${tone}`}>
      {children}
    </aside>
  );
}

function ToneLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-xs uppercase tracking-widest text-ink-subtle">
      {children}
    </span>
  );
}

export const mdxComponents: MDXComponents = {
  a: CustomLink,
  Callout,
  ToneLabel,
  Mermaid,
};
