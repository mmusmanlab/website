import type { MetadataRoute } from "next";
import { projects } from "@/app/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mmusmanlab.vercel.app";

  // Static routes
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/projects",
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic projects
  const projectUrls = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  // FUTURE: blog support (ready now)
  const blogUrls: MetadataRoute.Sitemap = [];

  return [...staticUrls, ...projectUrls, ...blogUrls];
}
