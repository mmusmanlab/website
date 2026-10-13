import { NextRequest, NextResponse } from "next/server";
import { isDashboardAuthorized } from "@/lib/dashboard-auth";
import {
  evaluateProblemOpportunity,
  generateArticleFromProblem,
  VERIFIED_ENGINEERING_PROBLEMS,
} from "@/lib/ai/discovery-engine";
import { getAllArticles, saveArticle, deleteArticle, addSuggestedTopic, Article } from "@/lib/articles-store";
import { defaultAIProvider } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, topic, category, relatedProjects, articleData } = await request.json();

    const existingArticles = await getAllArticles();

    // 1. ACTION: DISCOVER CANDIDATE TOPICS
    if (action === "discover") {
      let suggestions: Array<{ topic: string; category: string; score: number; decision: string; reasons: string[] }> = [];

      // Check if Gemini is available to brainstorm fresh topics, otherwise use verified pool
      if (process.env.GEMINI_API_KEY) {
        try {
          const prompt = `Suggest 3 specific, emerging technical problem-solving article topics for a Full-Stack Software Engineer specializing in Next.js 15, React 19, React Native, Expo, TypeScript, Node.js, and APIs.
Focus on real bugs, deployment traps, performance bottlenecks, or architectural migrations.
Existing articles are: ${existingArticles.map((a) => a.title).join("; ")}

Return ONLY a JSON array of objects with:
[
  { "topic": "string", "category": "Mobile Development" or "Web Development" or "Software Engineering" or "Backend Engineering" }
]`;
          const raw = await defaultAIProvider.generateStructuredContent(prompt);
          const clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(clean);

          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              const evalRes = await evaluateProblemOpportunity(item.topic, item.category || "Software Engineering", existingArticles);
              suggestions.push({
                topic: item.topic,
                category: item.category || "Software Engineering",
                score: evalRes.score,
                decision: evalRes.decision,
                reasons: evalRes.reasons,
              });
            }
          }
        } catch (aiErr) {
          console.warn("[AI Suggest] Falling back to verified problem pool:", aiErr);
        }
      }

      // If suggestions empty, populate from verified engineering problem pool
      if (suggestions.length === 0) {
        for (const p of VERIFIED_ENGINEERING_PROBLEMS) {
          const evalRes = await evaluateProblemOpportunity(p.topic, p.category, existingArticles);
          if (!existingArticles.some((a) => a.title.toLowerCase().includes(p.topic.toLowerCase().slice(0, 20)))) {
            suggestions.push({
              topic: p.topic,
              category: p.category,
              score: evalRes.score,
              decision: evalRes.decision,
              reasons: evalRes.reasons,
            });
          }
        }
      }

      return NextResponse.json({ success: true, suggestions });
    }

    // 2. ACTION: EVALUATE SINGLE TOPIC
    if (action === "evaluate") {
      if (!topic) {
        return NextResponse.json({ error: "Topic is required" }, { status: 400 });
      }
      const evalRes = await evaluateProblemOpportunity(topic, category || "Software Engineering", existingArticles);
      return NextResponse.json({ success: true, evaluation: evalRes });
    }

    // 3. ACTION: GENERATE DRAFT FOR APPROVAL
    if (action === "generate-draft") {
      if (!topic) {
        return NextResponse.json({ error: "Topic is required" }, { status: 400 });
      }

      const generated = await generateArticleFromProblem(
        topic,
        category || "Software Engineering",
        Array.isArray(relatedProjects) && relatedProjects.length > 0 ? relatedProjects : ["praxivon"]
      );

      if (!generated) {
        return NextResponse.json({ error: "Generation could not proceed (topic rejected by quality gate or kill-switch active)." }, { status: 422 });
      }

      // Set status strictly to 'draft' so it requires approval and adjustments!
      generated.status = "draft";
      await saveArticle(generated);

      return NextResponse.json({
        success: true,
        message: "Draft generated successfully. Ready for approval or adjustments.",
        draft: generated,
      });
    }

    // 4. ACTION: APPROVE AND PUBLISH DRAFT (with any adjustments)
    if (action === "approve") {
      if (!articleData || !articleData.slug) {
        return NextResponse.json({ error: "Article data with slug is required for approval." }, { status: 400 });
      }

      const approvedArticle: Article = {
        ...articleData,
        status: "published",
        updatedAt: new Date().toISOString().split("T")[0],
      };

      await saveArticle(approvedArticle);

      return NextResponse.json({
        success: true,
        message: `Article '${approvedArticle.title}' approved and published live!`,
        article: approvedArticle,
      });
    }

    // 5. ACTION: REJECT DRAFT
    if (action === "reject") {
      if (!articleData?.slug) {
        return NextResponse.json({ error: "Article slug is required." }, { status: 400 });
      }

      await deleteArticle(articleData.slug);
      return NextResponse.json({
        success: true,
        message: "Draft rejected and removed from queue.",
      });
    }

    return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });
  } catch (error) {
    console.error("[DashboardAI] Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI operation failed." }, { status: 500 });
  }
}
