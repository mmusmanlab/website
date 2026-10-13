"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Code2,
  Eye,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WysiwygEditor } from "@/components/wysiwyg-editor";

interface Section {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  codeBlock?: {
    language: string;
    caption?: string;
    code: string;
  };
}

export default function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles?slug=${encodeURIComponent(slug)}`);
      const json = await res.json();
      if (res.ok && json.article) {
        setArticle(json.article);
      } else {
        // Fallback: check dashboard data for draft
        const dashRes = await fetch("/api/dashboard/data");
        const dashJson = await dashRes.json();
        const found = (dashJson.articles || []).find((a: any) => a.slug === slug);
        if (found) {
          setArticle(found);
        } else {
          alert("Article not found.");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (overrideStatus?: "published" | "draft") => {
    if (!article) return;
    setIsSubmitting(true);

    const updatedArticle = {
      ...article,
      status: overrideStatus || article.status,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    try {
      const res = await fetch("/api/dashboard/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedArticle),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/dashboard/articles");
      } else {
        throw new Error(data.error || "Save failed.");
      }
    } catch (err: any) {
      alert(`Error saving article: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${article?.title}"?`)) return;
    try {
      const res = await fetch(`/api/dashboard/articles?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard/articles");
      } else {
        alert("Delete failed.");
      }
    } catch {
      alert("Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="animate-spin text-primary mx-auto" size={32} />
          <p className="text-sm text-muted-foreground font-medium">Loading article content...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="font-headline text-2xl font-bold">Article Not Found</h2>
        <Button asChild variant="outline">
          <Link href="/dashboard/articles">Return to Articles</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-6">
        <div>
          <Link
            href="/dashboard/articles"
            className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 mb-2 font-bold"
          >
            <ArrowLeft size={14} /> Back to Articles
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight">
              Edit Article
            </h1>
            <Badge
              variant={article.status === "published" ? "outline" : "secondary"}
              className={`text-xs ${
                article.status === "published"
                  ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/5"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              {article.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs font-mono mt-1">/articles/{article.slug}</p>
        </div>

        <div className="flex items-center gap-2">
          {article.status === "published" && (
            <Button variant="outline" size="sm" asChild className="rounded-xl font-bold text-xs h-10">
              <Link href={`/articles/${article.slug}`} target="_blank">
                <Eye size={14} className="mr-1.5" /> View Live
              </Link>
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            className="rounded-xl text-xs h-10 text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={16} />
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("published")}
            className="rounded-xl font-bold shadow-md shadow-primary/20 bg-emerald-600 hover:bg-emerald-500 text-white h-10 px-5"
          >
            <Check size={16} className="mr-1.5" /> Save &amp; Publish
          </Button>
        </div>
      </div>

      {/* Main Details Card */}
      <Card className="p-6 md:p-8 rounded-3xl bg-card border-border/70 space-y-6">
        <h2 className="font-headline text-xl font-bold">Metadata &amp; Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Title *
            </label>
            <Input
              value={article.title}
              onChange={(e) => setArticle({ ...article, title: e.target.value })}
              className="h-12 rounded-xl text-base font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Slug (URL path) *
            </label>
            <Input
              value={article.slug}
              onChange={(e) => setArticle({ ...article, slug: e.target.value })}
              className="h-12 rounded-xl text-sm font-mono"
            />
          </div>
        </div>

        {/* WYSIWYG Description */}
        <WysiwygEditor
          label="Article Overview & Summary *"
          value={article.description}
          onChange={(val) => setArticle({ ...article, description: val })}
          minHeight="90px"
          helperText="Formatted summary shown on preview cards and search snippets."
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Category
            </label>
            <Input
              value={article.category}
              onChange={(e) => setArticle({ ...article, category: e.target.value })}
              className="h-11 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Difficulty
            </label>
            <select
              value={article.difficulty || "Intermediate"}
              onChange={(e) => setArticle({ ...article, difficulty: e.target.value })}
              className="w-full h-11 bg-background border border-muted-foreground/30 rounded-xl px-3 text-sm"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Status
            </label>
            <select
              value={article.status}
              onChange={(e) => setArticle({ ...article, status: e.target.value })}
              className="w-full h-11 bg-background border border-muted-foreground/30 rounded-xl px-3 text-sm font-bold text-primary"
            >
              <option value="published">Published (Live)</option>
              <option value="draft">Draft (In Review)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Content Sections with WYSIWYG Editor */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-2xl font-bold">Content Sections ({article.content.length})</h2>
            <p className="text-xs text-muted-foreground">
              Edit individual sections using the rich WYSIWYG toolbar.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setArticle({
                ...article,
                content: [
                  ...article.content,
                  { heading: "New Section", paragraphs: ["Enter section content..."] },
                ],
              });
            }}
            className="rounded-xl font-bold"
          >
            <Plus size={14} className="mr-1.5" /> Add Section
          </Button>
        </div>

        <div className="space-y-6">
          {article.content.map((sec: Section, sIdx: number) => (
            <Card key={sIdx} className="p-6 md:p-8 rounded-3xl bg-card border-border/70 space-y-5 shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-4">
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                    {sIdx + 1}
                  </span>
                  <Input
                    placeholder="Section Heading"
                    value={sec.heading}
                    onChange={(e) => {
                      const updated = [...article.content];
                      updated[sIdx].heading = e.target.value;
                      setArticle({ ...article, content: updated });
                    }}
                    className="h-11 font-bold text-base bg-background flex-1"
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const updated = article.content.filter((_: any, i: number) => i !== sIdx);
                    setArticle({ ...article, content: updated });
                  }}
                  className="text-destructive hover:bg-destructive/10 rounded-xl"
                  title="Delete Section"
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              {/* WYSIWYG Editor for Section Content */}
              <WysiwygEditor
                label={`Section ${sIdx + 1} Explanation`}
                value={[...sec.paragraphs, ...(sec.bullets ? sec.bullets.map((b) => `- ${b}`) : [])].join("\n\n")}
                onChange={(val) => {
                  const updated = [...article.content];
                  const blocks = val.split("\n\n").filter(Boolean);
                  const paragraphs: string[] = [];
                  const bullets: string[] = [];

                  blocks.forEach((block) => {
                    if (block.trim().startsWith("- ") || block.trim().startsWith("* ")) {
                      block.split("\n").forEach((line) => {
                        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
                          bullets.push(line.trim().replace(/^[-*]\s+/, ""));
                        } else if (line.trim()) {
                          paragraphs.push(line.trim());
                        }
                      });
                    } else {
                      paragraphs.push(block);
                    }
                  });

                  updated[sIdx].paragraphs = paragraphs.length > 0 ? paragraphs : [val];
                  if (bullets.length > 0) {
                    updated[sIdx].bullets = bullets;
                  } else {
                    delete updated[sIdx].bullets;
                  }
                  setArticle({ ...article, content: updated });
                }}
                minHeight="150px"
              />

              {/* Code Snippet */}
              <div className="pt-2">
                {sec.codeBlock ? (
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-border/80 text-neutral-200 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center gap-1.5 text-primary">
                        <Code2 size={14} /> Production Code Solution
                      </span>
                      <div className="flex items-center gap-3">
                        <select
                          value={sec.codeBlock.language}
                          onChange={(e) => {
                            const updated = [...article.content];
                            if (updated[sIdx].codeBlock) {
                              updated[sIdx].codeBlock!.language = e.target.value;
                              setArticle({ ...article, content: updated });
                            }
                          }}
                          className="bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs text-neutral-300 outline-none"
                        >
                          <option value="tsx">tsx</option>
                          <option value="ts">ts</option>
                          <option value="js">js</option>
                          <option value="bash">bash</option>
                          <option value="python">python</option>
                          <option value="json">json</option>
                          <option value="sql">sql</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...article.content];
                            delete updated[sIdx].codeBlock;
                            setArticle({ ...article, content: updated });
                          }}
                          className="text-neutral-400 hover:text-destructive text-xs"
                        >
                          Remove Code Block
                        </button>
                      </div>
                    </div>
                    <Input
                      placeholder="Caption / Description"
                      value={sec.codeBlock.caption || ""}
                      onChange={(e) => {
                        const updated = [...article.content];
                        if (updated[sIdx].codeBlock) {
                          updated[sIdx].codeBlock!.caption = e.target.value;
                          setArticle({ ...article, content: updated });
                        }
                      }}
                      className="h-9 text-xs bg-neutral-900 border-neutral-800 text-neutral-300"
                    />
                    <Textarea
                      placeholder="// Code solution..."
                      value={sec.codeBlock.code}
                      onChange={(e) => {
                        const updated = [...article.content];
                        if (updated[sIdx].codeBlock) {
                          updated[sIdx].codeBlock!.code = e.target.value;
                          setArticle({ ...article, content: updated });
                        }
                      }}
                      className="font-mono text-xs min-h-[140px] bg-neutral-900/80 border-neutral-800 text-emerald-400 leading-relaxed"
                    />
                  </div>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const updated = [...article.content];
                      updated[sIdx].codeBlock = {
                        language: "tsx",
                        caption: "Solution pattern",
                        code: "// Add production code snippet\n",
                      };
                      setArticle({ ...article, content: updated });
                    }}
                    className="text-xs text-primary hover:bg-primary/10 rounded-xl h-8 px-3"
                  >
                    <Code2 size={14} className="mr-1.5" /> + Add Code Snippet to This Section
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="sticky bottom-6 p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-primary/20 shadow-2xl flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono">
          Status: {article.status.toUpperCase()}
        </span>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => handleSave("draft")}
            className="rounded-xl font-bold"
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("published")}
            className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
          >
            <Check size={16} className="mr-1.5" /> Save &amp; Publish Live
          </Button>
        </div>
      </div>
    </div>
  );
}
