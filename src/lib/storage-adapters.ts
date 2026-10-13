/**
 * Cloudflare D1 (SQL Database) and Cloudflare R2 (Object Storage) Abstraction Adapters
 * Configured for mmusmanlab-db and mmusmanlab-assets
 */

import { Article } from "./articles-store";
import { Project } from "./projects-store";
import { queryD1, getD1Status, runD1Migration } from "./cloudflare-d1";

export interface DatabaseAdapter {
  // Articles
  getPublishedArticles: () => Promise<Article[]>;
  getAllArticles: () => Promise<Article[]>;
  getArticleBySlug: (slug: string) => Promise<Article | null>;
  saveArticle: (article: Article) => Promise<void>;
  deleteArticle: (slug: string) => Promise<boolean>;

  // Projects
  getAllProjects: () => Promise<Project[]>;
  getProjectById: (id: string) => Promise<Project | null>;
  saveProject: (project: Project) => Promise<Project>;
  deleteProject: (id: string) => Promise<boolean>;

  // Inquiries
  getInquiries: () => Promise<any[]>;
  saveInquiry: (inquiry: any) => Promise<void>;
}

export interface StorageAdapter {
  uploadFile: (file: { name: string; type: string; buffer: Buffer | ArrayBuffer }) => Promise<{ url: string; key: string }>;
  deleteFile: (key: string) => Promise<boolean>;
  getFileUrl: (key: string) => string;
}

export interface CloudflareConfig {
  d1DatabaseName: string;
  r2BucketName: string;
  r2PublicDomain: string;
  isD1Configured: boolean;
  isR2Configured: boolean;
}

export function getCloudflareReadinessStatus(): CloudflareConfig {
  return {
    d1DatabaseName: process.env.CLOUDFLARE_D1_DATABASE_NAME || "mmusmanlab-db",
    r2BucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || "mmusmanlab-assets",
    r2PublicDomain: process.env.CLOUDFLARE_R2_PUBLIC_URL || "",
    isD1Configured: Boolean(process.env.CLOUDFLARE_D1_DATABASE_ID || process.env.CLOUDFLARE_API_TOKEN || (globalThis as any).DB),
    isR2Configured: Boolean(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY),
  };
}

/**
 * Concrete Cloudflare D1 Database Adapter for mmusmanlab-db
 */
