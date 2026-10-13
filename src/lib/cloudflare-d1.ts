/**
 * Cloudflare D1 Database Client and Driver
 * Primary Production Store for MMUsmanLab
 * 
 * Supports:
 * 1. Cloudflare Native D1 Binding (when deployed on Cloudflare Workers / Pages via env.DB)
 * 2. Cloudflare D1 HTTP REST API (for Next.js on Vercel / serverless runtime via CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID & CLOUDFLARE_D1_DATABASE_ID)
 * 3. Local Development Mode (isolated to local dev environments when credentials are pending)
 */

import fs from "fs/promises";
import path from "path";

export interface D1QueryResult<T = any> {
  results: T[];
  success: boolean;
  meta?: {
    changed_db?: boolean;
    changes?: number;
    duration?: number;
    last_row_id?: number;
    rows_read?: number;
    rows_written?: number;
  };
  error?: string;
}

export interface D1Status {
  databaseName: string;
  databaseId: string;
  mode: "native" | "remote_api" | "local_dev" | "unconfigured";
  hasApiCredentials: boolean;
  connected: boolean;
  message: string;
  latencyMs?: number;
  details?: Record<string, any>;
}

const DATABASE_NAME = process.env.CLOUDFLARE_D1_DATABASE_NAME || "mmusmanlab-db";
const LOCAL_STORE_PATH = path.join(process.cwd(), "src/lib/data/d1-store.json");

interface LocalStore {
  articles: Record<string, any>;
  projects: Record<string, any>;
  contact_inquiries: Record<string, any>;
  article_topics: Record<string, any>;
  article_runs: Record<string, any>;
  approval_audit_logs: Record<string, any>;
}

let localStore: LocalStore | null = null;

async function getLocalStore(): Promise<LocalStore> {
  if (localStore) return localStore;
  try {
    const raw = await fs.readFile(LOCAL_STORE_PATH, "utf-8");
    localStore = JSON.parse(raw);
    if (!localStore!.approval_audit_logs) {
      localStore!.approval_audit_logs = {};
    }
    return localStore!;
  } catch {
    localStore = {
      articles: {},
      projects: {},
      contact_inquiries: {},
      article_topics: {},
      article_runs: {},
      approval_audit_logs: {},
    };
    try {
      await fs.mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
      await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(localStore, null, 2), "utf-8");
    } catch {
      // Memory fallback for read-only filesystem
    }
    return localStore!;
  }
}

async function persistLocalStore(): Promise<void> {
  if (!localStore) return;
  try {
    await fs.mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
    await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(localStore, null, 2), "utf-8");
  } catch (err) {
    console.warn("[CloudflareD1 Local] Notice persisting store:", err);
  }
}

/**
 * Get Cloudflare credentials, strictly ensuring database ID is present
 */
function getCloudflareCredentials(): {
  accountId: string | null;
  databaseId: string | null;
  apiToken: string | null;
  isConfigured: boolean;
} {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim() || null;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID?.trim() || null;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim() || null;

  // Database ID must be a UUID or identifier, never default to database name string
  const isConfigured = Boolean(accountId && databaseId && apiToken);
  return { accountId, databaseId, apiToken, isConfigured };
}

/**
 * Execute a query against Cloudflare D1
 */
