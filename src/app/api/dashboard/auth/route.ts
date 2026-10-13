import { NextRequest, NextResponse } from "next/server";
const { isValidDashboardPasskey } = require("@/lib/contact-dashboard");

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { passkey } = await request.json();
    if (!passkey || typeof passkey !== "string") {
      return NextResponse.json({ error: "Please enter your dashboard passkey." }, { status: 400 });
    }

    if (!isValidDashboardPasskey(passkey)) {
      return NextResponse.json({ error: "Invalid passkey. Access denied." }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      message: "Authenticated successfully.",
    });

    response.cookies.set("mmusman_dash_auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Authentication failed." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("mmusman_dash_auth");
  const authHeader = request.headers.get("authorization");
  const expected = process.env.DASHBOARD_PASSKEY || process.env.CONTACT_DASHBOARD_PASSKEY || "Noor@4321";

  const isCookieAuth = cookie?.value === "true";
  const isHeaderAuth = authHeader === `Bearer ${expected}`;

  return NextResponse.json({
    authenticated: isCookieAuth || isHeaderAuth,
  });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out." });
  response.cookies.delete("mmusman_dash_auth");
  return response;
}
