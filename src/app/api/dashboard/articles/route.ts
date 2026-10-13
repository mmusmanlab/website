import { NextRequest, NextResponse } from "next/server";
import { isDashboardAuthorized } from "@/lib/dashboard-auth";
import { saveArticle, deleteArticle, getArticleBySlug, getAllArticles, Article } from "@/lib/articles-store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.title || !body.slug || !body.description || !body.content) {
      return NextResponse.json({ error: "Title, slug, description, and content are required." }, { status: 400 });
    }

    const article: Article = {
      id: body.id || `art-${Date.now()}`,
      slug: body.slug.trim(),
      title: body.title.trim(),
      description: body.description.trim(),
      publishedAt: body.publishedAt || new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      category: body.category || "Software Engineering",
      tags: Array.isArray(body.tags) ? body.tags : ["Engineering"],
      content: Array.isArray(body.content) ? body.content : [],
      relatedProjects: Array.isArray(body.relatedProjects) ? body.relatedProjects : [],
      sources: Array.isArray(body.sources) ? body.sources : [],
      status: body.status === "draft" ? "draft" : "published",
      wordCount: typeof body.wordCount === "number" ? body.wordCount : 600,
      difficulty: body.difficulty || "Intermediate",
      readingTime: body.readingTime || "5 min read",
      isAutomated: Boolean(body.isAutomated),
    };

    await saveArticle(article);
    return NextResponse.json({ success: true, article });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save article" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const success = await deleteArticle(slug);
    if (!success) {
      return NextResponse.json({ error: "Article not found or could not be deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Article deleted successfully." });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
