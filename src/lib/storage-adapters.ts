/**
 * Cloudflare D1 (SQL Database) and Cloudflare R2 (Object Storage) Abstraction Adapters
 * Prepared for seamless migration to Cloudflare Workers / Pages with D1 and R2 bindings.
 */

import { Article } from "./articles-store";
import { Project } from "./projects-store";

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
  d1DatabaseName?: string;
  r2BucketName?: string;
  r2PublicDomain?: string;
  isD1Configured: boolean;
  isR2Configured: boolean;
}

export function getCloudflareReadinessStatus(): CloudflareConfig {
  return {
    d1DatabaseName: process.env.CLOUDFLARE_D1_DATABASE_NAME || "mmusmanlab-db",
    r2BucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || "mmusmanlab-assets",
    r2PublicDomain: process.env.CLOUDFLARE_R2_PUBLIC_URL || "",
    isD1Configured: Boolean(process.env.CLOUDFLARE_D1_DATABASE_ID || process.env.CLOUDFLARE_API_TOKEN),
    isR2Configured: Boolean(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY),
  };
}

/**
 * SQL Schema definition for Cloudflare D1 migration:
 *
 * CREATE TABLE IF NOT EXISTS articles (
 *   id TEXT PRIMARY KEY,
 *   slug TEXT UNIQUE NOT NULL,
 *   title TEXT NOT NULL,
 *   description TEXT NOT NULL,
 *   published_at TEXT NOT NULL,
 *   updated_at TEXT NOT NULL,
 *   category TEXT NOT NULL,
 *   tags TEXT NOT NULL, -- JSON array
 *   content TEXT NOT NULL, -- JSON sections
 *   related_projects TEXT NOT NULL, -- JSON array
 *   sources TEXT, -- JSON array
 *   status TEXT NOT NULL DEFAULT 'published',
 *   word_count INTEGER DEFAULT 0,
 *   difficulty TEXT DEFAULT 'Intermediate',
 *   reading_time TEXT DEFAULT '5 min read',
 *   is_automated INTEGER DEFAULT 0
 * );
 *
 * CREATE TABLE IF NOT EXISTS projects (
 *   id TEXT PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   short_description TEXT NOT NULL,
 *   full_description TEXT NOT NULL,
 *   overview TEXT,
 *   features TEXT, -- JSON array
 *   image TEXT NOT NULL,
 *   image_alt TEXT,
 *   technologies TEXT NOT NULL, -- JSON array
 *   category TEXT NOT NULL,
 *   last_modified TEXT,
 *   demo_url TEXT,
 *   repo_url TEXT
 * );
 *
 * CREATE TABLE IF NOT EXISTS contact_inquiries (
 *   id TEXT PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   email TEXT NOT NULL,
 *   message TEXT NOT NULL,
 *   project_type TEXT,
 *   company TEXT,
 *   created_at TEXT NOT NULL
 * );
 */
