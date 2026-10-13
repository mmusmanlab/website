import { NextRequest, NextResponse } from "next/server";
import {
  isValidDashboardPasskey,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  revokeSessionToken,
  isDashboardAuthorized,
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginAttempts,
  validateSameOrigin,
} from "@/lib/dashboard-auth";

export const dynamic = "force-dynamic";

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown-client";
}

export async function POST(request: NextRequest) {
  // CSRF validation for browser requests
  if (!validateSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin (CSRF protection)." }, { status: 403 });
  }

  const clientId = getClientIdentifier(request);
  const rateLimit = checkLoginRateLimit(clientId);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Too many failed login attempts. Please wait ${rateLimit.retryAfterSeconds || 900} seconds before retrying.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds || 900),
        },
      }
    );
  }

  try {
    const { passkey } = await request.json();
    if (!passkey || typeof passkey !== "string") {
      return NextResponse.json({ error: "Please enter your dashboard passkey." }, { status: 400 });
    }

    if (!isValidDashboardPasskey(passkey)) {
      recordFailedLoginAttempt(clientId);
      return NextResponse.json({ error: "Invalid passkey. Access denied." }, { status: 401 });
    }

    // Success: Reset rate limiting for this client
    resetLoginAttempts(clientId);

    const sessionToken = createSessionToken();
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Server authentication misconfigured: Session could not be signed." },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Authenticated successfully with secure session.",
    });

    setSessionCookie(response, sessionToken);

    return response;
  } catch {
    return NextResponse.json({ error: "Authentication request could not be processed." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authenticated = isDashboardAuthorized(request);

  return NextResponse.json({
    authenticated,
  });
}

export async function DELETE(request: NextRequest) {
  const cookie = request.cookies.get("mmusman_dash_auth");
  if (cookie?.value) {
    revokeSessionToken(cookie.value);
  }

  const response = NextResponse.json({ success: true, message: "Logged out and session invalidated." });
  clearSessionCookie(response);
  return response;
}
