import fs from "fs/promises";
import path from "path";
import { queryD1 } from "./cloudflare-d1";
import { validateArticleQuality } from "./article-quality-gate";

export interface ArticleSource {
  title: string;
  url: string;
}

export interface ArticleCodeBlock {
  language: string;
  code: string;
  caption?: string;
}

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  codeBlock?: ArticleCodeBlock;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  content: ArticleSection[];
  relatedProjects: string[];
  sources?: ArticleSource[];
  status: "published" | "draft";
  wordCount: number;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  readingTime?: string;
  isAutomated?: boolean;
}

export interface ArticleTopic {
  id: string;
  topic: string;
  category: string;
  priority: number;
  used: boolean;
  usedAt?: string;
}

export interface ArticleRun {
  id: string;
  runDate: string;
  topic: string;
  status: "success" | "skipped" | "failed" | "rejected";
  model: string;
  error?: string;
  articleSlug?: string;
  score?: number;
  reason?: string;
  summary?: string;
  startedAt: string;
  completedAt: string;
}

// Initial preserved articles representing verified problem-solving case studies
export const initialArticles: Article[] = [
  {
    id: "art-1",
    slug: "react-native-ecommerce-expo-firebase",
    title: "How I Built a React Native E-commerce App with Expo and Firebase",
    description: "A case study of Amtech Shop, a cross-platform retail app described with shopping, product updates, payment integration and inventory administration.",
    publishedAt: "2026-09-30",
    updatedAt: "2026-09-30",
    category: "Mobile Development",
    tags: ["React Native", "Expo", "Firebase", "TypeScript", "E-commerce"],
    difficulty: "Intermediate",
    readingTime: "4 min read",
    wordCount: 520,
    status: "published",
    sources: [
      { title: "React Native Documentation", url: "https://reactnative.dev/docs/getting-started" },
      { title: "Expo Documentation", url: "https://docs.expo.dev/" },
    ],
    content: [
      {
        heading: "Project overview",
        paragraphs: [
          "Amtech Shop is described as an Android and iOS e-commerce application for retail businesses. The project record identifies React Native and Expo for the app and lists Firebase and TypeScript in its stack.",
          "The available project information describes the product scope, but does not document implementation details such as Firebase services, payment provider, data model or deployment process. This case study stays with the documented scope rather than filling those gaps with assumptions.",
        ],
      },
      {
        heading: "Documented functionality",
        paragraphs: ["The project description names these areas of functionality:"],
        bullets: [
          "A shopping experience",
          "Real-time product updates",
          "Payment integration",
          "An inventory administration dashboard",
        ],
      },
      {
        heading: "Technology choices",
        paragraphs: [
          "React Native and Expo are the named mobile technologies, with Firebase and TypeScript also listed for the project. The project record does not specify how responsibilities were divided among those technologies, so no further architecture claims are made here.",
        ],
      },
      {
        heading: "Engineering takeaways for mobile commerce",
        paragraphs: [
          "Developing a mobile retail workflow requires strong state separation between browsing, shopping cart mutation, and checkout confirmation. Keeping components modular allows independent iteration on the catalog layout without destabilizing payment and auth flows.",
        ],
      },
    ],
    relatedProjects: ["amtech-shop"],
  },
  {
    id: "art-2",
    slug: "household-budget-tracker-react-native-expo",
    title: "Building a Household Budget Tracker with React Native and Expo",
    description: "A factual overview of Leftly, an Expo and React Native household budgeting project with expense tracking, overspending alerts and spending insights.",
    publishedAt: "2026-09-30",
    updatedAt: "2026-09-30",
    category: "Mobile Development",
    tags: ["React Native", "Expo", "TypeScript", "Redux", "Personal Finance"],
    difficulty: "Intermediate",
    readingTime: "4 min read",
    wordCount: 490,
    status: "published",
    sources: [
      { title: "Redux Toolkit Best Practices", url: "https://redux-toolkit.js.org/introduction/getting-started" },
      { title: "Expo Application Lifecycle", url: "https://docs.expo.dev/versions/latest/" },
    ],
    content: [
      {
        heading: "Project overview",
        paragraphs: [
          "Leftly is described as a household budget and expense-tracking tool built with Expo. Its listed technologies are Expo, React Native, TypeScript and Redux.",
          "The project description focuses on helping households keep track of budgets and expenses. It does not specify account models, storage, synchronization behavior or alert thresholds, so those implementation details are not assumed here.",
        ],
      },
      {
        heading: "Documented functionality",
        paragraphs: ["The available project description names these user-facing functions:"],
        bullets: [
          "Household budget tracking",
          "Expense management",
          "Alerts for overspending",
          "Graphical insights into spending habits",
        ],
      },
      {
        heading: "Technology choices",
        paragraphs: [
          "The project record lists React Native and Expo alongside TypeScript and Redux. It does not describe specific Redux state boundaries or the implementation of the visual insights, so the case study limits itself to the named stack and functionality.",
        ],
      },
      {
        heading: "State modeling for personal budgeting",
        paragraphs: [
          "In financial applications, unpredictable network status makes local-first state handling crucial. Managing transaction logs with typed actions ensures that household calculations remain consistent even prior to synchronization.",
        ],
      },
    ],
    relatedProjects: ["leftly"],
  },
  {
    id: "art-3",
    slug: "educational-platform-nextjs-typescript",
    title: "Building an Educational Platform with Next.js and TypeScript",
    description: "A project-based look at Praxivon, an educational website organized around structured learning paths, courses and visual academic progress.",
    publishedAt: "2026-09-30",
    updatedAt: "2026-09-30",
    category: "Web Development",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Education"],
    difficulty: "Intermediate",
    readingTime: "4 min read",
    wordCount: 510,
    status: "published",
    sources: [
      { title: "Next.js App Router Documentation", url: "https://nextjs.org/docs" },
      { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/" },
    ],
    content: [
      {
        heading: "Project overview",
        paragraphs: [
          "Praxivon is described as an educational platform with structured learning paths. The project record identifies Next.js and TypeScript with Tailwind CSS and Node.js.",
          "The available project description focuses on the student interface and learning paths. It does not describe course authoring, user accounts, progress storage or deployment architecture, so those implementation details are not inferred here.",
        ],
      },
      {
        heading: "Documented functionality",
        paragraphs: ["The project description identifies three user-facing areas:"],
        bullets: [
          "Structured learning paths",
          "Course access",
          "Visual academic progress tracking",
        ],
      },
      {
        heading: "Technology choices",
        paragraphs: [
          "Next.js and TypeScript are listed alongside Tailwind CSS and Node.js. The record does not describe rendering strategy, styling boundaries or backend services, so the case study limits itself to the named technologies.",
        ],
      },
      {
        heading: "Structuring learning platforms",
        paragraphs: [
          "Creating high-impact educational tooling demands clear visual feedback and performant page loads. Using Next.js enables rich pre-rendering for course discovery while maintaining fluid interactive progress states.",
        ],
      },
    ],
    relatedProjects: ["praxivon"],
  },
];

const ARTICLES_FILE_PATH = path.join(process.cwd(), "src/lib/data/articles.json");
const TOPICS_FILE_PATH = path.join(process.cwd(), "src/lib/data/topics.json");
const RUNS_FILE_PATH = path.join(process.cwd(), "src/lib/data/runs.json");

let memoryArticles: Article[] = [...initialArticles];
let memoryTopics: ArticleTopic[] = [];
let memoryRuns: ArticleRun[] = [];

async function saveArticleToD1(article: Article): Promise<boolean> {
  const res = await queryD1(
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
  return res.success;
}

/**
 * Get all articles from primary persistent storage (D1)
 * Used by private dashboard for draft review and management
 */
export async function getAllArticles(): Promise<Article[]> {
  try {
    const d1Res = await queryD1("SELECT * FROM articles ORDER BY published_at DESC");
    if (d1Res.success && d1Res.results && d1Res.results.length > 0) {
      const d1Articles: Article[] = d1Res.results.map((row: any) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        publishedAt: row.published_at || row.publishedAt,
        updatedAt: row.updated_at || row.updatedAt,
        category: row.category,
        tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags || ["Engineering"],
        content: typeof row.content === "string" ? JSON.parse(row.content) : row.content || [],
        relatedProjects:
          typeof row.related_projects === "string"
            ? JSON.parse(row.related_projects)
            : row.relatedProjects || [],
        sources: typeof row.sources === "string" ? JSON.parse(row.sources) : row.sources || [],
        status: row.status || "draft",
        wordCount: Number(row.word_count || row.wordCount || 600),
        difficulty: row.difficulty || "Intermediate",
        readingTime: row.reading_time || row.readingTime || "5 min read",
        isAutomated: Boolean(row.is_automated ?? row.isAutomated),
      }));

      // Guarantee preserved baseline articles are always present
      const combined = [...d1Articles];
      for (const init of initialArticles) {
        if (!combined.some((a) => a.slug === init.slug)) {
          combined.push(init);
          saveArticleToD1(init).catch(() => {});
        }
      }
      memoryArticles = combined;
      return combined;
    }
  } catch (err) {
    console.warn("[ArticlesStore] Primary D1 read exception:", err);
  }

  // Auto-seed initial articles to D1 if D1 is empty
  for (const init of initialArticles) {
    saveArticleToD1(init).catch(() => {});
  }

  // Local file fallback for development
  try {
    const raw = await fs.readFile(ARTICLES_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const combined = [...parsed];
      for (const init of initialArticles) {
        if (!combined.some((a) => a.slug === init.slug)) {
          combined.push(init);
        }
      }
      memoryArticles = combined;
      return combined;
    }
  } catch {
    // Memory fallback
  }

  return memoryArticles;
}

