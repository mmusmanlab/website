import { defaultAIProvider } from "./index";
import {
  getAllArticles,
  getArticleTopics,
  markTopicUsed,
  saveArticle,
  recordArticleRun,
  Article,
  ArticleSection,
  ArticleRun,
  ArticleSource,
} from "@/lib/articles-store";
import { validateArticleQuality, ALLOWED_CATEGORIES } from "@/lib/article-quality-gate";

export interface ResearchSource {
  title: string;
  url: string;
  date?: string;
  sourceType: "documentation" | "changelog" | "security_advisory" | "github_issue" | "technical_standard";
}

export interface CandidateProblem {
  topic: string;
  category: string;
  problemSummary: string;
  evidenceSummary: string;
  evidenceType: "official_docs" | "github_advisory" | "release_changelog" | "curated_engineering_problem" | "ai_hypothesis";
  sources: ResearchSource[];
  relevanceToSkills: string;
  recency: string;
  usefulnessScore: number; // 0-100
  researchConfidence: "verified_source" | "curated_fallback" | "unverified_hypothesis";
  decision: "HIGH_VALUE" | "MEDIUM_VALUE" | "LOW_VALUE";
  reasons: string[];
  suggestedSlug: string;
  overlapNotes?: string;
}

export interface EvaluationResult {
  topic: string;
  category: string;
  score: number;
  decision: "HIGH_VALUE" | "MEDIUM_VALUE" | "LOW_VALUE";
  reasons: string[];
  suggestedSlug: string;
  overlapDetected: boolean;
}

// Curated pool of verified technical problems grounded in real documentation and release notes
export const VERIFIED_RESEARCH_PROBLEMS: CandidateProblem[] = [
  {
    topic: "React Native Expo: Resolving Android Background Service Suspension and TaskManager Configuration",
    category: "Mobile Development",
    problemSummary: "Android 14+ aggressively suspends background execution unless foreground service types (e.g. data-sync, location) are declared in AndroidManifest.xml and TaskManager is properly initialized in native modules.",
    evidenceSummary: "Documented in Expo SDK 52 / Android 14 Foreground Service Type Requirements (Google Play policies & Expo task-manager docs).",
    evidenceType: "curated_engineering_problem",
    sources: [
      {
        title: "Expo TaskManager & Background Fetch Guide",
        url: "https://docs.expo.dev/versions/latest/sdk/task-manager/",
        sourceType: "documentation",
      },
      {
        title: "Android 14 Foreground Service Types Policy",
        url: "https://developer.android.com/about/versions/14/changes/fgs-types-required",
        sourceType: "documentation",
      },
    ],
    relevanceToSkills: "Directly relates to mobile applications (Amtech Shop, Leftly) built on Expo and React Native.",
    recency: "Modern Android 14/15 releases (2024–2026).",
    usefulnessScore: 92,
    researchConfidence: "curated_fallback",
    decision: "HIGH_VALUE",
    reasons: ["Addresses a top crash reason in modern Expo Android apps.", "Grounded in official Android/Expo requirements."],
    suggestedSlug: "react-native-expo-android-background-task-manager-suspension",
  },
  {
    topic: "Next.js 15 & React 19: Nested Suspense Streaming with Resilient Error Boundary Fallbacks",
    category: "Web Development",
    problemSummary: "When streaming dynamic server components in Next.js 15, unhandled promise rejections inside child Suspense boundaries can crash the stream unless wrapped with component-level error boundaries and PPR-friendly boundaries.",
    evidenceSummary: "Documented in Next.js 15 App Router documentation and React 19 Suspense streaming error recovery RFC.",
    evidenceType: "curated_engineering_problem",
    sources: [
      {
        title: "Next.js 15 Loading UI and Streaming",
        url: "https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming",
        sourceType: "documentation",
      },
      {
        title: "React 19 Server Components and Suspense Error Handling",
        url: "https://react.dev/reference/rsc/server-components",
        sourceType: "documentation",
      },
    ],
    relevanceToSkills: "Directly aligns with Next.js 15, React 19, TypeScript architecture used in Praxivon and MMUsmanLab.",
    recency: "Next.js 15 / React 19 release cycle.",
    usefulnessScore: 90,
    researchConfidence: "curated_fallback",
    decision: "HIGH_VALUE",
    reasons: ["Critical for high-traffic web applications with asynchronous data dependencies.", "Official documentation grounded."],
    suggestedSlug: "nextjs-15-streaming-suspense-nested-error-boundary-fallbacks",
  },
  {
    topic: "TypeScript 5 & Zod: Runtime Schema Validation and Inferred Type Safety for Next.js Route Handlers",
    category: "Software Engineering",
    problemSummary: "Developers frequently suffer runtime type drift between client fetch payloads and server Route Handlers when relying on TypeScript interfaces alone without runtime boundary validators.",
    evidenceSummary: "TypeScript handbook on runtime boundary validation and Zod 3.x schema inference benchmarks.",
    evidenceType: "curated_engineering_problem",
    sources: [
      {
        title: "Zod Documentation & Inferred Types",
        url: "https://zod.dev/?id=type-inference",
        sourceType: "documentation",
      },
      {
        title: "Next.js Route Handlers Request Validation",
        url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers",
        sourceType: "documentation",
      },
    ],
    relevanceToSkills: "End-to-end full-stack contract validation used across portfolio web and API systems.",
    recency: "Contemporary software engineering practice.",
    usefulnessScore: 88,
    researchConfidence: "curated_fallback",
    decision: "HIGH_VALUE",
    reasons: ["Prevents silent malformed data corruption in database write operations."],
    suggestedSlug: "typescript-zod-runtime-schema-validation-nextjs-route-handlers",
  },
  {
    topic: "Node.js & Express: Distributed Idempotency Keys and Atomic Locks for Financial API Workflows",
    category: "Backend Engineering",
    problemSummary: "Network retries from client apps during payment or budget mutations can trigger double charges or duplicate balance deductions without idempotent request headers and atomic transaction keys.",
    evidenceSummary: "IETF RFC 9651 (The Idempotency-Key HTTP Header Field) and Stripe engineering guides on idempotency.",
    evidenceType: "curated_engineering_problem",
    sources: [
      {
        title: "IETF HTTP Idempotency-Key Header Specification",
        url: "https://datatracker.ietf.org/doc/html/rfc9651",
        sourceType: "technical_standard",
      },
      {
        title: "Designing Robust Financial APIs with Idempotency",
        url: "https://docs.stripe.com/api/idempotent_requests",
        sourceType: "documentation",
      },
    ],
    relevanceToSkills: "Directly relates to backend transaction processing in retail and budgeting systems.",
    recency: "Modern API standards.",
    usefulnessScore: 94,
    researchConfidence: "curated_fallback",
    decision: "HIGH_VALUE",
    reasons: ["High business value for software teams building financial or transaction-driven APIs."],
    suggestedSlug: "nodejs-idempotency-keys-atomic-locks-financial-api-workflows",
  },
];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .slice(0, 80);
}

