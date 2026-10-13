"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Trash2, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/data");
      const json = await res.json();
      const found = (json.projects || []).find((p: any) => p.id === id);
      if (found) {
        setProject(found);
      } else {
        alert("Project not found.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/dashboard/projects");
      } else {
        throw new Error(data.error || "Save failed.");
      }
    } catch (err: any) {
      alert(`Error saving project: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete project "${project?.name}"?`)) return;
    try {
      const res = await fetch(`/api/dashboard/projects?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard/projects");
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
          <p className="text-sm text-muted-foreground font-medium">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="font-headline text-2xl font-bold">Project Not Found</h2>
        <Button asChild variant="outline">
          <Link href="/dashboard/projects">Return to Projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-6">
        <div>
          <Link
            href="/dashboard/projects"
            className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 mb-2 font-bold"
          >
            <ArrowLeft size={14} /> Back to Projects
          </Link>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight">
            Edit Project: {project.name}
          </h1>
          <p className="text-muted-foreground text-xs font-mono mt-0.5">/projects/{project.id}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="rounded-xl font-bold text-xs h-10">
            <Link href={`/projects/${project.id}`} target="_blank">
              <Eye size={14} className="mr-1.5" /> View Live
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            className="rounded-xl text-xs h-10 text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={16} />
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white h-10 px-5 shadow-md shadow-emerald-600/20"
          >
            <Check size={16} className="mr-1.5" /> Save Changes
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 md:p-8 rounded-3xl bg-card border-border/70 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Project Name *
              </label>
              <Input
                value={project.name}
                onChange={(e) => setProject({ ...project, name: e.target.value })}
                required
                className="h-12 rounded-xl text-base font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Project ID (slug) *
              </label>
              <Input
                value={project.id}
                onChange={(e) => setProject({ ...project, id: e.target.value })}
                required
                className="h-12 rounded-xl text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Category
            </label>
            <select
              value={project.category}
              onChange={(e) => setProject({ ...project, category: e.target.value as any })}
              className="w-full h-11 bg-background border border-muted-foreground/30 rounded-xl px-3 text-sm font-medium"
            >
              <option value="Web">Web Application</option>
              <option value="Mobile">Mobile Application (React Native/Expo)</option>
              <option value="Technical">Technical Infrastructure</option>
              <option value="Tool">Developer Tool</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Short Description *
            </label>
            <Textarea
              value={project.shortDescription}
              onChange={(e) => setProject({ ...project, shortDescription: e.target.value })}
              required
              className="rounded-xl min-h-[70px] text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Full Architecture &amp; Engineering Scope *
            </label>
            <Textarea
              value={project.fullDescription}
              onChange={(e) => setProject({ ...project, fullDescription: e.target.value })}
              required
              className="rounded-xl min-h-[140px] text-sm leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Technologies (comma separated)
              </label>
              <Input
                value={Array.isArray(project.technologies) ? project.technologies.join(", ") : ""}
                onChange={(e) =>
                  setProject({
                    ...project,
                    technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="h-11 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Screenshot Image URL
              </label>
              <Input
                value={project.image || ""}
                onChange={(e) => setProject({ ...project, image: e.target.value })}
                className="h-11 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Features (one per line)
            </label>
            <Textarea
              value={Array.isArray(project.features) ? project.features.join("\n") : ""}
              onChange={(e) =>
                setProject({
                  ...project,
                  features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                })
              }
              className="rounded-xl min-h-[90px] text-sm font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Live Demo URL (optional)
              </label>
              <Input
                value={project.demoUrl || ""}
                onChange={(e) => setProject({ ...project, demoUrl: e.target.value })}
                className="h-11 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Source Repository (optional)
              </label>
              <Input
                value={project.repoUrl || ""}
                onChange={(e) => setProject({ ...project, repoUrl: e.target.value })}
                className="h-11 rounded-xl text-sm"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild className="rounded-xl">
            <Link href="/dashboard/projects">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-6"
          >
            <Check size={16} className="mr-1.5" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
