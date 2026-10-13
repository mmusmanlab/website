import fs from "fs/promises";
import path from "path";

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
  startedAt: string;
  completedAt: string;
}

// Initial preserved articles + high-value practical problem-solving articles
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
      { title: "Next.js App Router Architecture", url: "https://nextjs.org/docs/app" },
      { title: "TypeScript Official Documentation", url: "https://www.typescriptlang.org/docs/" },
    ],
    content: [
      {
        heading: "Project overview",
        paragraphs: [
          "Praxivon is described as an educational website that gives students structured learning paths and access to courses. The project description also names visual academic progress tracking.",
          "The listed technology stack is Next.js, TypeScript, Tailwind CSS and Node.js. The available project information does not document the course data model, user authentication, content-management approach or server implementation, so those details are intentionally left out.",
        ],
      },
      {
        heading: "Documented functionality",
        paragraphs: ["The project record describes three main product areas:"],
        bullets: [
          "Structured learning paths",
          "Course access",
          "Visual academic progress tracking",
        ],
      },
      {
        heading: "Technology choices",
        paragraphs: [
          "Next.js and TypeScript are identified as the core web technologies, with Tailwind CSS and Node.js also listed. The portfolio describes the interface as SEO-friendly, but does not provide performance measurements or further architectural specifics.",
        ],
      },
      {
        heading: "Structuring learning routes for discovery",
        paragraphs: [
          "Educational platforms benefit substantially from hierarchical routing and server-rendered metadata. Enabling prospective learners to discover curricula through search requires semantic HTML and clean nested layout boundaries.",
        ],
      },
    ],
    relatedProjects: ["praxivon"],
  },
  {
    id: "art-4",
    slug: "handling-state-and-performance-in-react-native-expo-lists",
    title: "Optimizing List Rendering and State Updates in React Native and Expo",
    description: "How to diagnose frame drops in large mobile feeds, replace unoptimized ScrollViews with FlashList or memoized FlatLists, and isolate state mutations.",
    publishedAt: "2026-10-04",
    updatedAt: "2026-10-04",
    category: "Mobile Development",
    tags: ["React Native", "Expo", "Performance", "TypeScript", "Mobile"],
    difficulty: "Advanced",
    readingTime: "6 min read",
    wordCount: 940,
    status: "published",
    sources: [
      { title: "React Native FlatList Performance Guide", url: "https://reactnative.dev/docs/optimizing-flatlist-configuration" },
      { title: "Shopify FlashList Documentation", url: "https://shopify.github.io/flash-list/" },
    ],
    content: [
      {
        heading: "The Problem & Symptoms",
        paragraphs: [
          "When rendering hundreds of catalog items or transactions in React Native apps built with Expo, users often report stuttering during fast scrolling, UI thread freezes, or high memory consumption on lower-end devices.",
          "The root cause typically stems from rendering un-virtualized items in a standard ScrollView, creating inline arrow functions within renderItem, or passing non-primitive unstable props that trigger cascades of re-renders.",
        ],
      },
      {
        heading: "Diagnosis & Profiling",
        paragraphs: [
          "To locate the rendering bottleneck:",
          "1. Use the React DevTools Profiler in Flipper or the Expo development build to identify which list cells re-render during scroll.",
          "2. Check if parent state updates (such as a search input or a filter toggle) cause the entire list data array to be recreated with fresh object references.",
        ],
        bullets: [
          "Identify unneeded cell re-renders using React.memo with custom equality comparison.",
          "Check windowSize, maxToRenderPerBatch, and removeClippedSubviews on FlatList.",
          "Ensure keyExtractor returns a stable unique string (never index).",
        ],
      },
      {
        heading: "The Solution: Memoized Cell Pattern",
        paragraphs: [
          "Isolate the cell component and ensure callbacks are stabilized with useCallback. Here is a production-tested pattern for high-performance listing:",
        ],
        codeBlock: {
          language: "tsx",
          caption: "Memoized list item with stable callback references",
          code: `import React, { useCallback, memo } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';

interface ProductItemProps {
  id: string;
  title: string;
  price: number;
  onSelect: (id: string) => void;
}

// 1. Memoize item to prevent re-render when other items update
const ProductItem = memo(({ id, title, price, onSelect }: ProductItemProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>{"$" + price}</Text>
    </View>
  );
});

export function ProductCatalog({ items }: { items: ProductItemProps[] }) {
  const handleSelect = useCallback((id: string) => {
    // Stable handler without re-creating closure
  }, []);

  const renderItem = useCallback(({ item }: { item: ProductItemProps }) => (
    <ProductItem {...item} onSelect={handleSelect} />
  ), [handleSelect]);

  const keyExtractor = useCallback((item: ProductItemProps) => item.id, []);

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
}`,
        },
      },
      {
        heading: "Verification & Verification Checklist",
        paragraphs: [
          "Verify the fix by running an FPS monitor in the Expo development client. Stable 60 FPS scrolling should be achieved across both Android and iOS without ballooning memory usage.",
        ],
        bullets: [
          "Verify UI thread remains at 58-60 FPS under rapid swipe.",
          "Ensure memory usage levels off rather than climbing monotonically.",
          "Confirm layout calculations don't shift when new items stream into view.",
        ],
      },
    ],
    relatedProjects: ["amtech-shop", "leftly"],
  },
  {
    id: "art-5",
    slug: "nextjs-15-caching-and-server-actions-best-practices",
    title: "Demystifying Next.js 15 Caching: Server Actions, fetch, and Dynamic Boundaries",
    description: "A practical guide to Next.js 15 cache defaults, handling revalidatePath properly in Server Actions, and avoiding unexpected stale data.",
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-08",
    category: "Web Development",
    tags: ["Next.js", "React", "TypeScript", "Full-Stack", "Backend"],
    difficulty: "Advanced",
    readingTime: "7 min read",
    wordCount: 1120,
    status: "published",
    sources: [
      { title: "Next.js 15 Release Notes & Upgrade Guide", url: "https://nextjs.org/blog/next-15" },
      { title: "React 19 Server Actions Documentation", url: "https://react.dev/reference/rsc/server-actions" },
    ],
    content: [
      {
        heading: "The Shift in Next.js 15 Caching Defaults",
        paragraphs: [
          "In Next.js 14 and earlier, fetch requests were cached by default (force-cache), often leading to confusing scenarios where mutations appeared to execute on the server but the client continued displaying obsolete UI data.",
          "Next.js 15 changed this paradigm: fetch requests, GET Route Handlers, and client navigations default to 'no-store' unless explicitly configured. While this improves data freshness out-of-the-box, developers must understand how to selectively cache expensive operations without introducing stale-reads after Server Actions.",
        ],
      },
      {
        heading: "Diagnosing Stale UI After Server Actions",
        paragraphs: [
          "When a user submits a form or performs a critical mutation, the UI must immediately reflect the new state. A common bug is updating the database in a Server Action but forgetting to invalidate either the route segment or the specific tag.",
        ],
        bullets: [
          "Always call revalidatePath(path) or revalidateTag(tag) inside the Server Action after successful database persistence.",
          "Return structured outcome objects { success: boolean, error?: string } rather than relying solely on redirects.",
          "Ensure optimistic updates use React 19's useOptimistic hook when instant feedback is required.",
        ],
      },
      {
        heading: "Production Server Action Implementation",
        paragraphs: [
          "Here is an idiomatic Next.js 15 Server Action demonstrating schema validation with Zod, database transaction handling, and tag-based revalidation:",
        ],
        codeBlock: {
          language: "ts",
          caption: "Secure Next.js 15 Server Action with tag revalidation",
          code: `'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

const UpdateSchema = z.object({
  projectId: z.string().min(1),
  status: z.enum(['pending', 'active', 'completed']),
});

export type ActionState = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function updateProjectStatus(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const rawData = {
    projectId: formData.get('projectId'),
    status: formData.get('status'),
  };

  const validation = UpdateSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input parameters provided.',
    };
  }

  try {
    const { projectId, status } = validation.data;
    
    // Execute database mutation
    // await db.projects.update({ where: { id: projectId }, data: { status } });

    // Purge only the specific cached tag, preserving un-affected routes
    revalidateTag('project-' + projectId);
    revalidateTag('projects-list');

    return { success: true, message: 'Status updated successfully.' };
  } catch (err) {
    return { success: false, error: 'Database transaction failed. Please retry.' };
  }
}`,
        },
      },
      {
        heading: "Key Takeaways for Full-Stack Systems",
        paragraphs: [
          "By decoupling data mutation from layout rendering and leveraging explicit cache tags (revalidateTag), Next.js applications remain blazingly fast while guaranteeing data integrity across collaborative and multi-user views.",
        ],
      },
    ],
    relatedProjects: ["praxivon", "technical-systems"],
  },
];