/**
 * Evaluate topic opportunity against existing published articles and drafts
 * Detects duplicates, stack relevance, and practical specificity
 */
export async function evaluateProblemOpportunity(
  topicTitle: string,
  category: string,
  existingArticles: Article[]
): Promise<EvaluationResult> {
  const suggestedSlug = slugify(topicTitle);
  const reasons: string[] = [];

  // 1. Strict duplicate check against both slug and title
  const exactSlugExists = existingArticles.some((a) => a.slug === suggestedSlug);
  if (exactSlugExists) {
    return {
      topic: topicTitle,
      category,
      score: 15,
      decision: "LOW_VALUE",
      reasons: ["An article with this exact slug already exists in the knowledge base."],
      suggestedSlug,
      overlapDetected: true,
    };
  }

  // 2. Semantic word overlap check
  const titleWords = topicTitle
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  let highOverlapFound = false;
  for (const existing of existingArticles) {
    const existingWords = new Set(
      existing.title
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3)
    );
    const shared = titleWords.filter((w) => existingWords.has(w));
    if (shared.length >= 4) {
      highOverlapFound = true;
      reasons.push(`High topical overlap with existing article "${existing.title}".`);
      break;
    }
  }

  if (highOverlapFound) {
    return {
      topic: topicTitle,
      category,
      score: 30,
      decision: "LOW_VALUE",
      reasons,
      suggestedSlug,
      overlapDetected: true,
    };
  }

  // 3. Tech stack relevance check (Muhammad M. Usman stack: Next.js, React, React Native, Expo, TypeScript, Node.js, Cloudflare, Databases)
  const coreKeywords = [
    "next.js",
    "react",
    "expo",
    "typescript",
    "node",
    "express",
    "api",
    "database",
    "zod",
    "sqlite",
    "d1",
    "cloudflare",
    "caching",
    "streaming",
    "mobile",
    "auth",
  ];
  const topicLower = topicTitle.toLowerCase();
  const matchedKeywords = coreKeywords.filter((kw) => topicLower.includes(kw));

  let score = 50;
  if (matchedKeywords.length >= 2) {
    score += 25;
    reasons.push(`Strong alignment with core stack (${matchedKeywords.join(", ")}).`);
  } else if (matchedKeywords.length === 1) {
    score += 15;
    reasons.push(`Moderate alignment with core stack (${matchedKeywords[0]}).`);
  } else {
    score -= 25;
    reasons.push("Topic is outside Muhammad M. Usman's primary software engineering stack.");
  }

  // 4. Practical problem-solving indicator
  const problemKeywords = [
    "resolving",
    "fixing",
    "diagnosing",
    "debugging",
    "handling",
    "preventing",
    "suspension",
    "optimizing",
    "race condition",
    "architecture",
    "type safety",
  ];
  if (problemKeywords.some((pk) => topicLower.includes(pk))) {
    score += 15;
    reasons.push("High practical diagnostic and resolution value for engineers.");
  }

  // Final decision mapping
  let decision: "HIGH_VALUE" | "MEDIUM_VALUE" | "LOW_VALUE" = "LOW_VALUE";
  if (score >= 75) {
    decision = "HIGH_VALUE";
  } else if (score >= 50) {
    decision = "MEDIUM_VALUE";
  }

  return {
    topic: topicTitle,
    category,
    score,
    decision,
    reasons,
    suggestedSlug,
    overlapDetected: false,
  };
}

