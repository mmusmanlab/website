import { NextRequest, NextResponse } from "next/server";
import { isDashboardAuthorized } from "@/lib/dashboard-auth";
import { getD1Status, runD1Migration, queryD1 } from "@/lib/cloudflare-d1";
import { initialArticles, saveArticle } from "@/lib/articles-store";
import { initialProjects, saveProject } from "@/lib/projects-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const status = await getD1Status();

    // Query table counts
    const [articlesCountRes, projectsCountRes, inquiriesCountRes, runsCountRes] = await Promise.all([
      queryD1("SELECT COUNT(*) as count FROM articles"),
      queryD1("SELECT COUNT(*) as count FROM projects"),
      queryD1("SELECT COUNT(*) as count FROM contact_inquiries"),
      queryD1("SELECT COUNT(*) as count FROM article_runs"),
    ]);

    const stats = {
      articles: Number(articlesCountRes.results?.[0]?.count ?? 0),
      projects: Number(projectsCountRes.results?.[0]?.count ?? 0),
      inquiries: Number(inquiriesCountRes.results?.[0]?.count ?? 0),
      runs: Number(runsCountRes.results?.[0]?.count ?? 0),
    };

    return NextResponse.json({
      success: true,
      status,
      stats,
      databaseName: "mmusmanlab-db",
      timestamp: new Date().toISOString(),
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

    if (action === "seed") {
      let seededArticlesCount = 0;
      let seededProjectsCount = 0;

      for (const art of initialArticles) {
        await saveArticle(art);
        seededArticlesCount++;
      }

      for (const proj of initialProjects) {
        await saveProject(proj);
        seededProjectsCount++;
      }

      return NextResponse.json({
        success: true,
        message: `Successfully seeded ${seededArticlesCount} articles and ${seededProjectsCount} projects into mmusmanlab-db!`,
      });
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
    return NextResponse.json(
      { error: error?.message || "Failed executing D1 action" },
      { status: 500 }
    );
  }
}
