"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Clock,
  Check,
  Trash2,
  Edit3,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Code2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Suggestion {
  topic: string;
  category: string;
  score: number;
  decision: string;
  reasons: string[];
}

export default function ApprovalQueuePage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [customCategory, setCustomCategory] = useState("Software Engineering");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/data");
      if (res.ok) {
        const json = await res.json();
        setDrafts((json.articles || []).filter((a: any) => a.status === "draft"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverTopics = async () => {
    setIsDiscovering(true);
    setStatusMsg("");
    try {
      const res = await fetch("/api/dashboard/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "discover" }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        setStatusMsg(`Discovered ${data.suggestions.length} candidate problem topics.`);
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleGenerateDraft = async (topic: string, cat: string) => {
    setIsGenerating(true);
    setStatusMsg(`Generating draft for: "${topic}"...`);
    try {
      const res = await fetch("/api/dashboard/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-draft",
          topic,
          category: cat,
          relatedProjects: ["praxivon", "amtech-shop"],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg("Draft created and added to the review queue below.");
        setSuggestions((prev) => prev.filter((s) => s.topic !== topic));
        await loadData();
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (draft: any) => {
    try {
      setStatusMsg(`Validating and publishing '${draft.title}'...`);
      const res = await fetch("/api/dashboard/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          slug: draft.slug,
          articleData: draft,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg(`'${draft.title}' approved and published live!`);
        await loadData();
      } else {
        throw new Error(data.error || "Approval failed");
      }
    } catch (err: any) {
      setStatusMsg(`Approval Error: ${err.message}`);
    }
  };

  const handleReject = async (slug: string) => {
    if (!confirm("Are you sure you want to discard this draft?")) return;
    try {
      const res = await fetch("/api/dashboard/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          articleData: { slug },
        }),
      });
      if (res.ok) {
        setDrafts((prev) => prev.filter((d) => d.slug !== slug));
        setStatusMsg("Draft rejected.");
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight">
              AI Discovery &amp; Approval Queue
            </h1>
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
              {drafts.length} In Review
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Discover real developer problems, evaluate opportunity scores, and review/adjust generated drafts before publishing.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} className="rounded-xl font-bold">
          <RefreshCw size={14} className={loading ? "animate-spin mr-1.5" : "mr-1.5"} /> Refresh Queue
        </Button>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg("")} className="hover:text-foreground text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: PENDING DRAFTS QUEUE */}
      <section className="space-y-5">
        <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
          <Clock className="text-amber-400" size={22} />
          Pending Drafts Requiring Review ({drafts.length})
        </h2>

        {drafts.length === 0 ? (
          <Card className="p-10 text-center rounded-3xl bg-card border-dashed border space-y-2">
            <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-1" />
            <h3 className="font-bold text-base">Approval Queue is Clear</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              All generated articles are published. Generate a new draft below using the AI topic explorer or custom problem inputs.
            </p>
          </Card>
        ) : (
          <div className="space-y-5">
            {drafts.map((draft) => (
              <Card key={draft.slug} className="p-6 md:p-8 rounded-3xl bg-card border-amber-500/30 shadow-lg space-y-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-border/50 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs mb-1.5">
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-bold">
                        Pending Review
                      </Badge>
                      <span className="font-bold text-primary">{draft.category}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{draft.readingTime}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{draft.wordCount} words</span>
                    </div>
                    <h3 className="font-headline text-xl md:text-2xl font-bold text-foreground">
                      {draft.title}
                    </h3>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">/articles/{draft.slug}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="rounded-xl font-bold text-xs h-10"
                    >
                      <Link href={`/dashboard/articles/${draft.slug}/edit`}>
                        <Edit3 size={14} className="mr-1.5" /> Full WYSIWYG Editor
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(draft)}
                      className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-10 px-4 shadow-md shadow-emerald-600/20"
                    >
                      <Check size={14} className="mr-1.5" /> Approve &amp; Publish Live
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReject(draft.slug)}
                      className="rounded-xl text-xs h-10 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {draft.description}
                </p>

                {/* Sections Overview */}
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 text-xs space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                    Draft Chapters &amp; Solutions ({draft.content.length}):
                  </span>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {draft.content.map((sec: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-foreground/80 font-medium truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="truncate">{sec.heading}</span>
                        {sec.codeBlock && (
                          <Badge variant="outline" className="text-[9px] py-0 px-1 text-primary border-primary/30">
                            {sec.codeBlock.language}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: TOPIC DISCOVERY & GENERATOR */}
      <section className="space-y-6 pt-8 border-t border-border/60">
        <div>
          <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-primary" size={22} />
            Discover Technical Problems &amp; Generate Drafts
          </h2>
          <p className="text-muted-foreground text-sm">
            AI evaluated topics against Muhammad M. Usman&apos;s stack (Next.js, React Native, TypeScript, Node.js).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Custom Topic Input */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 rounded-3xl bg-card border-border/70 space-y-4">
              <h3 className="font-bold text-base">Custom Problem or Topic Idea</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Problem Title
                  </label>
                  <Input
                    placeholder="e.g. Next.js 15: Resolving Route Handler streaming timeout..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full h-10 bg-background border border-muted-foreground/30 rounded-xl px-3 text-sm"
                  >
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Backend Engineering">Backend Engineering</option>
                  </select>
                </div>

                <Button
                  size="sm"
                  disabled={!customTopic || isGenerating}
                  onClick={() => handleGenerateDraft(customTopic, customCategory)}
                  className="w-full rounded-xl font-bold mt-2"
                >
                  {isGenerating ? "Generating Draft..." : "Generate Draft for Approval"}
                </Button>
              </div>
            </Card>

            <Card className="p-6 rounded-3xl bg-primary/5 border border-primary/20 space-y-3">
              <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
                <Sparkles size={16} /> Automated Problem Scanner
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scan developer communities and official release notes for high-frequency problems.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDiscoverTopics}
                disabled={isDiscovering}
                className="w-full rounded-xl font-bold"
              >
                {isDiscovering ? (
                  <>
                    <RefreshCw className="animate-spin mr-1.5" size={14} /> Scanning Topics...
                  </>
                ) : (
                  <>Scan Candidate Topics</>
                )}
              </Button>
            </Card>
          </div>

          {/* Suggestions Pool */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-bold text-base flex items-center justify-between">
              <span>Scored Topics Pool</span>
              <span className="text-xs text-muted-foreground">{suggestions.length} candidates</span>
            </h3>

            {suggestions.length === 0 ? (
              <Card className="p-10 text-center rounded-3xl bg-card border-dashed border space-y-2">
                <p className="text-xs text-muted-foreground">
                  Click &quot;Scan Candidate Topics&quot; to evaluate high-value problems with opportunity scoring.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {suggestions.map((item, idx) => (
                  <Card key={idx} className="p-5 rounded-2xl bg-card border-border/70 hover:border-primary/40 transition-colors space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={`text-[10px] uppercase font-bold ${
                              item.score >= 75 ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.decision} ({item.score}/100)
                          </Badge>
                          <span className="text-xs font-semibold text-primary">{item.category}</span>
                        </div>
                        <h4 className="font-bold text-base text-foreground leading-snug">{item.topic}</h4>
                      </div>

                      <Button
                        size="sm"
                        disabled={isGenerating}
                        onClick={() => handleGenerateDraft(item.topic, item.category)}
                        className="rounded-xl font-bold shrink-0 text-xs"
                      >
                        Generate Draft
                      </Button>
                    </div>

                    {item.reasons && (
                      <div className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3 space-y-0.5">
                        {item.reasons.map((r, ri) => (
                          <div key={ri}>{r}</div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
