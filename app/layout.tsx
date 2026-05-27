import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.author.name} — AI engineer`,
    template: `%s · ${SITE.author.name}`,
  },
  description:
    "Notes from Daeseon Yoo, AI engineer in Toronto. Building, shipping, and learning in public.",
  authors: [{ name: SITE.author.name, url: SITE.url }],
  creator: SITE.author.name,
  openGraph: {
    type: "website",
    siteName: SITE.author.name,
    url: SITE.url,
    title: SITE.author.name,
    description:
      "Notes from Daeseon Yoo, AI engineer in Toronto.",
  },
  twitter: {
    card: "summary",
    creator: `@${SITE.author.handle}`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
