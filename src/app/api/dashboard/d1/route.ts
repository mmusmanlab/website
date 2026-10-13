import { NextRequest, NextResponse } from "next/server";
import { isDashboardAuthorized, validateSameOrigin } from "@/lib/dashboard-auth";
import { getD1Status, runD1Migration, queryD1 } from "@/lib/cloudflare-d1";

export const dynamic = "force-dynamic";

// Disallow destructive statements from arbitrary query execution
const FORBIDDEN_SQL_PATTERNS = [
  /\bDROP\s+TABLE\b/i,
  /\bDROP\s+DATABASE\b/i,
  /\bDROP\s+INDEX\b/i,
  /\bTRUNCATE\b/i,
  /\bALTER\s+TABLE\b/i,
  /\bATTACH\s+DATABASE\b/i,
  /\bDETACH\s+DATABASE\b/i,
  /\bVACUUM\b/i,
];

export async function GET(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized access to database administration." }, { status: 401 });
  }

  try {
    const status = await getD1Status();

    // Query live table row counts safely
    const [articlesCountRes, projectsCountRes, inquiriesCountRes, topicsCountRes, runsCountRes] =
      await Promise.all([
        queryD1("SELECT COUNT(*) as count FROM articles").catch(() => ({ results: [{ count: 0 }] })),
        queryD1("SELECT COUNT(*) as count FROM projects").catch(() => ({ results: [{ count: 0 }] })),
        queryD1("SELECT COUNT(*) as count FROM contact_inquiries").catch(() => ({ results: [{ count: 0 }] })),
        queryD1("SELECT COUNT(*) as count FROM article_topics").catch(() => ({ results: [{ count: 0 }] })),
        queryD1("SELECT COUNT(*) as count FROM article_runs").catch(() => ({ results: [{ count: 0 }] })),
      ]);

    const stats = {
      articles: Number(articlesCountRes.results?.[0]?.count ?? 0),
      projects: Number(projectsCountRes.results?.[0]?.count ?? 0),
      inquiries: Number(inquiriesCountRes.results?.[0]?.count ?? 0),
      topics: Number(topicsCountRes.results?.[0]?.count ?? 0),
      runs: Number(runsCountRes.results?.[0]?.count ?? 0),
    };

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
    return NextResponse.json({ error: "Unauthorized access to database administration." }, { status: 401 });
  }

  if (!validateSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin (CSRF protection)." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const action = body.action;

    // 1. Run safe schema migration
    if (action === "migrate") {
      const result = await runD1Migration();
      return NextResponse.json(result);
    }

    // 2. Controlled diagnostic test query (strictly blocks destructive statements)
    if (action === "test_query") {
      const sql = typeof body.sql === "string" ? body.sql.trim() : "SELECT * FROM articles LIMIT 3";

      // Prevent multi-statement query chains
      if ((sql.match(/;/g) || []).length > 1) {
        return NextResponse.json(
          { error: "Multi-statement SQL chains are forbidden for security." },
          { status: 400 }
        );
      }

      // Safeguard against destructive SQL
      for (const pattern of FORBIDDEN_SQL_PATTERNS) {
        if (pattern.test(sql)) {
          return NextResponse.json(
            { error: "Destructive SQL statements (DROP, TRUNCATE, ALTER, VACUUM) are strictly forbidden." },
            { status: 403 }
          );
        }
      }

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

    return NextResponse.json({ error: `Unknown database action: "${action}"` }, { status: 400 });
  } catch (error: any) {
    console.error("[D1 Action Error]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to execute D1 action" },
      { status: 500 }
    );
  }
}
