import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root, Code, Parent } from "mdast";

export const remarkMermaid: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (node.lang !== "mermaid") return;
      if (!parent || typeof index !== "number") return;

      const jsxNode = {
        type: "mdxJsxFlowElement",
        name: "Mermaid",
        attributes: [
          {
            type: "mdxJsxAttribute",
            name: "chart",
            value: node.value,
          },
        ],
        children: [],
      } as unknown as Parent["children"][number];

      parent.children[index] = jsxNode;
    });
  };
};
