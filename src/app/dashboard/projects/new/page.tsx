"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [category, setCategory] = useState<"Web" | "Mobile" | "Technical" | "Tool">("Web");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [technologiesInput, setTechnologiesInput] = useState("Next.js, TypeScript, Tailwind CSS");
  const [featuresInput, setFeaturesInput] = useState("High-performance rendering\nType-safe API routes\nResponsive UX");
  const [image, setImage] = useState("https://picsum.photos/seed/project/800/600");
  const [demoUrl, setDemoUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");

  const autoGenerateId = (text: string) => {
    setName(text);
    if (!id) {
      setId(
        text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .slice(0, 50)
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !id || !shortDescription || !fullDescription) {
      alert("Please fill in project name, ID, short description, and full description.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      id: id.trim(),
      name: name.trim(),
      category,
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      overview: shortDescription.trim(),
      technologies: technologiesInput.split(",").map((t) => t.trim()).filter(Boolean),
      features: featuresInput.split("\n").map((f) => f.trim()).filter(Boolean),
      image: image.trim() || "https://picsum.photos/seed/project/800/600",
      imageAlt: `${name} project screenshot`,
      demoUrl: demoUrl.trim() || undefined,
      repoUrl: repoUrl.trim() || undefined,
      lastModified: new Date().toISOString().split("T")[0],
    };

    try {
      const res = await fetch("/api/dashboard/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
            Add New Software Project
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Document a real application build for your public showcase.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="rounded-xl font-bold shadow-md shadow-primary/20 bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          <Check size={16} className="mr-1.5" /> Save Project
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 md:p-8 rounded-3xl bg-card border-border/70 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Project Name *
              </label>
              <Input
                placeholder="e.g. Amtech Shop"
                value={name}
                onChange={(e) => autoGenerateId(e.target.value)}
                required
                className="h-12 rounded-xl text-base font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Project ID (URL slug) *
              </label>
              <Input
                placeholder="e.g. amtech-shop"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
                className="h-12 rounded-xl text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Engineering Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
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
              Short Description (1-2 sentences) *
            </label>
            <Textarea
              placeholder="Summary shown on project cards and search results..."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
              className="rounded-xl min-h-[70px] text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Full Architecture &amp; Engineering Description *
            </label>
            <Textarea
              placeholder="In-depth explanation of the scope, problem solved, architecture choices, and challenges..."
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              required
              className="rounded-xl min-h-[140px] text-sm leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Technologies Used (comma separated)
              </label>
              <Input
                value={technologiesInput}
                onChange={(e) => setTechnologiesInput(e.target.value)}
                placeholder="React Native, Expo, TypeScript, Firebase"
                className="h-11 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Screenshot Image URL
              </label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://picsum.photos/seed/amtech/800/600"
                className="h-11 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Key Delivered Features (one per line)
            </label>
            <Textarea
              value={featuresInput}
              onChange={(e) => setFeaturesInput(e.target.value)}
              placeholder="Real-time catalog updates&#10;Stripe payment processing&#10;Inventory management dashboard"
              className="rounded-xl min-h-[90px] text-sm font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Live Demo URL (optional)
              </label>
              <Input
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://..."
                className="h-11 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Source Repository (optional)
              </label>
              <Input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/mmusmanlab/..."
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
            <Check size={16} className="mr-1.5" /> Save Project
          </Button>
        </div>
      </form>
    </div>
  );
}
