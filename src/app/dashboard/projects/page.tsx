"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layout,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/data");
      if (res.ok) {
        const json = await res.json();
        setProjects(json.projects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete project "${id}"?`)) return;
    try {
      const res = await fetch(`/api/dashboard/projects?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Delete failed.");
      }
    } catch {
      alert("Delete failed.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight">
            Portfolio Case Studies &amp; Projects
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage web applications, mobile builds, and technical systems featured on your public portfolio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadProjects} className="rounded-xl font-bold">
            <RefreshCw size={14} className={loading ? "animate-spin mr-1.5" : "mr-1.5"} /> Refresh
          </Button>
          <Button size="sm" asChild className="rounded-xl font-bold shadow-md shadow-primary/20">
            <Link href="/dashboard/projects/new">
              <Plus size={16} className="mr-1.5" /> Add Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <Card key={proj.id} className="p-6 rounded-3xl bg-card border-border/70 flex flex-col justify-between space-y-4 shadow-sm hover:border-primary/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-xs text-primary border-primary/30 font-bold">
                  {proj.category} Engineering
                </Badge>
                <span className="text-[11px] font-mono text-muted-foreground">{proj.id}</span>
              </div>
              <h3 className="font-headline text-xl font-bold mb-2">{proj.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                {proj.shortDescription}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {proj.technologies.map((t: string) => (
                  <span key={t} className="text-[10px] bg-muted px-2 py-0.5 rounded font-medium text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <Link
                href={`/projects/${proj.id}`}
                target="_blank"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Eye size={13} /> Live Page
              </Link>

              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" asChild className="rounded-xl h-8 px-2.5 font-bold text-xs">
                  <Link href={`/dashboard/projects/${proj.id}/edit`}>
                    <Edit3 size={13} className="mr-1" /> Edit
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(proj.id)}
                  className="rounded-xl h-8 px-2 font-bold text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