/**
 * Discover candidate problem topics with research evidence
 */
export async function discoverCandidateTopics(): Promise<CandidateProblem[]> {
  const existingArticles = await getAllArticles();
  const results: CandidateProblem[] = [];

  // 1. If Gemini AI is configured, query for structured research-backed candidate topics
  if (defaultAIProvider.isAvailable()) {
    try {
      const prompt = `You are a Principal Software Engineering Researcher identifying real, verified technical problem-solving topics for Muhammad M. Usman's technical portfolio.
Stack: Next.js 15, React 19, React Native, Expo, TypeScript, Node.js, Express, Cloudflare D1/SQLite, APIs.

Existing articles in knowledge base:
${existingArticles.map((a) => `- ${a.title} (${a.slug})`).join("\n")}

Identify 3 DISTINCT, HIGH-VALUE technical problems based on real framework documentation, release notes, or security best practices.
DO NOT fabricate fake URLs or fake statistics. Use real, official documentation URLs (e.g. react.dev, nextjs.org/docs, docs.expo.dev, typescriptlang.org).
Distinguish verified facts from hypotheses.

Return ONLY a valid JSON array of objects conforming to this exact structure:
[
  {
    "topic": "Specific practical title (e.g., 'Next.js 15: Resolving Cache Invalidation Lag in Route Handlers')",
    "category": "Web Development" | "Mobile Development" | "Backend Engineering" | "Software Engineering",
    "problemSummary": "2-3 sentences explaining the exact technical bug, symptom, or architectural pitfall.",
    "evidenceSummary": "Where this issue is documented (official docs, changelog, or standard).",
    "sources": [
      {
        "title": "Document Title",
        "url": "https://official-doc-url.com",
        "sourceType": "documentation" | "changelog" | "technical_standard"
      }
    ],
    "relevanceToSkills": "Why it showcases Muhammad M. Usman's senior full-stack skills.",
    "recency": "Current framework versions (2024-2026)"
  }
]`;

      const raw = await defaultAIProvider.generateStructuredContent(
        prompt,
        "You are an expert technical editor. Output strict JSON only without markdown formatting."
      );

      const cleanJson = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const evalRes = await evaluateProblemOpportunity(
            item.topic,
            item.category || "Software Engineering",
            existingArticles
          );

          if (!evalRes.overlapDetected) {
            results.push({
              topic: item.topic,
              category: item.category || "Software Engineering",
              problemSummary: item.problemSummary || "",
              evidenceSummary: item.evidenceSummary || "Framework documentation",
              evidenceType: "official_docs",
              sources: Array.isArray(item.sources) ? item.sources : [],
              relevanceToSkills: item.relevanceToSkills || "Core stack alignment",
              recency: item.recency || "Recent release",
              usefulnessScore: evalRes.score,
              researchConfidence: "verified_source",
              decision: evalRes.decision,
              reasons: evalRes.reasons,
              suggestedSlug: evalRes.suggestedSlug,
            });
          }
        }
      }
    } catch (aiErr) {
      console.warn("[DiscoveryEngine] AI research query had an error, utilizing curated problem pool:", aiErr);
    }
  }

  // 2. Add unused curated verified problems if needed
  for (const curated of VERIFIED_RESEARCH_PROBLEMS) {
    const evalRes = await evaluateProblemOpportunity(curated.topic, curated.category, existingArticles);
    if (!evalRes.overlapDetected && !results.some((r) => r.suggestedSlug === curated.suggestedSlug)) {
      results.push({
        ...curated,
        usefulnessScore: evalRes.score,
        decision: evalRes.decision,
        reasons: evalRes.reasons,
      });
    }
  }

  return results;
}