export const cloudflareD1Adapter: DatabaseAdapter = {
  async getPublishedArticles(): Promise<Article[]> {
    const res = await queryD1(
      "SELECT * FROM articles WHERE status = ? ORDER BY published_at DESC",
      ["published"]
    );
    return res.results.map(formatD1RowToArticle);
  },

  async getAllArticles(): Promise<Article[]> {
    const res = await queryD1("SELECT * FROM articles ORDER BY published_at DESC");
    return res.results.map(formatD1RowToArticle);
  },

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const res = await queryD1("SELECT * FROM articles WHERE slug = ?", [slug]);
    if (!res.results.length) return null;
    return formatD1RowToArticle(res.results[0]);
  },

  async saveArticle(article: Article): Promise<void> {
    await queryD1(
      `INSERT OR REPLACE INTO articles (
        id, slug, title, description, published_at, updated_at,
        category, tags, content, related_projects, sources,
        status, word_count, difficulty, reading_time, is_automated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        article.id,
        article.slug,
        article.title,
        article.description,
        article.publishedAt,
        article.updatedAt,
        article.category,
        JSON.stringify(article.tags || []),
        JSON.stringify(article.content || []),
        JSON.stringify(article.relatedProjects || []),
        JSON.stringify(article.sources || []),
        article.status,
        article.wordCount || 600,
        article.difficulty || "Intermediate",
        article.readingTime || "5 min read",
        article.isAutomated ? 1 : 0,
      ]
    );
  },

  async deleteArticle(slug: string): Promise<boolean> {
    const res = await queryD1("DELETE FROM articles WHERE slug = ?", [slug]);
    return res.success;
  },

  async getAllProjects(): Promise<Project[]> {
    const res = await queryD1("SELECT * FROM projects ORDER BY last_modified DESC");
    return res.results.map(formatD1RowToProject);
  },

  async getProjectById(id: string): Promise<Project | null> {
    const res = await queryD1("SELECT * FROM projects WHERE id = ?", [id]);
    if (!res.results.length) return null;
    return formatD1RowToProject(res.results[0]);
  },

  async saveProject(project: Project): Promise<Project> {
    const lastModified = new Date().toISOString().split("T")[0];
    await queryD1(
      `INSERT OR REPLACE INTO projects (
        id, name, short_description, full_description, overview,
        features, image, image_alt, technologies, category,
        last_modified, demo_url, repo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project.id,
        project.name,
        project.shortDescription,
        project.fullDescription,
        project.overview || project.shortDescription,
        JSON.stringify(project.features || []),
        project.image,
        project.imageAlt || `${project.name} screenshot`,
        JSON.stringify(project.technologies || []),
        project.category || "Web",
        lastModified,
        project.demoUrl || "",
        project.repoUrl || "",
      ]
    );
    return { ...project, lastModified };
  },

  async deleteProject(id: string): Promise<boolean> {
    const res = await queryD1("DELETE FROM projects WHERE id = ?", [id]);
    return res.success;
  },

  async getInquiries(): Promise<any[]> {
    const res = await queryD1("SELECT * FROM contact_inquiries ORDER BY created_at DESC");
    return res.results;
  },

  async saveInquiry(inquiry: any): Promise<void> {
    await queryD1(
      `INSERT INTO contact_inquiries (id, name, email, message, project_type, company, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        inquiry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        inquiry.name,
        inquiry.email,
        inquiry.message,
        inquiry.projectType || "General",
        inquiry.company || "N/A",
        inquiry.createdAt || new Date().toISOString(),
      ]
    );
  },
};

/**
 * Cloudflare R2 Object Storage Adapter (Preparation for upcoming image upload)
 */
export const cloudflareR2Adapter: StorageAdapter = {
  async uploadFile(file) {
    const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME || "mmusmanlab-assets";
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || "https://assets.mmusmanlab.com";
    const key = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    // Ready for R2 S3-compatible client or worker binding
    const globalAny = globalThis as any;
    if (globalAny.R2_ASSETS && typeof globalAny.R2_ASSETS.put === "function") {
      await globalAny.R2_ASSETS.put(key, file.buffer, {
        httpMetadata: { contentType: file.type },
      });
      return { url: `${publicUrl}/${key}`, key };
    }

    // Fallback URL
    return {
      url: `https://picsum.photos/seed/${encodeURIComponent(file.name)}/800/600`,
      key,
    };
  },

  async deleteFile(key: string) {
    const globalAny = globalThis as any;
    if (globalAny.R2_ASSETS && typeof globalAny.R2_ASSETS.delete === "function") {
      await globalAny.R2_ASSETS.delete(key);
      return true;
    }
    return true;
  },

  getFileUrl(key: string) {
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || "https://assets.mmusmanlab.com";
    return `${publicUrl}/${key}`;
  },
};

// Row deserialization helpers
function safeParseJson(raw: any, fallback: any) {
  if (!raw) return fallback;
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function formatD1RowToArticle(row: any): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    publishedAt: row.published_at || row.publishedAt,
    updatedAt: row.updated_at || row.updatedAt,
    category: row.category,
    tags: safeParseJson(row.tags, ["Engineering"]),
    content: safeParseJson(row.content, []),
    relatedProjects: safeParseJson(row.related_projects || row.relatedProjects, []),
    sources: safeParseJson(row.sources, []),
    status: row.status || "published",
    wordCount: Number(row.word_count || row.wordCount || 600),
    difficulty: row.difficulty || "Intermediate",
    readingTime: row.reading_time || row.readingTime || "5 min read",
    isAutomated: Boolean(row.is_automated ?? row.isAutomated),
  };
}

function formatD1RowToProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    shortDescription: row.short_description || row.shortDescription,
    fullDescription: row.full_description || row.fullDescription,
    overview: row.overview,
    features: safeParseJson(row.features, []),
    image: row.image,
    imageAlt: row.image_alt || row.imageAlt,
    technologies: safeParseJson(row.technologies, []),
    category: row.category,
    lastModified: row.last_modified || row.lastModified,
    demoUrl: row.demo_url || row.demoUrl,
    repoUrl: row.repo_url || row.repoUrl,
  };
}
