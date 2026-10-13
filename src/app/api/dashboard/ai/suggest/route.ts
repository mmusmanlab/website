import { NextRequest, NextResponse } from "next/server";
import { isDashboardAuthorized, validateSameOrigin } from "@/lib/dashboard-auth";
import {
  evaluateProblemOpportunity,
  generateArticleFromProblem,
  discoverCandidateTopics,
  CandidateProblem,
} from "@/lib/ai/discovery-engine";
import {
  getAllArticles,
  getDashboardArticleBySlug,
  saveArticle,
  approveAndPublishDraft,
  rejectDraft,
  Article,
} from "@/lib/articles-store";
import { validateArticleQuality } from "@/lib/article-quality-gate";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized access to AI discovery operations." }, { status: 401 });
  }

  if (!validateSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin (CSRF protection)." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, topic, category, candidateSources, relatedProjects, slug, articleData, reason } = body;

    const existingArticles = await getAllArticles();

    // 1. ACTION: DISCOVER CANDIDATE TOPICS (WITH RESEARCH EVIDENCE)
    if (action === "discover") {
      const candidates = await discoverCandidateTopics();
      return NextResponse.json({
        success: true,
        count: candidates.length,
        suggestions: candidates,
      });
    }

    // 2. ACTION: EVALUATE SINGLE TOPIC
    if (action === "evaluate") {
      if (!topic) {
        return NextResponse.json({ error: "Topic is required for evaluation." }, { status: 400 });
      }
      const evalRes = await evaluateProblemOpportunity(
        topic,
        category || "Software Engineering",
        existingArticles
      );
      return NextResponse.json({ success: true, evaluation: evalRes });
    }

    // 3. ACTION: GENERATE DRAFT (STRICTLY SAVED AS 'draft')
    if (action === "generate-draft") {
      if (!topic) {
        return NextResponse.json({ error: "Topic is required to generate a draft." }, { status: 400 });
      }

      const generatedDraft = await generateArticleFromProblem(
        topic,
        category || "Software Engineering",
        Array.isArray(candidateSources) ? candidateSources : [],
        Array.isArray(relatedProjects) && relatedProjects.length > 0 ? relatedProjects : ["praxivon"]
      );

      if (!generatedDraft) {
        return NextResponse.json(
          {
            error: "Draft generation could not proceed (topic rejected by quality gate, kill-switch active, or provider unavailable).",
          },
          { status: 422 }
        );
      }

      // Mandatory check: Must be a draft
      generatedDraft.status = "draft";
      await saveArticle(generatedDraft);

      return NextResponse.json({
        success: true,
        message: "Draft generated and placed in private dashboard for review.",
        draft: generatedDraft,
      });
    }

    // 4. ACTION: EDIT DRAFT (Saves draft adjustments while keeping status = "draft")
    if (action === "edit-draft") {
      const targetSlug = slug || articleData?.slug;
      if (!targetSlug) {
        return NextResponse.json({ error: "Draft slug is required to edit." }, { status: 400 });
      }

      const existingDraft = await getDashboardArticleBySlug(targetSlug);
      if (!existingDraft) {
        return NextResponse.json({ error: "Draft not found." }, { status: 404 });
      }

      if (existingDraft.status === "published") {
        return NextResponse.json({ error: "Use standard article editor to update published articles." }, { status: 400 });
      }

      const updatedDraft: Article = {
        ...existingDraft,
        ...articleData,
        slug: existingDraft.slug, // Prevent changing slug of existing draft unexpectedly
        status: "draft", // Strict safeguard: draft edits cannot secretly publish
        updatedAt: new Date().toISOString().split("T")[0],
      };

      await saveArticle(updatedDraft);

      return NextResponse.json({
        success: true,
        message: "Draft updated successfully in review queue.",
        draft: updatedDraft,
      });
    }

    // 5. ACTION: APPROVE AND PUBLISH DRAFT (EXPLICIT HUMAN ACTION)
    if (action === "approve") {
      const targetSlug = slug || articleData?.slug;
      if (!targetSlug) {
        return NextResponse.json({ error: "Article slug is required for approval." }, { status: 400 });
      }

      const approvalResult = await approveAndPublishDraft(
        targetSlug,
        articleData,
        "dashboard-owner"
      );

      if (!approvalResult.success) {
        return NextResponse.json(
          { error: approvalResult.error || "Approval failed." },
          { status: 422 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Article '${approvalResult.article!.title}' successfully approved and published!`,
        article: approvalResult.article,
      });
    }

    // 6. ACTION: REJECT DRAFT
    if (action === "reject") {
      const targetSlug = slug || articleData?.slug;
      if (!targetSlug) {
        return NextResponse.json({ error: "Draft slug is required to reject." }, { status: 400 });
      }

      const success = await rejectDraft(targetSlug, reason || "Rejected by owner in dashboard", "dashboard-owner");
      if (!success) {
        return NextResponse.json({ error: "Draft not found or could not be rejected." }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Draft "${targetSlug}" was rejected and removed from review queue.`,
      });
    }

    return NextResponse.json({ error: `Unknown action: "${action}".` }, { status: 400 });
  } catch (error: any) {
    console.error("[DashboardAI Route] Error:", error);
    return NextResponse.json(
      { error: error?.message || "AI discovery operation failed." },
      { status: 500 }
    );
  }
}