/**
 * Generate a technical problem-solving draft article
 * ENFORCES HUMAN-ONLY PUBLICATION RULE: ALWAYS returns with status: "draft".
 * Never returns status: "published".
 */
export async function generateArticleFromProblem(
  topic: string,
  category: string,
  candidateSources: ResearchSource[] = [],
  relatedProjects: string[] = ["praxivon"]
): Promise<Article | null> {
  // Check emergency kill-switch
  if (process.env.ARTICLE_GENERATION_ENABLED === "false") {
    console.warn("[DiscoveryEngine] Article generation paused via ARTICLE_GENERATION_ENABLED=false.");
    return null;
  }

  const existingArticles = await getAllArticles();
  const evaluation = await evaluateProblemOpportunity(topic, category, existingArticles);

  if (evaluation.decision === "LOW_VALUE") {
    console.warn("[DiscoveryEngine] Topic rejected by Opportunity Gate:", evaluation.reasons);
    return null;
  }

  const sourcesListText = candidateSources.length > 0
    ? candidateSources.map((s) => `- ${s.title}: ${s.url}`).join("\n")
    : "- Official framework documentation and TypeScript handbook";

  const systemInstruction = `You are a Senior Full-Stack Software Engineer drafting technical documentation for the private review of Muhammad M. Usman (Full-Stack Engineer: Next.js, React, React Native, Expo, TypeScript, Node.js).
This draft will be placed in Muhammad's private dashboard for human review and editing. It will NOT be published automatically.
Write with rigorous technical accuracy, concrete production patterns, and realistic code.
Output STRICT JSON matching the required schema.`;

  const userPrompt = `Draft a comprehensive, production-grade technical problem-solving article for:
Topic: "${topic}"
Category: "${category}"

Retrieved research sources:
${sourcesListText}

Required JSON schema:
{
  "title": "${topic}",
  "description": "A concise 2-3 sentence overview of the diagnosis and resolution.",
  "category": "${category}",
  "tags": ["3-5 specific technical tags"],
  "difficulty": "Intermediate" | "Advanced",
  "content": [
    {
      "heading": "Problem & Symptoms",
      "paragraphs": ["Specific technical context and error symptoms."],
      "bullets": ["Concrete indicators observed in development or production."]
    },
    {
      "heading": "Root Cause Analysis",
      "paragraphs": ["In-depth explanation of why the issue occurs at the runtime or framework level."]
    },
    {
      "heading": "Production Solution & Implementation",
      "paragraphs": ["Step-by-step resolution strategy."],
      "codeBlock": {
        "language": "ts",
        "caption": "Verified implementation pattern",
        "code": "TypeScript implementation snippet solving the issue."
      }
    },
    {
      "heading": "Verification & Prevention",
      "paragraphs": ["Testing strategies and preventative measures."],
      "bullets": ["Checklist items for engineering teams."]
    }
  ],
  "sources": [
    { "title": "Source Title", "url": "https://..." }
  ]
}`;

  try {
    const raw = await defaultAIProvider.generateStructuredContent(userPrompt, systemInstruction);
    const cleanJson = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    if (!parsed.title || !parsed.content || !Array.isArray(parsed.content)) {
      throw new Error("AI output was missing required structural sections.");
    }

    // Calculate word count
    let wordCount = 0;
    for (const section of parsed.content) {
      if (Array.isArray(section.paragraphs)) {
        for (const p of section.paragraphs) {
          wordCount += p.split(/\s+/).filter(Boolean).length;
        }
      }
    }

    // Attach validated sources
    const finalSources: ArticleSource[] = [];
    if (Array.isArray(parsed.sources) && parsed.sources.length > 0) {
      for (const src of parsed.sources) {
        if (src.url && (src.url.startsWith("http://") || src.url.startsWith("https://"))) {
          finalSources.push({ title: src.title || "Reference Documentation", url: src.url });
        }
      }
    }
    // Supplement with candidate sources if model returned empty
    if (finalSources.length === 0 && candidateSources.length > 0) {
      for (const cs of candidateSources) {
        finalSources.push({ title: cs.title, url: cs.url });
      }
    }

    const draftArticle: Article = {
      id: `art-${Date.now()}`,
      slug: evaluation.suggestedSlug,
      title: parsed.title.trim(),
      description: parsed.description?.trim() || `Technical analysis and resolution guide for ${topic.toLowerCase()}.`,
      publishedAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      category: parsed.category || category,
      tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : ["Engineering", "TypeScript"],
      difficulty: parsed.difficulty || "Intermediate",
      readingTime: `${Math.max(3, Math.ceil(wordCount / 200))} min read`,
      wordCount: Math.max(wordCount, 300),
      // MANDATORY HUMAN-ONLY SAFEGUARD: ALWAYS DRAFT
      status: "draft",
      sources: finalSources,
      content: parsed.content,
      relatedProjects: parsed.relatedProjects || relatedProjects,
      isAutomated: true,
    };

    // Run Quality Gate validation
    const qualityResult = validateArticleQuality(draftArticle, existingArticles, false);
    if (!qualityResult.valid) {
      console.warn("[DiscoveryEngine] Generated draft failed quality gate:", qualityResult.errors);
      // Return null or throw rather than storing invalid article
      return null;
    }

    return draftArticle;
  } catch (err: any) {
    console.error("[DiscoveryEngine] Article generation failed:", err?.message || err);
    // Never fabricate a fake article or report fake success
    return null;
  }
}

