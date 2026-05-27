import { NextResponse } from "next/server";
import { adminCookieOptions, createSessionToken, passwordMatches } from "@/lib/auth";

export async function POST(req: Request) {
  let body: { password?: string; from?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }
  const password = body.password ?? "";
  if (!passwordMatches(password)) {
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }
  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true, redirect: body.from ?? "/admin" });
  const opts = adminCookieOptions();
  res.cookies.set({ ...opts, value: token });
  return res;
}
