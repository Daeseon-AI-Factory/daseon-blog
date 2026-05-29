import { visit, SKIP } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root, Text, Parent, PhrasingContent } from "mdast";

const WIKI_LINK = /\[\[([^\]]+)\]\]/g;

/**
 * Slug from a wiki term. Keeps letters (incl. Korean via \p{L}) and numbers,
 * lowercases, spaces → hyphens. Must match how knowledge entry filenames are named.
 */
export function wikiSlug(term: string): string {
  return term
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
}

/**
 * Turns `[[term]]` and `[[display|target]]` into links to `<base>/<slug>`.
 * Only injected when a base is provided (so [[...]] stays literal elsewhere).
 */
export function remarkWikiLink({ base }: { base: string }): Plugin<[], Root> {
  return () => (tree) => {
    visit(tree, "text", (node: Text, index, parent: Parent | undefined) => {
      if (!parent || typeof index !== "number") return;
      const value = node.value;
      if (!value.includes("[[")) return;

      WIKI_LINK.lastIndex = 0;
      const out: PhrasingContent[] = [];
      let last = 0;
      let match: RegExpExecArray | null;
      while ((match = WIKI_LINK.exec(value)) !== null) {
        const [full, inner] = match;
        const start = match.index;
        if (start > last) out.push({ type: "text", value: value.slice(last, start) });
        const [displayRaw, targetRaw] = inner.includes("|")
          ? inner.split("|")
          : [inner, inner];
        out.push({
          type: "link",
          url: `${base}/${wikiSlug(targetRaw)}`,
          children: [{ type: "text", value: displayRaw.trim() }],
        });
        last = start + full.length;
      }
      if (out.length === 0) return;
      if (last < value.length) out.push({ type: "text", value: value.slice(last) });

      parent.children.splice(index, 1, ...out);
      return [SKIP, index + out.length];
    });
  };
}