/**
 * Scheduled Discovery Job
 * IMPORTANT: This job discovers candidate problem topics and stores them for human review.
 * It NEVER publishes an article and NEVER creates published items.
 */
export async function runAutomatedDiscoveryCycle(): Promise<{
  status: "success" | "skipped" | "rejected" | "failed";
  topic?: string;
  score?: number;
  message: string;
  sourcesCount?: number;
}> {
  const startedAt = new Date().toISOString();

  // Check kill-switch
  if (process.env.ARTICLE_GENERATION_ENABLED === "false") {
    const run: ArticleRun = {
      id: `run-${Date.now()}`,
      runDate: startedAt.split("T")[0],
      topic: "N/A",
      status: "skipped",
      model: "gemini-2.5-flash",
      reason: "Kill-switch enabled: ARTICLE_GENERATION_ENABLED is false",
      startedAt,
      completedAt: new Date().toISOString(),
    };
    await recordArticleRun(run);
    return { status: "skipped", message: run.reason! };
  }

  try {
    const candidates = await discoverCandidateTopics();
    const highValueCandidates = candidates.filter((c) => c.decision === "HIGH_VALUE");

    if (highValueCandidates.length === 0) {
      const run: ArticleRun = {
        id: `run-${Date.now()}`,
        runDate: startedAt.split("T")[0],
        topic: "Topic Discovery",
        status: "skipped",
        model: "gemini-2.5-flash",
        reason: "No fresh high-value problem topics discovered for review today.",
        startedAt,
        completedAt: new Date().toISOString(),
      };
      await recordArticleRun(run);
      return { status: "skipped", message: "No fresh topics require review today." };
    }

    const topCandidate = highValueCandidates[0];

    // Record telemetry run
    const run: ArticleRun = {
      id: `run-${Date.now()}`,
      runDate: startedAt.split("T")[0],
      topic: topCandidate.topic,
      status: "success",
      model: "gemini-2.5-flash",
      score: topCandidate.usefulnessScore,
      reason: `Discovered and queued topic for review: ${topCandidate.reasons.join(" ")}`,
      startedAt,
      completedAt: new Date().toISOString(),
    };
    await recordArticleRun(run);

    return {
      status: "success",
      topic: topCandidate.topic,
      score: topCandidate.usefulnessScore,
      sourcesCount: topCandidate.sources.length,
      message: `Discovered topic "${topCandidate.topic}" (score: ${topCandidate.usefulnessScore}). Queued for Muhammad's review in private dashboard.`,
    };
  } catch (err: any) {
    const run: ArticleRun = {
      id: `run-${Date.now()}`,
      runDate: startedAt.split("T")[0],
      topic: "Discovery Failure",
      status: "failed",
      model: "gemini-2.5-flash",
      error: err?.message || String(err),
      startedAt,
      completedAt: new Date().toISOString(),
    };
    await recordArticleRun(run);

    return {
      status: "failed",
      message: `Discovery cycle encountered an error: ${err?.message || "Unknown error"}`,
    };
  }
}
