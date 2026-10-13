import { NextRequest, NextResponse } from "next/server";
import { getPublishedArticles, getArticleBySlug } from "@/lib/articles-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const category = searchParams.get("category");

  if (slug) {
    const article = await getArticleBySlug(slug);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json({ article });
  }

  let articles = await getPublishedArticles();
  if (category) {
    articles = articles.filter((a) => a.category.toLowerCase() === category.toLowerCase());
  }

  return NextResponse.json({
    articles: articles.map(({ id, slug, title, description, publishedAt, category, tags, difficulty, readingTime, wordCount }) => ({
      id,
      slug,
      title,
      description,
      publishedAt,
      category,
      tags,
      difficulty,
      readingTime,
      wordCount,
    })),
    total: articles.length,
  });
}
