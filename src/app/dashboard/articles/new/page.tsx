"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Check,
  Plus,
  Trash2,
  Code2,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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

export default function NewArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Software Engineering");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [tagsInput, setTagsInput] = useState("Next.js, TypeScript, Full-Stack");
  const [sections, setSections] = useState<Section[]>([
    {
      heading: "Problem & Symptoms",
      paragraphs: ["Describe the technical issue, failure symptoms, and development context..."],
    },
    {
      heading: "Diagnosis & Root Cause",
      paragraphs: ["Explain why this behavior occurs and how to inspect stack traces or profiles..."],
    },
    {
      heading: "Production Solution & Implementation",
      paragraphs: ["Walk through the verified solution pattern and best practices:"],
      codeBlock: {
        language: "tsx",
        caption: "Solution pattern",
        code: "// Verified implementation pattern\nexport function Solution() {\n  return <div>Works reliably</div>;\n}\n",
      },
    },
  ]);

  const autoGenerateSlug = (text: string) => {
    setTitle(text);
    if (!slug) {
      setSlug(
        text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .slice(0, 80)
      );
    }
  };

  const handleSave = async (targetStatus?: "published" | "draft") => {
    if (!title || !slug || !description) {
      alert("Please enter title, slug, and description.");
      return;
    }

    setIsSubmitting(true);
    const finalStatus = targetStatus || status;

    const payload = {
      id: `art-${Date.now()}`,
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      publishedAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      category,
      difficulty,
      status: finalStatus,
      tags: tagsInput.split(",").map((s) => s.trim()).filter(Boolean),
      content: sections,
      relatedProjects: ["praxivon"],
      wordCount: sections.reduce(
        (acc, s) => acc + s.paragraphs.join(" ").split(/\s+/).length + (s.bullets ? s.bullets.length * 10 : 0),
        0
      ),
    };

    try {
      const res = await fetch("/api/dashboard/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-6">
        <div>
          <Link
            href="/dashboard/articles"
            className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 mb-2 font-bold"
          >
            <ArrowLeft size={14} /> Back to Articles
          </Link>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight">
            Write New Technical Article
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Full-page long-form editor with lightweight WYSIWYG formatting and code blocks.
          </p>
        </div>

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
            className="rounded-xl font-bold shadow-md shadow-primary/20 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Check size={16} className="mr-1.5" /> Publish Live
          </Button>
        </div>
      </div>

      {/* Main Metadata Card */}
      <Card className="p-6 md:p-8 rounded-3xl bg-card border-border/70 space-y-6">
        <h2 className="font-headline text-xl font-bold">Article Details &amp; SEO</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Article Title *
            </label>
            <Input
              placeholder="e.g. Solving Next.js 15 Server Actions Cache Invalidation..."
              value={title}
              onChange={(e) => autoGenerateSlug(e.target.value)}
              className="h-12 rounded-xl text-base font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              URL Slug *
            </label>
            <Input
              placeholder="e.g. solving-nextjs-15-server-actions-cache"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-12 rounded-xl text-sm font-mono"
            />
          </div>
        </div>

        {/* WYSIWYG Description */}
        <WysiwygEditor
          label="Article Overview & Summary *"
          value={description}
          onChange={setDescription}
          placeholder="Summarize the core technical symptoms, problem context, and engineering takeaways..."
          minHeight="90px"
          helperText="Appears on article preview cards, OpenGraph social cards, and search snippets."
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Category
            </label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full h-11 bg-background border border-muted-foreground/30 rounded-xl px-3 text-sm"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Tags (comma-separated)
            </label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="h-11 rounded-xl text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Sections Builder */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-2xl font-bold">Content Sections ({sections.length})</h2>
            <p className="text-xs text-muted-foreground">
              Structure technical guides into logical chapters: problem, diagnosis, code solution, and verification.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSections([
                ...sections,
                { heading: "New Section", paragraphs: ["Enter chapter content..."] },
              ]);
            }}
            className="rounded-xl font-bold"
          >
            <Plus size={14} className="mr-1.5" /> Add Section
          </Button>
        </div>

        <div className="space-y-6">
          {sections.map((sec, sIdx) => (
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
                      const updated = [...sections];
                      updated[sIdx].heading = e.target.value;
                      setSections(updated);
                    }}
                    className="h-11 font-bold text-base bg-background flex-1"
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSections(sections.filter((_, i) => i !== sIdx));
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
                  const updated = [...sections];
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
                  setSections(updated);
                }}
                placeholder="Write the technical explanation, diagnosis steps, architecture decisions, or edge cases..."
                minHeight="150px"
              />

              {/* Code Block for Section */}
              <div className="pt-2">
                {sec.codeBlock ? (
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-border/80 text-neutral-200 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center gap-1.5 text-primary">
                        <Code2 size={14} /> Production Code Snippet
                      </span>
                      <div className="flex items-center gap-3">
                        <select
                          value={sec.codeBlock.language}
                          onChange={(e) => {
                            const updated = [...sections];
                            if (updated[sIdx].codeBlock) {
                              updated[sIdx].codeBlock!.language = e.target.value;
                              setSections(updated);
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
                            const updated = [...sections];
                            delete updated[sIdx].codeBlock;
                            setSections(updated);
                          }}
                          className="text-neutral-400 hover:text-destructive text-xs"
                        >
                          Remove Code Block
                        </button>
                      </div>
                    </div>
                    <Input
                      placeholder="Caption / Description (e.g. Production cache revalidation handler)"
                      value={sec.codeBlock.caption || ""}
                      onChange={(e) => {
                        const updated = [...sections];
                        if (updated[sIdx].codeBlock) {
                          updated[sIdx].codeBlock!.caption = e.target.value;
                          setSections(updated);
                        }
                      }}
                      className="h-9 text-xs bg-neutral-900 border-neutral-800 text-neutral-300"
                    />
                    <Textarea
                      placeholder="// Write or paste production code..."
                      value={sec.codeBlock.code}
                      onChange={(e) => {
                        const updated = [...sections];
                        if (updated[sIdx].codeBlock) {
                          updated[sIdx].codeBlock!.code = e.target.value;
                          setSections(updated);
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
                      const updated = [...sections];
                      updated[sIdx].codeBlock = {
                        language: "tsx",
                        caption: "Solution pattern",
                        code: "// Add code snippet\n",
                      };
                      setSections(updated);
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
          Status: {status.toUpperCase()}
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
            <Check size={16} className="mr-1.5" /> Publish Live
          </Button>
        </div>
      </div>
    </div>
  );
}
