"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/data");
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete article "${slug}"?`)) return;
    try {
      const res = await fetch(`/api/dashboard/articles?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.slug !== slug));
      } else {
        alert("Delete failed.");
      }
    } catch {
      alert("Delete failed.");
    }
  };

  const filtered = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight">
            Articles &amp; Technical Notes
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage published engineering guides, framework diagnostics, and pending drafts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadArticles} className="rounded-xl font-bold">
            <RefreshCw size={14} className={loading ? "animate-spin mr-1.5" : "mr-1.5"} /> Refresh
          </Button>
          <Button size="sm" asChild className="rounded-xl font-bold shadow-md shadow-primary/20">
            <Link href="/dashboard/articles/new">
              <Plus size={16} className="mr-1.5" /> New Article
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 text-muted-foreground" size={16} />
          <Input
            placeholder="Search by title, topic, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["all", "published", "draft"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {st} ({articles.filter((a) => (st === "all" ? true : a.status === st)).length})
            </button>
          ))}
        </div>
      </div>

      {/* Articles List */}
      <div className="divide-y border rounded-2xl bg-card overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <BookOpen size={36} className="mx-auto opacity-50 mb-2" />
            <p className="text-base font-semibold">No articles found</p>
            <p className="text-xs">Try adjusting your search criteria or create a new article.</p>
          </div>
        ) : (
          filtered.map((art) => (
            <div
              key={art.slug}
              className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge
                    variant={art.status === "published" ? "outline" : "secondary"}
                    className={
                      art.status === "published"
                        ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/5 text-[10px]"
                        : "bg-amber-500/10 text-amber-400 text-[10px]"
                    }
                  >
                    {art.status.toUpperCase()}
                  </Badge>
                  <span className="font-bold text-primary">{art.category}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground font-medium">{art.publishedAt}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{art.readingTime || "5 min read"}</span>
                  {art.isAutomated && (
                    <Badge variant="outline" className="text-[9px] text-muted-foreground py-0">
                      AI Generated
                    </Badge>
                  )}
                </div>

                <h3 className="font-headline text-lg md:text-xl font-bold text-foreground">
                  {art.title}
                </h3>

                <p className="text-xs font-mono text-muted-foreground">/articles/{art.slug}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {art.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Button size="sm" variant="outline" asChild className="rounded-xl font-bold text-xs h-9">
                  <Link href={`/dashboard/articles/${art.slug}/edit`}>
                    <Edit3 size={13} className="mr-1.5" /> Full Editor
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" asChild className="rounded-xl font-bold text-xs h-9">
                  <Link href={`/articles/${art.slug}`} target="_blank">
                    <Eye size={13} className="mr-1" /> View Live
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(art.slug)}
                  className="rounded-xl text-xs h-9 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
