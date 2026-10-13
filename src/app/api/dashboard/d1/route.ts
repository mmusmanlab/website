import { NextRequest, NextResponse } from "next/server";
import { isDashboardAuthorized } from "@/lib/dashboard-auth";
import { getD1Status, runD1Migration, queryD1 } from "@/lib/cloudflare-d1";
import { transformAllDataToD1 } from "@/lib/d1-transformer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const status = await getD1Status();

    // Query live table row counts
    const [articlesCountRes, projectsCountRes, inquiriesCountRes, topicsCountRes, runsCountRes] = await Promise.all([
      queryD1("SELECT COUNT(*) as count FROM articles"),
      queryD1("SELECT COUNT(*) as count FROM projects"),
      queryD1("SELECT COUNT(*) as count FROM contact_inquiries"),
      queryD1("SELECT COUNT(*) as count FROM article_topics"),
      queryD1("SELECT COUNT(*) as count FROM article_runs"),
    ]);

    const stats = {
      articles: Number(articlesCountRes.results?.[0]?.count ?? 0),
      projects: Number(projectsCountRes.results?.[0]?.count ?? 0),
      inquiries: Number(inquiriesCountRes.results?.[0]?.count ?? 0),
      topics: Number(topicsCountRes.results?.[0]?.count ?? 0),
      runs: Number(runsCountRes.results?.[0]?.count ?? 0),
    };

    // Auto-transform if tables are currently at zero rows
    if (stats.projects === 0 && stats.articles === 0) {
      try {
        await transformAllDataToD1();
        // Refresh counts
        const [aRes, pRes, iRes] = await Promise.all([
          queryD1("SELECT COUNT(*) as count FROM articles"),
          queryD1("SELECT COUNT(*) as count FROM projects"),
          queryD1("SELECT COUNT(*) as count FROM contact_inquiries"),
        ]);
        stats.articles = Number(aRes.results?.[0]?.count ?? stats.articles);
        stats.projects = Number(pRes.results?.[0]?.count ?? stats.projects);
        stats.inquiries = Number(iRes.results?.[0]?.count ?? stats.inquiries);
      } catch (err) {
        console.warn("[D1 Auto-Transform] Notice:", err);
      }
    }

    return NextResponse.json({
      success: true,
      status,
      stats,
      databaseName: "mmusmanlab-db",
      timestamp: new Date().toISOString(),
      storageDriver: process.env.IMAGE_STORAGE_DRIVER || "local",
      r2Status: "future_pending_billing",
    });
  } catch (error: any) {
    console.error("[D1 Status API Error]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to query Cloudflare D1 status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body.action;

    if (action === "migrate") {
      const result = await runD1Migration();
      return NextResponse.json(result);
    }

    if (action === "transform_all" || action === "seed") {
      const result = await transformAllDataToD1();
      return NextResponse.json(result);
    }

    if (action === "test_query") {
      const sql = typeof body.sql === "string" ? body.sql : "SELECT * FROM articles LIMIT 3";
      const start = Date.now();
      const res = await queryD1(sql, body.params || []);
      const latency = Date.now() - start;

      return NextResponse.json({
        success: res.success,
        results: res.results,
        meta: {
          ...res.meta,
          latencyMs: latency,
        },
        error: res.error,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error("[D1 Action Error]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to execute D1 action" },
      { status: 500 }
    );
  }
}