/**
 * HUMAN-ONLY PUBLIC GATEWAY:
 * Returns ONLY articles where status === "published".
 * Drafts are strictly excluded from public site and sitemap.
 */
export async function getPublishedArticles(): Promise<Article[]> {
  const all = await getAllArticles();
  return all
    .filter((a) => a.status === "published")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

/**
 * Public article detail lookup
 * Returns ONLY published articles; returns null for drafts.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const all = await getAllArticles();
  return all.find((a) => a.slug === slug && a.status === "published") ?? null;
}

/**
 * Dashboard lookup to retrieve any article (including drafts)
 */
export async function getDashboardArticleBySlug(slug: string): Promise<Article | null> {
  const all = await getAllArticles();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const all = await getPublishedArticles();
  return all
    .filter((a) => a.slug !== article.slug)
    .filter(
      (a) =>
        a.category === article.category ||
        a.tags.some((t) => article.tags.includes(t)) ||
        a.relatedProjects.some((p) => article.relatedProjects.includes(p))
    )
    .slice(0, limit);
}

/**
 * Save an article to persistent store
 */
export async function saveArticle(article: Article): Promise<void> {
  const all = await getAllArticles();
  const existingIndex = all.findIndex((a) => a.slug === article.slug || a.id === article.id);

  if (existingIndex >= 0) {
    all[existingIndex] = {
      ...all[existingIndex],
      ...article,
      updatedAt: new Date().toISOString().split("T")[0],
    };
  } else {
    all.unshift(article);
  }

  memoryArticles = all;

  // Persist to Cloudflare D1
  const persisted = await saveArticleToD1(article);
  if (!persisted && process.env.NODE_ENV === "production") {
    console.error("[ArticlesStore] Critical: Failed writing article to Cloudflare D1 in production.");
  }

  // Sync to local file when writable
  try {
    await fs.mkdir(path.dirname(ARTICLES_FILE_PATH), { recursive: true });
    await fs.writeFile(ARTICLES_FILE_PATH, JSON.stringify(all, null, 2), "utf-8");
  } catch {
    // Ephemeral disk in serverless
  }
}

/**
 * ENFORCE HUMAN-ONLY PUBLICATION RULE
 * Authenticated human approval operation to publish an existing draft.
 */
export async function approveAndPublishDraft(
  slug: string,
  reviewedData?: Partial<Article>,
  adminUser = "admin"
): Promise<{ success: boolean; article?: Article; error?: string }> {
  const existingDraft = await getDashboardArticleBySlug(slug);

  if (!existingDraft) {
    return { success: false, error: `Draft with slug "${slug}" not found.` };
  }

  if (existingDraft.status === "published") {
    return { success: false, error: "This article is already published." };
  }

  const existingAll = await getAllArticles();

  // Merge reviewed modifications
  const candidateArticle: Article = {
    ...existingDraft,
    ...(reviewedData || {}),
    id: existingDraft.id,
    slug: existingDraft.slug, // Preserve verified slug
    status: "published", // Explicit human approval transition
    publishedAt: existingDraft.publishedAt || new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  };

  // Run full server-side quality gate validation
  const quality = validateArticleQuality(candidateArticle, existingAll, true);
  if (!quality.valid) {
    return {
      success: false,
      error: `Article failed quality gate: ${quality.errors.join("; ")}`,
    };
  }

  // Persist published article
  await saveArticle(candidateArticle);

  // Record audit log
  try {
    await queryD1(
      "INSERT INTO approval_audit_logs (id, slug, action, performed_at, performed_by, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [
        `audit-${Date.now()}`,
        candidateArticle.slug,
        "APPROVE_AND_PUBLISH",
        new Date().toISOString(),
        adminUser,
        `Article approved with word count ${candidateArticle.wordCount}`,
      ]
    );
  } catch (err) {
    console.warn("[ArticlesStore] Could not record approval audit log:", err);
  }

  return { success: true, article: candidateArticle };
}

