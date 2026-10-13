import type { MetadataRoute } from "next";
import { projects } from "@/app/lib/data";
import { getPublishedArticles } from "@/lib/articles-store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mmusmanlab.vercel.app";

  const staticRoutes = [
    { route: "", lastModified: new Date().toISOString().split("T")[0], priority: 1.0 },
    { route: "/about", lastModified: "2026-10-12", priority: 0.8 },
    { route: "/contact", lastModified: "2026-10-12", priority: 0.7 },
    { route: "/projects", lastModified: "2026-10-12", priority: 0.9 },
    { route: "/articles", lastModified: new Date().toISOString().split("T")[0], priority: 0.9 },
  ];

  const staticUrls: MetadataRoute.Sitemap = staticRoutes.map(({ route, lastModified, priority }) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    priority,
  }));

  const projectUrls: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: project.lastModified ?? "2026-09-30",
    priority: 0.8,
  }));

  const publishedArticles = await getPublishedArticles();
  const articleUrls: MetadataRoute.Sitemap = publishedArticles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: article.updatedAt || article.publishedAt,
    priority: 0.8,
  }));

  return [...staticUrls, ...projectUrls, ...articleUrls];
}
