import { NextRequest, NextResponse } from "next/server";
import { isDashboardAuthorized, validateSameOrigin } from "@/lib/dashboard-auth";
import {
  saveArticle,
  deleteArticle,
  getDashboardArticleBySlug,
  getAllArticles,
  Article,
} from "@/lib/articles-store";
import { validateArticleQuality } from "@/lib/article-quality-gate";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized access to article management." }, { status: 401 });
  }

  if (!validateSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin (CSRF protection)." }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.title || !body.slug || !body.description || !body.content) {
      return NextResponse.json(
        { error: "Title, slug, description, and content sections are required." },
        { status: 400 }
      );
    }

    const isPublishing = body.status === "published";
    const existing = await getAllArticles();

    const article: Article = {
      id: body.id || `art-${Date.now()}`,
      slug: body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      title: body.title.trim(),
      description: body.description.trim(),
      publishedAt: body.publishedAt || new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      category: body.category || "Software Engineering",
      tags: Array.isArray(body.tags) ? body.tags.map((t: string) => t.trim()).filter(Boolean) : ["Engineering"],
      content: Array.isArray(body.content) ? body.content : [],
      relatedProjects: Array.isArray(body.relatedProjects) ? body.relatedProjects : [],
      sources: Array.isArray(body.sources) ? body.sources : [],
      status: isPublishing ? "published" : "draft",
      wordCount: typeof body.wordCount === "number" ? body.wordCount : 500,
      difficulty: body.difficulty || "Intermediate",
      readingTime: body.readingTime || "5 min read",
      isAutomated: Boolean(body.isAutomated),
    };

    // Run quality gate validation
    const quality = validateArticleQuality(article, existing, isPublishing);
    if (!quality.valid) {
      return NextResponse.json(
        {
          error: `Quality gate validation failed: ${quality.errors.join("; ")}`,
          warnings: quality.warnings,
        },
        { status: 422 }
      );
    }

    await saveArticle(article);
    return NextResponse.json({
      success: true,
      article,
      warnings: quality.warnings,
    });
  } catch (error: any) {
    console.error("[DashboardArticles POST Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save article." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized access to article deletion." }, { status: 401 });
  }

  if (!validateSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin (CSRF protection)." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "Article slug is required for deletion." }, { status: 400 });
    }

    const success = await deleteArticle(slug);
    if (!success) {
      return NextResponse.json({ error: "Article not found or could not be deleted." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Article "${slug}" deleted successfully.` });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete article." },
      { status: 500 }
    );
  }
}
