import { z } from "zod";
import { Article, ArticleSection, ArticleSource } from "./articles-store";

export const ALLOWED_CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Backend Engineering",
  "Software Engineering",
  "DevOps & Infrastructure",
] as const;

export const ArticleSourceSchema = z.object({
  title: z.string().min(2, "Source title too short").max(200),
  url: z.string().url("Source must be a valid HTTP/HTTPS URL").refine(
    (url) => url.startsWith("https://") || url.startsWith("http://"),
    "Source URL must use http or https protocol"
  ),
});

export const ArticleCodeBlockSchema = z.object({
  language: z.string().min(1, "Language must be specified").max(30),
  code: z.string().min(10, "Code snippet must contain meaningful code"),
  caption: z.string().max(200).optional(),
});

export const ArticleSectionSchema = z.object({
  heading: z.string().min(3, "Section heading too short").max(200),
  paragraphs: z.array(z.string().min(10, "Paragraph too short")).min(1, "Section must have at least one paragraph"),
  bullets: z.array(z.string().min(5)).optional(),
  codeBlock: ArticleCodeBlockSchema.optional(),
});

export const ArticleSchema = z.object({
  id: z.string().min(1),
  slug: z
    .string()
    .min(5, "Slug too short")
    .max(100, "Slug too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must only contain lowercase alphanumeric characters and single hyphens"),
  title: z.string().min(15, "Title must be at least 15 characters").max(200, "Title must not exceed 200 characters"),
  description: z.string().min(30, "Description must be at least 30 characters").max(350, "Description must not exceed 350 characters"),
  category: z.string().min(3),
  tags: z.array(z.string().min(2)).min(2, "At least 2 tags are required"),
  content: z.array(ArticleSectionSchema).min(3, "Article must contain at least 3 structured sections"),
  relatedProjects: z.array(z.string()),
  sources: z.array(ArticleSourceSchema).optional(),
  status: z.enum(["draft", "published"]),
  wordCount: z.number().min(200, "Content must have at least 200 words"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  readingTime: z.string().optional(),
  isAutomated: z.boolean().optional(),
});

export interface QualityGateResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    sectionCount: number;
    wordCount: number;
    sourcesCount: number;
    hasCodeBlock: boolean;
  };
}

/**
 * Validate an article against quality and integrity standards
 */
export function validateArticleQuality(
  article: Partial<Article>,
  existingArticles: Article[] = [],
  isPublishing = false
): QualityGateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Schema parsing check
  const parseResult = ArticleSchema.safeParse(article);
  if (!parseResult.success) {
    for (const issue of parseResult.error.issues) {
      errors.push(`${issue.path.join(".")}: ${issue.message}`);
    }
  }

  // Duplicate checks
  if (article.slug) {
    const slugExists = existingArticles.some(
      (a) => a.slug === article.slug && a.id !== article.id
    );
    if (slugExists) {
      errors.push(`An article with slug "${article.slug}" already exists.`);
    }
  }

  if (article.title) {
    const titleLower = article.title.toLowerCase().trim();
    const duplicateTitle = existingArticles.find(
      (a) => a.title.toLowerCase().trim() === titleLower && a.id !== article.id
    );
    if (duplicateTitle) {
      errors.push(`An article with identical title "${article.title}" already exists.`);
    }
  }

  // Content quality validation
  const sections = article.content || [];
  let totalWords = 0;
  let codeBlockCount = 0;

  for (const [idx, section] of sections.entries()) {
    if (!section.heading || !section.heading.trim()) {
      errors.push(`Section ${idx + 1} has an empty heading.`);
    }
    if (!section.paragraphs || section.paragraphs.length === 0) {
      errors.push(`Section ${idx + 1} ("${section.heading || "Untitled"}") has no paragraphs.`);
    } else {
      for (const p of section.paragraphs) {
        totalWords += p.split(/\s+/).filter(Boolean).length;
      }
    }
    if (section.codeBlock) {
      codeBlockCount++;
      if (!section.codeBlock.code.trim()) {
        errors.push(`Section ${idx + 1} code block is empty.`);
      }
    }
  }

  if (sections.length < 3) {
    errors.push("Article must have at least 3 distinct sections (e.g., Problem, Root Cause, Solution).");
  }

  if (totalWords < 250) {
    errors.push(`Article content is too brief (${totalWords} words). A comprehensive technical article requires substantial substance.`);
  }

  // Sources validation
  const sources = article.sources || [];
  if (sources.length === 0) {
    warnings.push("No reference sources or documentation citations are attached to this article.");
  } else {
    for (const [idx, src] of sources.entries()) {
      if (!src.url || (!src.url.startsWith("http://") && !src.url.startsWith("https://"))) {
        errors.push(`Source ${idx + 1} ("${src.title || "Untitled"}") has an invalid URL.`);
      }
    }
  }

  // Publication gate
  if (isPublishing) {
    if (article.status !== "published") {
      warnings.push("Article status is being upgraded from draft to published.");
    }
    if (codeBlockCount === 0 && article.category !== "DevOps & Infrastructure") {
      warnings.push("Practical software engineering article has no code snippets. Consider adding implementation examples.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      sectionCount: sections.length,
      wordCount: totalWords,
      sourcesCount: sources.length,
      hasCodeBlock: codeBlockCount > 0,
    },
  };
}
