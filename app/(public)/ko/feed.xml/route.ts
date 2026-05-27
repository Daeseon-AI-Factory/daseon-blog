import { buildFeed } from "@/lib/feed";

export const revalidate = 3600;

export async function GET() {
  const xml = await buildFeed("ko");
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
