"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  Layout,
  Mail,
  BarChart3,
  ArrowRight,
  Plus,
  RefreshCw,
  Power,
  CheckCircle2,
  Clock,
  ExternalLink,
  Database,
  Cloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/data");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats;
  const articles = data?.articles || [];
  const projects = data?.projects || [];
  const contactMessages = data?.contactMessages || [];
  const draftArticles = articles.filter((a: any) => a.status === "draft");

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight">
            Engineering Command Center
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, Muhammad. Manage technical articles, portfolio case studies, and client inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchDashboardData} className="rounded-xl font-bold">
            <RefreshCw size={14} className={loading ? "animate-spin mr-1.5" : "mr-1.5"} /> Refresh Stats
          </Button>
          <Button size="sm" asChild className="rounded-xl font-bold shadow-md shadow-primary/20">
            <Link href="/dashboard/articles/new">
              <Plus size={14} className="mr-1.5" /> Write New Article
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-5 rounded-2xl bg-card border-border/70 space-y-1">
          <div className="text-xs text-muted-foreground uppercase font-bold">Published</div>
          <div className="text-2xl font-extrabold text-foreground">{stats?.publishedArticles ?? 0}</div>
          <div className="text-[11px] text-primary font-medium">Live on site</div>
        </Card>

        <Card className="p-5 rounded-2xl bg-amber-500/5 border-amber-500/30 space-y-1">
          <div className="text-xs text-amber-400 uppercase font-bold">Needs Approval</div>
          <div className="text-2xl font-extrabold text-amber-400">{draftArticles.length}</div>
          <Link href="/dashboard/approval" className="text-[11px] text-amber-400 hover:underline inline-flex items-center gap-1 font-bold">
            Review Drafts <ArrowRight size={10} />
          </Link>
        </Card>

        <Card className="p-5 rounded-2xl bg-card border-border/70 space-y-1">
          <div className="text-xs text-muted-foreground uppercase font-bold">Projects</div>
          <div className="text-2xl font-extrabold text-foreground">{stats?.totalProjects ?? 0}</div>
          <Link href="/dashboard/projects" className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 font-bold">
            Manage <ArrowRight size={10} />
          </Link>
        </Card>

        <Card className="p-5 rounded-2xl bg-card border-border/70 space-y-1">
          <div className="text-xs text-muted-foreground uppercase font-bold">Inquiries</div>
          <div className="text-2xl font-extrabold text-foreground">{contactMessages.length}</div>
          <Link href="/dashboard/messages" className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 font-bold">
            Open Inbox <ArrowRight size={10} />
          </Link>
        </Card>

        <Card className="p-5 rounded-2xl bg-card border-border/70 space-y-1">
          <div className="text-xs text-muted-foreground uppercase font-bold">AI Discovery</div>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-1">
            <CheckCircle2 size={14} /> Ready
          </div>
          <div className="text-[11px] text-muted-foreground">gemini-3.8-flash</div>
        </Card>

        <Card className="p-5 rounded-2xl bg-card border-border/70 space-y-1">
          <div className="text-xs text-muted-foreground uppercase font-bold">D1 &amp; R2</div>
          <div className="text-sm font-bold text-primary flex items-center gap-1 mt-1">
            <Database size={14} /> Prepared
          </div>
          <Link href="/dashboard/settings" className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 font-bold">
            Settings <ArrowRight size={10} />
          </Link>
        </Card>
      </div>

      {/* Quick Launchpads */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-2xl bg-card border-border/70 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <h3 className="font-bold text-lg">Technical Articles Hub</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Create in-depth guides with our lightweight WYSIWYG editor, code snippets, and diagnostic steps.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Button size="sm" asChild className="rounded-xl font-bold text-xs">
              <Link href="/dashboard/articles">Browse Articles</Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="rounded-xl font-bold text-xs">
              <Link href="/dashboard/articles/new">+ New Article</Link>
            </Button>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl bg-card border-border/70 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <h3 className="font-bold text-lg">AI Discovery &amp; Draft Queue</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Discover emerging framework bugs, evaluate opportunity scores, and review generated drafts before publishing.
          </p>
          <div className="pt-2">
            <Button size="sm" variant="outline" asChild className="rounded-xl font-bold text-xs">
              <Link href="/dashboard/approval">
                Open Approval Queue ({draftArticles.length}) <ArrowRight size={12} className="ml-1" />
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl bg-card border-border/70 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Layout size={20} />
          </div>
          <h3 className="font-bold text-lg">Portfolio Projects</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Manage showcase case studies: features, architectures, screenshots, and live demo links.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Button size="sm" asChild className="rounded-xl font-bold text-xs">
              <Link href="/dashboard/projects">View Projects</Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="rounded-xl font-bold text-xs">
              <Link href="/dashboard/projects/new">+ Add Project</Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Activity: Pending Drafts & Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Articles & Drafts */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold">Recent Articles &amp; Activity</h3>
            <Link href="/dashboard/articles" className="text-xs text-primary font-bold hover:underline">
              View All ({articles.length})
            </Link>
          </div>

          <div className="divide-y border rounded-2xl bg-card overflow-hidden">
            {articles.slice(0, 5).map((art: any) => (
              <div key={art.slug} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={art.status === "published" ? "outline" : "secondary"}
                      className={
                        art.status === "published"
                          ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/5 text-[9px]"
                          : "bg-amber-500/10 text-amber-400 text-[9px]"
                      }
                    >
                      {art.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{art.category}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{art.publishedAt}</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground line-clamp-1">{art.title}</h4>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="ghost" asChild className="h-8 px-2.5 text-xs font-bold rounded-xl">
                    <Link href={`/dashboard/articles/${art.slug}/edit`}>Edit</Link>
                  </Button>
                  <Button size="sm" variant="ghost" asChild className="h-8 px-2 text-xs text-muted-foreground rounded-xl">
                    <Link href={`/articles/${art.slug}`} target="_blank">
                      <ExternalLink size={13} />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Inquiries */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold">Latest Client Inquiries</h3>
            <Link href="/dashboard/messages" className="text-xs text-primary font-bold hover:underline">
              Inbox ({contactMessages.length})
            </Link>
          </div>

          {contactMessages.length === 0 ? (
            <Card className="p-8 text-center rounded-2xl bg-card border-border/70 border-dashed">
              <Mail className="mx-auto text-muted-foreground mb-2" size={28} />
              <p className="text-xs text-muted-foreground">No inquiries yet. Submissions via the contact form will appear here.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {contactMessages.slice(0, 3).map((msg: any) => (
                <Card key={msg.id} className="p-4 rounded-xl bg-card border-border/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">{msg.name}</span>
                    <span className="text-muted-foreground text-[10px]">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : "Recent"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>
                  <div className="text-[11px] text-primary font-medium">
                    {msg.projectType || "General Software Inquiry"}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