export async function queryD1<T = any>(sql: string, params: any[] = []): Promise<D1QueryResult<T>> {
  const { accountId, databaseId, apiToken, isConfigured } = getCloudflareCredentials();
  const isProduction = process.env.NODE_ENV === "production";

  // 1. Cloudflare Native Binding (when available in Cloudflare Workers / Pages)
  const globalAny = globalThis as any;
  if (globalAny.DB && typeof globalAny.DB.prepare === "function") {
    try {
      let stmt = globalAny.DB.prepare(sql);
      if (params.length > 0) {
        stmt = stmt.bind(...params);
      }
      const res = await stmt.all();
      return {
        results: (res.results as T[]) || [],
        success: true,
        meta: res.meta,
      };
    } catch (err: any) {
      console.error("[CloudflareD1 Native] Query execution failed:", err);
      return {
        results: [],
        success: false,
        error: err?.message || String(err),
      };
    }
  }

  // 2. Cloudflare D1 HTTP REST API (Standard for Next.js on Vercel)
  if (isConfigured) {
    const start = Date.now();
    try {
      const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql,
          params,
        }),
      });

      const data = await response.json();
      const latency = Date.now() - start;

      if (!response.ok || !data.success) {
        const errorMsg = data.errors?.[0]?.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error(`[CloudflareD1 REST API Error] ${errorMsg}`);

        // In production, NEVER silently pretend persistence succeeded
        if (isProduction) {
          return {
            results: [],
            success: false,
            error: `Cloudflare D1 Query Failed: ${errorMsg}`,
          };
        }

        // In development only, fall back with warning
        console.warn("[CloudflareD1] Dev fallback to local store due to REST API error.");
        return await executeOnLocalStore<T>(sql, params);
      }

      const queryResult = data.result?.[0] || {};
      return {
        results: (queryResult.results as T[]) || [],
        success: true,
        meta: {
          ...queryResult.meta,
          duration: latency,
        },
      };
    } catch (err: any) {
      console.error("[CloudflareD1 REST API Network Error]:", err.message);
      if (isProduction) {
        return {
          results: [],
          success: false,
          error: `Network error connecting to Cloudflare D1: ${err.message}`,
        };
      }
      return await executeOnLocalStore<T>(sql, params);
    }
  }

  // 3. Fallback Handling
  if (isProduction) {
    // In production on Vercel, inform that Cloudflare D1 environment variables are missing
    return {
      results: [],
      success: false,
      error: "Cloudflare D1 credentials missing in production. Configure CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, and CLOUDFLARE_API_TOKEN.",
    };
  }

  // In local development, use local dev store
  return await executeOnLocalStore<T>(sql, params);
}

/**
 * Execute SQL on local development store (used in local development only)
 */
