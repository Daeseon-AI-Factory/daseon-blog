import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.mdx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#111111",
          muted: "#5f5f5f",
          subtle: "#8a8a8a",
        },
        paper: {
          DEFAULT: "#fbfbfa",
          line: "#e8e6e1",
        },
        accent: "#b8531a",
      },
      typography: ({ theme }: { theme: (k: string) => string }) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": theme("colors.ink.DEFAULT"),
            "--tw-prose-headings": theme("colors.ink.DEFAULT"),
            "--tw-prose-links": theme("colors.accent"),
            "--tw-prose-bold": theme("colors.ink.DEFAULT"),
            "--tw-prose-counters": theme("colors.ink.muted"),
            "--tw-prose-bullets": theme("colors.ink.subtle"),
            "--tw-prose-hr": theme("colors.paper.line"),
            "--tw-prose-quotes": theme("colors.ink.muted"),
            "--tw-prose-quote-borders": theme("colors.paper.line"),
            "--tw-prose-code": theme("colors.ink.DEFAULT"),
            "--tw-prose-pre-bg": "#f4f2ee",
            "--tw-prose-pre-code": theme("colors.ink.DEFAULT"),
            maxWidth: "none",
            a: { textDecoration: "underline", textDecorationThickness: "1px", textUnderlineOffset: "3px" },
            "h2, h3, h4": { fontWeight: "600", letterSpacing: "-0.01em" },
            code: { fontWeight: "400", backgroundColor: "#f1efeb", padding: "0.1em 0.3em", borderRadius: "3px" },
            "code::before": { content: '""' },
            "code::after": { content: '""' },
            pre: { border: `1px solid ${theme("colors.paper.line")}` },
          },
        },
      }),
    },
  },
  plugins: [typography],
};

export default config;