/**
 * Reject a draft from the review queue
 */
export async function rejectDraft(
  slug: string,
  reason = "Rejected by user",
  adminUser = "admin"
): Promise<boolean> {
  const draft = await getDashboardArticleBySlug(slug);
  if (!draft) return false;

  // Record rejection audit log
  try {
    await queryD1(
      "INSERT INTO approval_audit_logs (id, slug, action, performed_at, performed_by, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [
        `audit-${Date.now()}`,
        slug,
        "REJECT_DRAFT",
        new Date().toISOString(),
        adminUser,
        reason,
      ]
    );
  } catch {
    // Audit log fallback
  }

  return await deleteArticle(slug);
}

export async function deleteArticle(slug: string): Promise<boolean> {
  const allBefore = await getAllArticles();
  const exists = allBefore.some((a) => a.slug === slug);
  if (!exists) {
    return false;
  }

  try {
    await queryD1("DELETE FROM articles WHERE slug = ?", [slug]);
  } catch (err) {
    console.warn("[ArticlesStore] Could not delete article in D1:", err);
  }

  const filtered = allBefore.filter((a) => a.slug !== slug);
  memoryArticles = filtered;

  try {
    await fs.writeFile(ARTICLES_FILE_PATH, JSON.stringify(filtered, null, 2), "utf-8");
  } catch {
    // Serverless read-only
  }
  return true;
}