async function executeOnLocalStore<T>(sql: string, params: any[] = []): Promise<D1QueryResult<T>> {
  const store = await getLocalStore();
  const trimmed = sql.trim();
  const upper = trimmed.toUpperCase();

  // DDL Statements
  if (upper.startsWith("CREATE TABLE") || upper.startsWith("CREATE INDEX")) {
    return { results: [], success: true, meta: { changed_db: true } };
  }

  // Determine target table
  let tableKey: keyof LocalStore = "articles";
  if (upper.includes("ARTICLES")) tableKey = "articles";
  else if (upper.includes("PROJECTS")) tableKey = "projects";
  else if (upper.includes("CONTACT_INQUIRIES")) tableKey = "contact_inquiries";
  else if (upper.includes("ARTICLE_TOPICS")) tableKey = "article_topics";
  else if (upper.includes("ARTICLE_RUNS")) tableKey = "article_runs";
  else if (upper.includes("APPROVAL_AUDIT_LOGS")) tableKey = "approval_audit_logs";

  // SELECT COUNT(*)
  if (upper.startsWith("SELECT COUNT(*)")) {
    const count = Object.keys(store[tableKey]).length;
    return {
      results: [{ count }] as unknown as T[],
      success: true,
      meta: { rows_read: count },
    };
  }

  // SELECT statements
  if (upper.startsWith("SELECT")) {
    let rows = Object.values(store[tableKey]);

    if (upper.includes("WHERE")) {
      if (upper.includes("SLUG = ?") && params[0] !== undefined) {
        rows = rows.filter((r: any) => r.slug === params[0]);
      } else if (upper.includes("ID = ?") && params[0] !== undefined) {
        rows = rows.filter((r: any) => r.id === params[0]);
      } else if (upper.includes("STATUS = ?") && params[0] !== undefined) {
        rows = rows.filter((r: any) => r.status === params[0]);
      } else if (upper.includes("USED = 0")) {
        rows = rows.filter((r: any) => !r.used);
      }
    }

    if (
      upper.includes("ORDER BY PUBLISHED_AT DESC") ||
      upper.includes("ORDER BY CREATED_AT DESC") ||
      upper.includes("ORDER BY STARTED_AT DESC")
    ) {
      rows.sort((a: any, b: any) => {
        const dateA = a.published_at || a.created_at || a.started_at || "";
        const dateB = b.published_at || b.created_at || b.started_at || "";
        return dateB.localeCompare(dateA);
      });
    }

    return { results: rows as unknown as T[], success: true };
  }

  // INSERT OR REPLACE / INSERT
  if (upper.startsWith("INSERT")) {
    const id = params[0] || `item-${Date.now()}`;
    const rowObj: Record<string, any> = { id };

    if (tableKey === "articles") {
      rowObj.slug = params[1];
      rowObj.title = params[2];
      rowObj.description = params[3];
      rowObj.published_at = params[4];
      rowObj.updated_at = params[5];
      rowObj.category = params[6];
      rowObj.tags = params[7];
      rowObj.content = params[8];
      rowObj.related_projects = params[9];
      rowObj.sources = params[10];
      rowObj.status = params[11];
      rowObj.word_count = params[12];
      rowObj.difficulty = params[13];
      rowObj.reading_time = params[14];
      rowObj.is_automated = params[15];
    } else if (tableKey === "projects") {
      rowObj.name = params[1];
      rowObj.short_description = params[2];
      rowObj.full_description = params[3];
      rowObj.overview = params[4];
      rowObj.features = params[5];
      rowObj.image = params[6];
      rowObj.image_alt = params[7];
      rowObj.technologies = params[8];
      rowObj.category = params[9];
      rowObj.demo_url = params[10];
      rowObj.repo_url = params[11];
      rowObj.last_modified = params[12];
    } else if (tableKey === "contact_inquiries") {
      rowObj.name = params[1];
      rowObj.email = params[2];
      rowObj.message = params[3];
      rowObj.project_type = params[4];
      rowObj.company = params[5];
      rowObj.created_at = params[6];
    } else if (tableKey === "article_topics") {
      rowObj.topic = params[1];
      rowObj.category = params[2];
      rowObj.priority = params[3];
      rowObj.used = params[4];
      rowObj.used_at = params[5];
    } else if (tableKey === "article_runs") {
      rowObj.topic = params[1];
      rowObj.started_at = params[2];
      rowObj.model = params[3];
      rowObj.status = params[4];
      rowObj.score = params[5];
      rowObj.summary = params[6];
    } else if (tableKey === "approval_audit_logs") {
      rowObj.slug = params[1];
      rowObj.action = params[2];
      rowObj.performed_at = params[3];
      rowObj.performed_by = params[4];
      rowObj.notes = params[5];
    }

    store[tableKey][String(id)] = rowObj;
    await persistLocalStore();
    return { results: [], success: true, meta: { changed_db: true, changes: 1 } };
  }

  // UPDATE
  if (upper.startsWith("UPDATE")) {
    if (tableKey === "articles" && upper.includes("STATUS = 'PUBLISHED'")) {
      const slug = params[1] || params[0];
      const match = Object.values(store.articles).find((a: any) => a.slug === slug);
      if (match) {
        match.status = "published";
        match.updated_at = new Date().toISOString().split("T")[0];
        await persistLocalStore();
      }
    }
    return { results: [], success: true, meta: { changed_db: true, changes: 1 } };
  }

  // DELETE
  if (upper.startsWith("DELETE")) {
    if (upper.includes("WHERE SLUG = ?") && params[0] !== undefined) {
      const slug = params[0];
      for (const [key, val] of Object.entries(store[tableKey])) {
        if ((val as any).slug === slug) {
          delete store[tableKey][key];
        }
      }
      await persistLocalStore();
    } else if (upper.includes("WHERE ID = ?") && params[0] !== undefined) {
      delete store[tableKey][params[0]];
      await persistLocalStore();
    }
    return { results: [], success: true, meta: { changed_db: true, changes: 1 } };
  }

  return { results: [], success: true };
}

/**
 * Get comprehensive D1 connection status for dashboard
 * Reports honest status without masquerading local emulation as connected live D1.
 */
