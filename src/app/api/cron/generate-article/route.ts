import { NextRequest, NextResponse } from "next/server";
import { runAutomatedDiscoveryCycle } from "@/lib/ai/discovery-engine";
import { getArticleRuns } from "@/lib/articles-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Allow viewing recent run history with authorization check
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized access to automation endpoint." }, { status: 401 });
  }

  const runs = await getArticleRuns();
  return NextResponse.json({
    status: "active",
    killSwitchEnabled: process.env.ARTICLE_GENERATION_ENABLED === "false",
    recentRuns: runs.slice(0, 10),
  });
}

export async function POST(request: NextRequest) {
  // Verify CRON_SECRET if configured in production
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");

  if (cronSecret) {
    const isAuthorized = authHeader === `Bearer ${cronSecret}` || headerSecret === cronSecret;
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized: Invalid CRON_SECRET provided." }, { status: 401 });
    }
  }

  try {
    const result = await runAutomatedDiscoveryCycle();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[CronGenerateArticle] Execution failure:", error);
    return NextResponse.json(
      {
        status: "failed",
        error: error instanceof Error ? error.message : "Internal automation error",
      },
      { status: 500 }
    );
  }
}
