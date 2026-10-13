import { NextRequest, NextResponse } from "next/server";
import { isDashboardAuthorized } from "@/lib/dashboard-auth";
import { getAllArticles, getArticleTopics, getArticleRuns } from "@/lib/articles-store";
import { getAllProjects } from "@/lib/projects-store";
const { readContactMessages } = require("@/lib/contact-storage");

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized access to dashboard data." }, { status: 401 });
  }

  try {
    const [articles, topics, runs, projects, contactMessages] = await Promise.all([
      getAllArticles(),
      getArticleTopics(),
      getArticleRuns(),
      getAllProjects(),
      readContactMessages().catch(() => []),
    ]);

    const stats = {
      totalArticles: articles.length,
      publishedArticles: articles.filter((a) => a.status === "published").length,
      draftArticles: articles.filter((a) => a.status === "draft").length,
      totalProjects: projects.length,
      unreadMessages: Array.isArray(contactMessages) ? contactMessages.length : 0,
      generationEnabled: process.env.ARTICLE_GENERATION_ENABLED !== "false",
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    };

    return NextResponse.json({
      stats,
      articles,
      topics,
      runs,
      projects,
      contactMessages,
    });
  } catch (error) {
    console.error("[DashboardData] Error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data." }, { status: 500 });
  }
}
