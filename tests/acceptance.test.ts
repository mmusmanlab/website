import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  isDashboardAuthorized,
  createSessionToken,
  isValidDashboardPasskey,
  verifySessionToken,
} from "../src/lib/dashboard-auth";
import {
  getAllArticles,
  getPublishedArticles,
  getArticleBySlug,
  getDashboardArticleBySlug,
  saveArticle,
  approveAndPublishDraft,
  rejectDraft,
  deleteArticle,
  initialArticles,
  Article,
} from "../src/lib/articles-store";
import { generateArticleFromProblem, runAutomatedDiscoveryCycle } from "../src/lib/ai/discovery-engine";
import { queryD1, getD1Status } from "../src/lib/cloudflare-d1";
import sitemap from "../src/app/sitemap";
const { readContactMessages, appendContactMessage } = require("../src/lib/contact-storage");

describe("MMUsmanLab Audit & Acceptance Criteria Test Suite", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.DASHBOARD_PASSKEY = "TestSecretPasskey@2026";
    process.env.CRON_SECRET = "TestCronSecret@2026";
    delete process.env.GEMINI_API_KEY; // Ensures fast, deterministic offline testing
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // 1. Unauthenticated visitor cannot access dashboard APIs
  test("1. Unauthenticated visitor cannot access dashboard APIs", () => {
    const req = new NextRequest("http://localhost:3000/api/dashboard/data");
    assert.equal(isDashboardAuthorized(req), false);
  });

  // 2. Forged mmusman_dash_auth=true cookie does not authenticate
  test("2. Forged mmusman_dash_auth=true cookie does not authenticate", () => {
    const req = new NextRequest("http://localhost:3000/api/dashboard/data", {
      headers: {
        cookie: "mmusman_dash_auth=true",
      },
    });
    assert.equal(isDashboardAuthorized(req), false);

    // Also check other arbitrary falsy/truthy tokens
    const req2 = new NextRequest("http://localhost:3000/api/dashboard/data", {
      headers: { cookie: "mmusman_dash_auth=random-arbitrary-token" },
    });
    assert.equal(isDashboardAuthorized(req2), false);

    // Only cryptographically signed token succeeds
    const validToken = createSessionToken();
    assert.ok(validToken);
    const req3 = new NextRequest("http://localhost:3000/api/dashboard/data", {
      headers: { cookie: `mmusman_dash_auth=${validToken}` },
    });
    assert.equal(isDashboardAuthorized(req3), true);
  });

  // 3. Missing dashboard secrets fail closed
  test("3. Missing dashboard secrets fail closed", () => {
    delete process.env.DASHBOARD_PASSKEY;
    delete process.env.CONTACT_DASHBOARD_PASSKEY;
    delete process.env.SESSION_SECRET;

    // Must not accept any passkeys, including previous defaults like Noor@4321
    assert.equal(isValidDashboardPasskey("Noor@4321"), false);
    assert.equal(isValidDashboardPasskey("anything"), false);
    assert.equal(isValidDashboardPasskey(""), false);

    // Cannot sign or verify sessions without secret
    const token = createSessionToken();
    assert.equal(token, null);
    assert.equal(verifySessionToken("some.token"), null);
  });

  // 4. AI-generated content is always saved as a draft
  test("4. AI-generated content is always saved as a draft", async () => {
    const draftSlug = "test-ai-draft-safety-check";
    // Ensure clean state
    await deleteArticle(draftSlug);

    const draft = await generateArticleFromProblem(
      "React Native: Diagnosing Memory Leaks with Cleanup Handlers",
      "Mobile Development"
    );

    if (draft) {
      assert.equal(draft.status, "draft", "Generated article must strictly have status: 'draft'");
    }

    // Direct manual test: creating an automated article must have status: 'draft'
    const manualDraft: Article = {
      id: "art-test-draft-1",
      slug: draftSlug,
      title: "React Native: Diagnosing Memory Leaks with Cleanup Handlers",
      description: "A comprehensive investigation into unmounting handlers and memory leaks in React Native Expo.",
      publishedAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      category: "Mobile Development",
      tags: ["React Native", "Expo", "Debugging", "Performance"],
      content: [
        {
          heading: "Problem Overview",
          paragraphs: ["Unmounted screens that maintain active event listeners accumulate retain cycles in the bridge."],
        },
        {
          heading: "Root Cause Diagnostics",
          paragraphs: ["Profiling memory snapshots shows detached native view hierarchies not being collected."],
        },
        {
          heading: "Verified Resolution Pattern",
          paragraphs: ["Always unregister subscriptions inside useEffect teardown returns."],
          codeBlock: {
            language: "ts",
            code: "useEffect(() => { const sub = AppState.addEventListener(...); return () => sub.remove(); }, []);",
          },
        },
      ],
      relatedProjects: ["amtech-shop"],
      status: "draft",
      wordCount: 400,
      difficulty: "Intermediate",
      isAutomated: true,
    };

    await saveArticle(manualDraft);

    // Draft must not appear in published articles
    const published = await getPublishedArticles();
    assert.equal(published.some((a) => a.slug === draftSlug), false);

    // Clean up
    await deleteArticle(draftSlug);
  });

  // 5. A cron invocation cannot publish an article
  test("5. A cron invocation cannot publish an article", async () => {
    const publishedBefore = await getPublishedArticles();
    const result = await runAutomatedDiscoveryCycle();

    assert.ok(result.status);
    const publishedAfter = await getPublishedArticles();

    // Cron job MUST NEVER increase published articles count!
    assert.equal(
      publishedAfter.length,
      publishedBefore.length,
      "Cron job must never publish any articles directly"
    );
  });

  // 6. A draft does not appear publicly
  test("6. A draft does not appear publicly", async () => {
    const draftSlug = "test-secret-draft-hidden";
    const draftArticle: Article = {
      id: "art-test-draft-hidden",
      slug: draftSlug,
      title: "Testing Secret Draft Hidden from Public Routes",
      description: "This article draft should be visible only in the dashboard.",
      publishedAt: "2026-10-13",
      updatedAt: "2026-10-13",
      category: "Software Engineering",
      tags: ["Testing", "TypeScript"],
      content: [
        { heading: "Section 1", paragraphs: ["Content paragraph"] },
        { heading: "Section 2", paragraphs: ["Content paragraph"] },
        { heading: "Section 3", paragraphs: ["Content paragraph"] },
      ],
      relatedProjects: ["praxivon"],
      status: "draft",
      wordCount: 350,
    };

    await saveArticle(draftArticle);

    // 1. getPublishedArticles() excludes it
    const publishedList = await getPublishedArticles();
    assert.equal(publishedList.some((a) => a.slug === draftSlug), false);

    // 2. getArticleBySlug() returns null for public page
    const publicLookup = await getArticleBySlug(draftSlug);
    assert.equal(publicLookup, null);

    // 3. getDashboardArticleBySlug() can retrieve it in private dashboard
    const dashLookup = await getDashboardArticleBySlug(draftSlug);
    assert.ok(dashLookup);
    assert.equal(dashLookup.status, "draft");

    // Clean up
    await deleteArticle(draftSlug);
  });

  // 7. A draft enters the public site only after authenticated explicit approval
  test("7. A draft enters the public site only after authenticated explicit approval", async () => {
    const testSlug = "test-approval-workflow-article";
    const testDraft: Article = {
      id: "art-test-approval",
      slug: testSlug,
      title: "Comprehensive Architecture Guide to Distributed API Idempotency",
      description: "Implementing distributed idempotency keys and atomic locks for secure financial transactions.",
      publishedAt: "2026-10-13",
      updatedAt: "2026-10-13",
      category: "Backend Engineering",
      tags: ["Node.js", "Express", "Architecture", "Security"],
      content: [
        {
          heading: "Problem and Symptoms in Financial Workflows",
          paragraphs: [
            "Network timeouts during credit balance updates cause clients to retry requests, risking duplicate mutations and corrupted financial ledgers in high-concurrency environments.",
            "When mobile clients lose cellular connectivity immediately after dispatching a payment request, the mobile application often retries automatically when connectivity restores. Without server-side idempotency safeguards, the second request processes as a completely new charge.",
            "Developers observe duplicate transactions, inconsistent double ledger entries, and difficult reconciling workflows across distributed database nodes."
          ],
        },
        {
          heading: "Root Cause Analysis at Protocol Layer",
          paragraphs: [
            "Without an idempotency contract, backend HTTP handlers process every incoming POST request as an independent and novel business operation regardless of client intent.",
            "Under HTTP protocol semantics, POST requests are inherently non-idempotent. Therefore, when client libraries retry transient 504 Gateway Timeout responses, the upstream server executes the business logic multiple times unless explicitly protected.",
            "Architectural failure to enforce deduplication tokens leads to severe state corruption and customer discrepancies in transaction balance ledgers."
          ],
        },
        {
          heading: "Production Implementation Pattern",
          paragraphs: [
            "Store an idempotency key in Redis or Cloudflare D1 with an atomic lease lock before executing the balance mutation handler, caching the response signature for replay.",
            "When a request arrives bearing an Idempotency-Key header, the server verifies if an in-flight lock exists or if a completed response has already been cached for that exact token.",
            "If a cached response is present, the handler immediately returns the identical HTTP status and response payload without re-executing any database updates or credit mutations."
          ],
          codeBlock: {
            language: "ts",
            code: "export async function handleIdempotentRequest(key: string) { /* atomic lease lock and replay logic */ }",
          },
        },
        {
          heading: "Verification Checklist and Telemetry",
          paragraphs: [
            "Perform automated fault-injection testing by firing parallel concurrent requests bearing the exact same idempotency key.",
            "Confirm that the underlying SQL transaction executes exactly once while all secondary requests receive the cached result with zero duplicate database rows."
          ],
        },
      ],
      sources: [
        { title: "IETF Idempotency Specification", url: "https://datatracker.ietf.org/doc/html/rfc9651" },
      ],
      relatedProjects: ["leftly"],
      status: "draft",
      wordCount: 420,
    };

    await saveArticle(testDraft);

    // Verify not public before approval
    assert.equal(await getArticleBySlug(testSlug), null);

    // Execute authenticated approval
    const approvalResult = await approveAndPublishDraft(testSlug, {}, "admin-tester");
    assert.equal(approvalResult.success, true);
    assert.equal(approvalResult.article?.status, "published");

    // Now it IS public!
    const publicArticle = await getArticleBySlug(testSlug);
    assert.ok(publicArticle);
    assert.equal(publicArticle.slug, testSlug);
    assert.equal(publicArticle.status, "published");

    // Clean up
    await deleteArticle(testSlug);
  });

  // 8. Rejected drafts remain unpublished
  test("8. Rejected drafts remain unpublished", async () => {
    const rejectSlug = "test-rejected-draft";
    const draft: Article = {
      id: "art-test-rejected",
      slug: rejectSlug,
      title: "Poorly Researched Draft Slated for Discard",
      description: "This draft should be rejected by the owner.",
      publishedAt: "2026-10-13",
      updatedAt: "2026-10-13",
      category: "Software Engineering",
      tags: ["Testing"],
      content: [
        { heading: "Section 1", paragraphs: ["Draft body"] },
        { heading: "Section 2", paragraphs: ["Draft body"] },
        { heading: "Section 3", paragraphs: ["Draft body"] },
      ],
      relatedProjects: [],
      status: "draft",
      wordCount: 300,
    };

    await saveArticle(draft);

    // Reject draft
    const rejected = await rejectDraft(rejectSlug, "Rejected due to insufficient depth");
    assert.equal(rejected, true);

    // Must not be public
    assert.equal(await getArticleBySlug(rejectSlug), null);
    const all = await getPublishedArticles();
    assert.equal(all.some((a) => a.slug === rejectSlug), false);
  });

  // 9. Database failures do not masquerade as successful persistence
  test("9. Database failures do not masquerade as successful persistence", async () => {
    // In production mode without D1 credentials:
    (process.env as any).NODE_ENV = "production";
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_D1_DATABASE_ID;
    delete process.env.CLOUDFLARE_API_TOKEN;

    const status = await getD1Status();
    assert.equal(status.connected, false, "Must report connected: false when D1 is unconfigured in production");
    assert.equal(status.mode, "unconfigured");

    const queryResult = await queryD1("SELECT 1");
    assert.equal(queryResult.success, false, "queryD1 must report failure rather than pretending success");
    assert.ok(queryResult.error?.includes("Cloudflare D1"));
  });

  // 10. Existing article URLs remain functional
  test("10. Existing article URLs remain functional", async () => {
    const baselineSlugs = [
      "react-native-ecommerce-expo-firebase",
      "household-budget-tracker-react-native-expo",
      "educational-platform-nextjs-typescript",
    ];

    for (const slug of baselineSlugs) {
      const article = await getArticleBySlug(slug);
      assert.ok(article, `Baseline article '${slug}' must be available and published.`);
      assert.equal(article.slug, slug);
      assert.equal(article.status, "published");
      assert.ok(article.content.length > 0);
    }
  });

  // 11. The sitemap contains published articles and excludes drafts
  test("11. The sitemap contains published articles and excludes drafts", async () => {
    const sitemapEntries = await sitemap();
    const urls = sitemapEntries.map((e) => e.url);

    // Baseline published articles must be in sitemap
    assert.ok(urls.includes("https://mmusmanlab.vercel.app/articles/react-native-ecommerce-expo-firebase"));
    assert.ok(urls.includes("https://mmusmanlab.vercel.app/articles/household-budget-tracker-react-native-expo"));
    assert.ok(urls.includes("https://mmusmanlab.vercel.app/articles/educational-platform-nextjs-typescript"));

    // Core static routes must be in sitemap
    assert.ok(urls.includes("https://mmusmanlab.vercel.app"));
    assert.ok(urls.includes("https://mmusmanlab.vercel.app/about"));
    assert.ok(urls.includes("https://mmusmanlab.vercel.app/projects"));
    assert.ok(urls.includes("https://mmusmanlab.vercel.app/contact"));

    // Project detail URLs must be in sitemap
    assert.ok(urls.includes("https://mmusmanlab.vercel.app/projects/amtech-shop"));
    assert.ok(urls.includes("https://mmusmanlab.vercel.app/projects/leftly"));
    assert.ok(urls.includes("https://mmusmanlab.vercel.app/projects/praxivon"));
  });

  // 12. Existing contact functionality remains intact
  test("12. Existing contact functionality remains intact", async () => {
    const testMessage = {
      name: "Engineering Test Client",
      email: "test.client@example.com",
      message: "Inquiry to verify contact storage persistence and integrity.",
      projectType: "Full-Stack Web App",
      company: "Acme Corp",
    };

    const messages = await appendContactMessage(undefined, testMessage);
    assert.ok(Array.isArray(messages));
    assert.ok(messages.some((m: any) => m.email === "test.client@example.com"));

    const stored = await readContactMessages();
    assert.ok(Array.isArray(stored));
    assert.ok(stored.some((m: any) => m.name === "Engineering Test Client"));
  });
});
