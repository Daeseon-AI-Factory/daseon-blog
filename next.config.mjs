import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx"],
  outputFileTracingRoot: __dirname,
  async redirects() {
    // Product renamed DalkkakAI -> Talkak; slug dalkkak-ai -> talkak (2026-06-19).
    // Keep old inbound links (incl. /architecture, /readme, /log/* sub-pages) alive.
    return [
      { source: "/projects/dalkkak-ai", destination: "/projects/talkak", permanent: true },
      { source: "/projects/dalkkak-ai/:path*", destination: "/projects/talkak/:path*", permanent: true },
      { source: "/ko/projects/dalkkak-ai", destination: "/ko/projects/talkak", permanent: true },
      { source: "/ko/projects/dalkkak-ai/:path*", destination: "/ko/projects/talkak/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
