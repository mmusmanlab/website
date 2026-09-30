import type { MetadataRoute } from "next";
import { projects } from "@/app/lib/data";
import { articles } from "@/app/lib/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mmusmanlab.vercel.app";

  const staticRoutes = [
    { route: "", lastModified: "2026-09-30", priority: 1 },
    { route: "/about", lastModified: "2026-09-30", priority: 0.8 },
    { route: "/contact", lastModified: "2026-09-30", priority: 0.6 },
    { route: "/projects", lastModified: "2026-09-30", priority: 0.8 },
    { route: "/articles", lastModified: "2026-09-30", priority: 0.8 },
  ];

  const staticUrls = staticRoutes.map(({ route, lastModified, priority }) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    priority,
  }));

  const projectUrls = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: project.lastModified ?? "2026-09-30",
    priority: 0.7,
  }));

  const articleUrls: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: article.updatedAt,
    priority: 0.7,
  }));

  return [...staticUrls, ...projectUrls, ...articleUrls];
}
