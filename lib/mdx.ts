import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { mdxComponents } from "@/components/mdx-components";
import { remarkMermaid } from "@/lib/remark-mermaid";
import { remarkWikiLink } from "@/lib/remark-wiki-link";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: {
    dark: "github-dark-dimmed",
    light: "github-light",
  },
  keepBackground: false,
  defaultLang: "plaintext",
};

export async function renderMdx(source: string, opts: { wikiLinkBase?: string } = {}) {
  const remarkPlugins = opts.wikiLinkBase
    ? [remarkMermaid, remarkGfm, remarkWikiLink({ base: opts.wikiLinkBase })]
    : [remarkMermaid, remarkGfm];
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins,
        rehypePlugins: [
          rehypeSlug,
          [rehypePrettyCode as never, prettyCodeOptions],
        ],
      },
    },
  });
  return content;
}