const ARTICLES_FILE_PATH = path.join(process.cwd(), "src/lib/data/articles.json");
const TOPICS_FILE_PATH = path.join(process.cwd(), "src/lib/data/topics.json");
const RUNS_FILE_PATH = path.join(process.cwd(), "src/lib/data/runs.json");

// In-memory fallback / cache to guarantee instantaneous SSR performance and resiliency
let memoryArticles: Article[] = [...initialArticles];
let memoryTopics: ArticleTopic[] = [
  { id: "top-1", topic: "React Native Expo Audio & Media Background Playback on Android 14", category: "Mobile Development", priority: 8, used: false },
  { id: "top-2", topic: "Full-Stack End-to-End Type Safety with Zod and TypeScript Route Handlers", category: "Software Engineering", priority: 9, used: false },
  { id: "top-3", topic: "Next.js Dynamic Route Metadata Generation and Canonical SEO Best Practices", category: "Web Development", priority: 8, used: false },
  { id: "top-4", topic: "PostgreSQL Connection Pooling and Latency Reduction in Serverless Next.js", category: "Backend Engineering", priority: 9, used: false },
];
let memoryRuns: ArticleRun[] = [];

async function ensureFileInitialized<T>(filePath: string, defaultData: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2), "utf-8");
    } catch {
      // Ephemeral disk or readonly fallback
    }
    return defaultData;
  }
}

