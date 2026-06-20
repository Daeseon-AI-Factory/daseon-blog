import { ImageResponse } from "next/og";
import { getAllProjects, getProject } from "@/lib/projects";

// Stable-URL branded card image (/projects/<slug>/card), used as the index card
// thumbnail for projects that don't ship a real product OG image. Prebuilt static.
export const dynamic = "force-static";

const size = { width: 1200, height: 630 };

const STATUS_LABEL: Record<string, string> = {
  active: "active",
  shipped: "shipped",
  archived: "archived",
};

function clamp(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
}

export async function generateStaticParams() {
  const all = await getAllProjects("en");
  return all.map((p) => ({ slug: p.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject("en", slug);
  const fm = project?.frontmatter;
  const title = fm?.title ?? "Project";
  const description = fm?.description ?? "";
  const stack = (fm?.stack ?? []).slice(0, 7).join("   ·   ");
  const status = STATUS_LABEL[fm?.status ?? "active"] ?? "active";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#fbfbfa",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "20px", height: "20px", backgroundColor: "#b8531a" }} />
            <div style={{ fontSize: "26px", color: "#5f5f5f", letterSpacing: "2px" }}>
              daeseon.ai / projects
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "22px",
              color: "#8a8a8a",
              textTransform: "uppercase",
              letterSpacing: "3px",
              border: "1px solid #e8e6e1",
              borderRadius: "999px",
              padding: "8px 22px",
            }}
          >
            {status}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div style={{ display: "flex", fontSize: "78px", fontWeight: 700, color: "#111111", lineHeight: 1.05 }}>
            {clamp(title, 42)}
          </div>
          <div style={{ display: "flex", fontSize: "31px", color: "#5f5f5f", lineHeight: 1.4, maxWidth: "1010px" }}>
            {clamp(description, 155)}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ height: "3px", width: "120px", backgroundColor: "#b8531a" }} />
          <div style={{ display: "flex", fontSize: "23px", color: "#8a8a8a", letterSpacing: "1px" }}>
            {clamp(stack, 92)}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
