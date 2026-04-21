import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correct = process.env.EDIT_PASSWORD || "VinfastMinhThanh2026";

  if (password === correct) {
    const res = NextResponse.json({ ok: true });
    // Set httpOnly cookie valid for 7 days
    res.cookies.set("org_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  }

  return NextResponse.json({ ok: false, error: "Sai mật khẩu" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("org_auth");
  return NextResponse.json({ authenticated: cookie?.value === "authenticated" });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("org_auth");
  return res;
}