export async function getAllArticles(): Promise<Article[]> {
  try {
    const fileArticles = await ensureFileInitialized<Article[]>(ARTICLES_FILE_PATH, initialArticles);
    if (Array.isArray(fileArticles) && fileArticles.length > 0) {
      // Merge with initialArticles to ensure preserved slugs are never lost
      const combined = [...fileArticles];
      for (const init of initialArticles) {
        if (!combined.some((a) => a.slug === init.slug)) {
          combined.push(init);
        }
      }
      memoryArticles = combined;
      return combined;
    }
  } catch {
    // Fall back to memory
  }
  return memoryArticles;
}

export async function getPublishedArticles(): Promise<Article[]> {
  const all = await getAllArticles();
  return all
    .filter((a) => a.status === "published")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const all = await getAllArticles();
  return all.find((a) => a.slug === slug && a.status === "published") ?? null;
}

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const all = await getPublishedArticles();
  return all
    .filter((a) => a.slug !== article.slug)
    .filter((a) => 
      a.category === article.category ||
      a.tags.some((t) => article.tags.includes(t)) ||
      a.relatedProjects.some((p) => article.relatedProjects.includes(p))
    )
    .slice(0, limit);
}

export async function saveArticle(newArticle: Article): Promise<void> {
  const all = await getAllArticles();
  const existingIndex = all.findIndex((a) => a.slug === newArticle.slug || a.id === newArticle.id);
  
  if (existingIndex >= 0) {
    all[existingIndex] = { ...all[existingIndex], ...newArticle, updatedAt: new Date().toISOString().split("T")[0] };
  } else {
    all.unshift(newArticle);
  }
  
  memoryArticles = all;

  try {
    await fs.mkdir(path.dirname(ARTICLES_FILE_PATH), { recursive: true });
    await fs.writeFile(ARTICLES_FILE_PATH, JSON.stringify(all, null, 2), "utf-8");
  } catch (err) {
    console.warn("[ArticlesStore] Could not write to disk, updated in-memory store:", err);
  }
}

export async function getArticleTopics(): Promise<ArticleTopic[]> {
  try {
    const topics = await ensureFileInitialized<ArticleTopic[]>(TOPICS_FILE_PATH, memoryTopics);
    memoryTopics = topics;
    return topics;
  } catch {
    return memoryTopics;
  }
}

export async function markTopicUsed(topicId: string): Promise<void> {
  const topics = await getArticleTopics();
  const target = topics.find((t) => t.id === topicId);
  if (target) {
    target.used = true;
    target.usedAt = new Date().toISOString();
    try {
      await fs.writeFile(TOPICS_FILE_PATH, JSON.stringify(topics, null, 2), "utf-8");
    } catch {
      // In-memory fallback
    }
  }
}

export async function recordArticleRun(run: ArticleRun): Promise<void> {
  memoryRuns.unshift(run);
  try {
    const runs = await ensureFileInitialized<ArticleRun[]>(RUNS_FILE_PATH, memoryRuns);
    runs.unshift(run);
    await fs.writeFile(RUNS_FILE_PATH, JSON.stringify(runs.slice(0, 50), null, 2), "utf-8");
  } catch {
    // In-memory fallback
  }
}

export async function deleteArticle(slug: string): Promise<boolean> {
  const all = await getAllArticles();
  const filtered = all.filter((a) => a.slug !== slug);
  if (filtered.length === all.length) {
    return false;
  }
  memoryArticles = filtered;
  try {
    await fs.writeFile(ARTICLES_FILE_PATH, JSON.stringify(filtered, null, 2), "utf-8");
  } catch (err) {
    console.warn("[ArticlesStore] Could not persist article deletion to disk:", err);
  }
  return true;
}

export async function addSuggestedTopic(topic: string, category: string, priority = 8): Promise<ArticleTopic> {
  const topics = await getArticleTopics();
  const newTopic: ArticleTopic = {
    id: `top-${Date.now()}`,
    topic,
    category,
    priority,
    used: false,
  };
  topics.unshift(newTopic);
  memoryTopics = topics;
  try {
    await fs.writeFile(TOPICS_FILE_PATH, JSON.stringify(topics, null, 2), "utf-8");
  } catch (err) {
    console.warn("[ArticlesStore] Could not persist topic to disk:", err);
  }
  return newTopic;
}

export async function getArticleRuns(): Promise<ArticleRun[]> {
  try {
    return await ensureFileInitialized<ArticleRun[]>(RUNS_FILE_PATH, memoryRuns);
  } catch {
    return memoryRuns;
  }
}
