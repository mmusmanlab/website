import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "mmusman_dash_auth";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

// In-memory revocation set for invalidated sessions
const revokedSessionIds = new Set<string>();

// Login rate limiting: IP / identifier -> { attempts: number, firstAttemptAt: number, blockedUntil?: number }
const loginAttempts = new Map<string, { attempts: number; firstAttemptAt: number; blockedUntil?: number }>();
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

export interface SessionPayload {
  sessionId: string;
  role: "admin";
  issuedAt: number;
  expiresAt: number;
}

/**
 * Retrieve the configured dashboard passkey.
 * Returns null if no passkey is configured (fails closed).
 */
export function getConfiguredPasskey(): string | null {
  const passkey = process.env.DASHBOARD_PASSKEY || process.env.CONTACT_DASHBOARD_PASSKEY;
  if (!passkey || typeof passkey !== "string" || passkey.trim().length === 0) {
    return null;
  }
  return passkey.trim();
}

/**
 * Retrieve the secret key for signing session tokens.
 * Uses SESSION_SECRET if provided, otherwise derives from configured passkey.
 */
function getSigningSecret(): string | null {
  const sessionSecret = process.env.SESSION_SECRET;
  if (sessionSecret && sessionSecret.trim().length >= 16) {
    return sessionSecret.trim();
  }
  const passkey = getConfiguredPasskey();
  if (passkey) {
    return crypto.createHash("sha256").update(`session-salt:${passkey}`).digest("hex");
  }
  return null;
}

/**
 * Timing-safe passkey verification.
 * Fails closed if passkey is not configured in environment.
 */
export function isValidDashboardPasskey(input: unknown): boolean {
  if (typeof input !== "string" || !input.trim()) {
    return false;
  }
  const expected = getConfiguredPasskey();
  if (!expected) {
    console.error("[DashboardAuth] Security alert: DASHBOARD_PASSKEY is not configured. Access denied.");
    return false;
  }

  // Use SHA-256 digests with constant-time equality check to prevent timing attacks
  const inputHash = crypto.createHash("sha256").update(input.trim()).digest();
  const expectedHash = crypto.createHash("sha256").update(expected).digest();

  return crypto.timingSafeEqual(inputHash, expectedHash);
}

/**
 * Rate-limiting helper for login attempts
 */
export function checkLoginRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record) {
    return { allowed: true };
  }

  if (record.blockedUntil && record.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  if (now - record.firstAttemptAt > ATTEMPT_WINDOW_MS) {
    loginAttempts.delete(identifier);
    return { allowed: true };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
    return { allowed: false, retryAfterSeconds: Math.ceil(BLOCK_DURATION_MS / 1000) };
  }

  return { allowed: true };
}

export function recordFailedLoginAttempt(identifier: string): void {
  const now = Date.now();
  const record = loginAttempts.get(identifier);
  if (!record || now - record.firstAttemptAt > ATTEMPT_WINDOW_MS) {
    loginAttempts.set(identifier, { attempts: 1, firstAttemptAt: now });
  } else {
    record.attempts += 1;
    if (record.attempts >= MAX_ATTEMPTS) {
      record.blockedUntil = now + BLOCK_DURATION_MS;
    }
  }
}

export function resetLoginAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

/**
 * Sign a session payload using HMAC-SHA256
 */
export function createSessionToken(): string | null {
  const secret = getSigningSecret();
  if (!secret) return null;

  const sessionId = crypto.randomUUID();
  const now = Date.now();
  const payload: SessionPayload = {
    sessionId,
    role: "admin",
    issuedAt: now,
    expiresAt: now + SESSION_MAX_AGE_SECONDS * 1000,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verify session token integrity, expiry, and non-revocation
 */
export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  // Explicitly reject legacy unsafe plain strings like "true"
  if (token === "true" || token === "false") {
    return null;
  }

  const secret = getSigningSecret();
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  // Constant-time signature comparison
  if (
    signature.length !== expectedSig.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
  ) {
    return null;
  }

  try {
    const raw = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload: SessionPayload = JSON.parse(raw);

    if (payload.role !== "admin" || !payload.expiresAt || !payload.sessionId) {
      return null;
    }

    if (Date.now() > payload.expiresAt) {
      return null;
    }

    if (revokedSessionIds.has(payload.sessionId)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Invalidate a session token on logout
 */
export function revokeSessionToken(token: string | undefined | null): void {
  if (!token) return;
  const session = verifySessionToken(token);
  if (session?.sessionId) {
    revokedSessionIds.add(session.sessionId);
    // Prune revocation set if it grows large
    if (revokedSessionIds.size > 1000) {
      revokedSessionIds.clear();
    }
  }
}

/**
 * CSRF / Same-Origin validation for state-changing requests
 */
export function validateSameOrigin(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return true;
  }

  // Check Sec-Fetch-Site if provided by modern browsers
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "same-site" && secFetchSite !== "none") {
    return false;
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    // If no origin header (e.g. non-browser API client), check referer
    const referer = request.headers.get("referer");
    if (!referer) return true; // Standard Bearer token or non-browser script
    try {
      const refererUrl = new URL(referer);
      return refererUrl.host === host;
    } catch {
      return false;
    }
  }

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

/**
 * Server-side authorization check for all dashboard endpoints
 * Validates cryptographic session cookie OR verified Bearer passkey token.
 * Never accepts unverified cookies or missing passkeys.
 */
export function isDashboardAuthorized(request: NextRequest): boolean {
  // 1. Check cryptographically signed session cookie
  const cookie = request.cookies.get(COOKIE_NAME);
  if (cookie?.value) {
    const session = verifySessionToken(cookie.value);
    if (session) {
      return true;
    }
  }

  // 2. Check Bearer Authorization header for direct API access
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (isValidDashboardPasskey(token)) {
      return true;
    }
  }

  // 3. Check custom header x-dashboard-passkey
  const passkeyHeader = request.headers.get("x-dashboard-passkey");
  if (passkeyHeader && isValidDashboardPasskey(passkeyHeader)) {
    return true;
  }

  return false;
}

/**
 * Cookie configuration helper
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
}