export async function getD1Status(): Promise<D1Status> {
  const globalAny = globalThis as any;
  const { accountId, databaseId, apiToken, isConfigured } = getCloudflareCredentials();

  // 1. Native Binding Check
  if (globalAny.DB) {
    try {
      const start = Date.now();
      const res = await globalAny.DB.prepare("SELECT 1 as ping").all();
      return {
        databaseName: DATABASE_NAME,
        databaseId: databaseId || "binding:env.DB",
        mode: "native",
        hasApiCredentials: true,
        connected: Boolean(res?.success ?? true),
        message: `Connected via Cloudflare Native D1 Binding (${DATABASE_NAME})`,
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        databaseName: DATABASE_NAME,
        databaseId: databaseId || "binding:env.DB",
        mode: "native",
        hasApiCredentials: true,
        connected: false,
        message: `Native D1 binding error: ${err.message}`,
      };
    }
  }

  // 2. Cloudflare REST API Check
  if (isConfigured) {
    try {
      const start = Date.now();
      const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: "SELECT 1 as ping", params: [] }),
      });
      const data = await res.json();
      const latency = Date.now() - start;

      if (res.ok && data.success) {
        return {
          databaseName: DATABASE_NAME,
          databaseId: databaseId!,
          mode: "remote_api",
          hasApiCredentials: true,
          connected: true,
          message: `Connected live to Cloudflare D1 (${DATABASE_NAME}) via Cloudflare REST API`,
          latencyMs: latency,
        };
      } else {
        const errorMsg = data.errors?.[0]?.message || `HTTP ${res.status}: ${res.statusText}`;
        return {
          databaseName: DATABASE_NAME,
          databaseId: databaseId!,
          mode: "remote_api",
          hasApiCredentials: true,
          connected: false,
          message: `Cloudflare D1 Connection Error: ${errorMsg}`,
        };
      }
    } catch (err: any) {
      return {
        databaseName: DATABASE_NAME,
        databaseId: databaseId!,
        mode: "remote_api",
        hasApiCredentials: true,
        connected: false,
        message: `Network error connecting to Cloudflare D1: ${err.message}`,
      };
    }
  }

  // 3. Unconfigured / Local Dev Status
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    return {
      databaseName: DATABASE_NAME,
      databaseId: databaseId || "Not set",
      mode: "unconfigured",
      hasApiCredentials: false,
      connected: false,
      message: "Cloudflare D1 is not configured in production. Please set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, and CLOUDFLARE_API_TOKEN in Vercel.",
    };
  }

  return {
    databaseName: DATABASE_NAME,
    databaseId: databaseId || "local-dev",
    mode: "local_dev",
    hasApiCredentials: false,
    connected: false, // Honesty: Not connected to live Cloudflare D1
    message: "Local Development Mode: Using local SQLite dev store. Add CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, and CLOUDFLARE_API_TOKEN in .env to connect live.",
  };
}

/**
 * Repeatable, safe schema migrations for Cloudflare D1
 * Never runs destructive resets.
 */
export async function runD1Migration(): Promise<{ success: boolean; message: string; appliedStatements: number }> {
  const ddlStatements = [
    `CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      published_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT NOT NULL,
      content TEXT NOT NULL,
      related_projects TEXT NOT NULL,
      sources TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      word_count INTEGER DEFAULT 600,
      difficulty TEXT DEFAULT 'Intermediate',
      reading_time TEXT DEFAULT '5 min read',
      is_automated INTEGER DEFAULT 0
    )`,
    `CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug)`,
    `CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status)`,
    `CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC)`,

    `CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_description TEXT NOT NULL,
      full_description TEXT NOT NULL,
      overview TEXT,
      features TEXT NOT NULL,
      image TEXT NOT NULL,
      image_alt TEXT,
      technologies TEXT NOT NULL,
      category TEXT NOT NULL,
      demo_url TEXT,
      repo_url TEXT,
      last_modified TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category)`,

    `CREATE TABLE IF NOT EXISTS contact_inquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      project_type TEXT,
      company TEXT,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_inquiries_created ON contact_inquiries(created_at DESC)`,

    `CREATE TABLE IF NOT EXISTS article_topics (
      id TEXT PRIMARY KEY,
      topic TEXT NOT NULL,
      category TEXT NOT NULL,
      priority INTEGER DEFAULT 8,
      used INTEGER DEFAULT 0,
      used_at TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_topics_used ON article_topics(used, priority DESC)`,

    `CREATE TABLE IF NOT EXISTS article_runs (
      id TEXT PRIMARY KEY,
      topic TEXT NOT NULL,
      started_at TEXT NOT NULL,
      model TEXT NOT NULL,
      status TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      summary TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_runs_started ON article_runs(started_at DESC)`,

    `CREATE TABLE IF NOT EXISTS approval_audit_logs (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      action TEXT NOT NULL,
      performed_at TEXT NOT NULL,
      performed_by TEXT NOT NULL,
      notes TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_audit_slug ON approval_audit_logs(slug)`,
  ];

  let applied = 0;
  for (const ddl of ddlStatements) {
    const res = await queryD1(ddl);
    if (!res.success) {
      return {
        success: false,
        message: `Migration failed at statement: ${ddl.slice(0, 40)}... Error: ${res.error}`,
        appliedStatements: applied,
      };
    }
    applied++;
  }

  return {
    success: true,
    message: `All ${applied} safe migration statements executed successfully on Cloudflare D1.`,
    appliedStatements: applied,
  };
}
