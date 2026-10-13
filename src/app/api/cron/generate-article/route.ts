import { NextRequest, NextResponse } from "next/server";
import { runAutomatedDiscoveryCycle } from "@/lib/ai/discovery-engine";
import { getArticleRuns } from "@/lib/articles-store";
import { isDashboardAuthorized } from "@/lib/dashboard-auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

let isCronRunning = false;
let lastRunTimestamp = 0;
const MIN_INTERVAL_BETWEEN_RUNS_MS = 60 * 1000; // 1 minute debouncing

function isCronAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || typeof cronSecret !== "string" || !cronSecret.trim()) {
    // Fail closed: Missing CRON_SECRET denies access
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice(7).trim();
  const tokenHash = crypto.createHash("sha256").update(token).digest();
  const secretHash = crypto.createHash("sha256").update(cronSecret.trim()).digest();

  return crypto.timingSafeEqual(tokenHash, secretHash);
}

/**
 * GET /api/cron/generate-article
 * Inspect automation status (Protected: requires CRON_SECRET or dashboard session)
 */
export async function GET(request: NextRequest) {
  const authorized = isCronAuthorized(request) || isDashboardAuthorized(request);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized access to automation status." }, { status: 401 });
  }

  const runs = await getArticleRuns();
  return NextResponse.json({
    status: "active",
    concurrencyLocked: isCronRunning,
    killSwitchEnabled: process.env.ARTICLE_GENERATION_ENABLED === "false",
    recentRuns: runs.slice(0, 10),
  });
}

/**
 * POST /api/cron/generate-article
 * Daily scheduled discovery cycle.
 * STRICT SAFEGUARD: Only discovers and queues topics for human review. NEVER publishes.
 */
export async function POST(request: NextRequest) {
  // Reject unauthenticated requests
  if (!isCronAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized: A valid CRON_SECRET Bearer token is required." },
      { status: 401 }
    );
  }

  // Concurrency & Debounce lock
  const now = Date.now();
  if (isCronRunning) {
    return NextResponse.json(
      { status: "skipped", message: "A discovery cycle is currently in progress." },
      { status: 429 }
    );
  }

  if (now - lastRunTimestamp < MIN_INTERVAL_BETWEEN_RUNS_MS) {
    return NextResponse.json(
      { status: "skipped", message: "Discovery cycle was executed recently. Rate limit applies." },
      { status: 200 }
    );
  }

  isCronRunning = true;
  lastRunTimestamp = now;

  try {
    const result = await runAutomatedDiscoveryCycle();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Cron Discovery Failure]:", error);
    return NextResponse.json(
      {
        status: "failed",
        error: error instanceof Error ? error.message : "Internal automation error",
      },
      { status: 500 }
    );
  } finally {
    isCronRunning = false;
  }
}
