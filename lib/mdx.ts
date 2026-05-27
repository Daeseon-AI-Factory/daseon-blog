import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { mdxComponents } from "@/components/mdx-components";
import { remarkMermaid } from "@/lib/remark-mermaid";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: {
    dark: "github-dark-dimmed",
    light: "github-light",
  },
  keepBackground: false,
  defaultLang: "plaintext",
};

export async function renderMdx(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkMermaid, remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypePrettyCode as never, prettyCodeOptions],
        ],
      },
    },
  });
  return content;
}