export async function getArticleTopics(): Promise<ArticleTopic[]> {
  try {
    const res = await queryD1("SELECT * FROM article_topics ORDER BY priority DESC");
    if (res.success && res.results && res.results.length > 0) {
      return res.results.map((r: any) => ({
        id: r.id,
        topic: r.topic,
        category: r.category,
        priority: Number(r.priority || 8),
        used: Boolean(r.used),
        usedAt: r.used_at || r.usedAt,
      }));
    }
  } catch {
    // Fall back to local
  }

  try {
    const raw = await fs.readFile(TOPICS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Memory fallback
  }

  return memoryTopics;
}

export async function markTopicUsed(topicId: string): Promise<void> {
  try {
    await queryD1("UPDATE article_topics SET used = 1, used_at = ? WHERE id = ?", [
      new Date().toISOString(),
      topicId,
    ]);
  } catch {
    // In-memory fallback
  }

  const topics = await getArticleTopics();
  const target = topics.find((t) => t.id === topicId);
  if (target) {
    target.used = true;
    target.usedAt = new Date().toISOString();
  }
}

export async function addSuggestedTopic(topic: string, category: string, priority = 8): Promise<ArticleTopic> {
  const newTopic: ArticleTopic = {
    id: `top-${Date.now()}`,
    topic,
    category,
    priority,
    used: false,
  };

  try {
    await queryD1(
      "INSERT OR REPLACE INTO article_topics (id, topic, category, priority, used) VALUES (?, ?, ?, ?, ?)",
      [newTopic.id, newTopic.topic, newTopic.category, newTopic.priority, 0]
    );
  } catch {
    // Memory fallback
  }

  memoryTopics.unshift(newTopic);
  return newTopic;
}

export async function recordArticleRun(run: ArticleRun): Promise<void> {
  memoryRuns.unshift(run);
  try {
    await queryD1(
      "INSERT INTO article_runs (id, topic, started_at, model, status, score, summary) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        run.id || `run-${Date.now()}`,
        run.topic,
        run.startedAt,
        run.model,
        run.status,
        run.score || 0,
        run.summary || run.reason || "",
      ]
    );
  } catch (err) {
    console.warn("[ArticlesStore] Could not record run in D1:", err);
  }

  try {
    await fs.mkdir(path.dirname(RUNS_FILE_PATH), { recursive: true });
    await fs.writeFile(RUNS_FILE_PATH, JSON.stringify(memoryRuns.slice(0, 50), null, 2), "utf-8");
  } catch {
    // Ephemeral disk
  }
}

export async function getArticleRuns(): Promise<ArticleRun[]> {
  try {
    const res = await queryD1("SELECT * FROM article_runs ORDER BY started_at DESC LIMIT 50");
    if (res.success && res.results && res.results.length > 0) {
      return res.results.map((r: any) => ({
        id: r.id,
        runDate: (r.started_at || "").split("T")[0],
        topic: r.topic,
        status: r.status,
        model: r.model,
        score: Number(r.score || 0),
        reason: r.summary,
        summary: r.summary,
        startedAt: r.started_at,
        completedAt: r.started_at,
      }));
    }
  } catch {
    // Fall back to memory
  }
  return memoryRuns;
}
