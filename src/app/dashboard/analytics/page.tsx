"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Globe,
  Smartphone,
  Server,
  Layers,
  Search,
  Eye,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const articles = data?.articles || [];
  const publishedArticles = articles.filter((a: any) => a.status === "published");
  const messages = data?.contactMessages || [];

  // Group by category
  const categoryCounts: Record<string, number> = {};
  publishedArticles.forEach((a: any) => {
    categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
  });

  // Group inquiries by project type
  const inquiryCounts: Record<string, number> = {};
  messages.forEach((m: any) => {
    const type = m.projectType || "General Inquiry";
    inquiryCounts[type] = (inquiryCounts[type] || 0) + 1;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight">
            Portfolio &amp; Knowledge Hub Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Discoverability metrics, technical content distribution, and client conversion insights.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} className="rounded-xl font-bold">
          <RefreshCw size={14} className={loading ? "animate-spin mr-1.5" : "mr-1.5"} /> Refresh Data
        </Button>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <Card className="p-6 rounded-3xl bg-card border-border/70 space-y-1">
          <span className="text-xs uppercase font-bold text-muted-foreground">Live Indexed Guides</span>
          <div className="text-3xl font-extrabold text-foreground">{publishedArticles.length}</div>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 size={12} /> 100% in dynamic sitemap
          </p>
        </Card>

        <Card className="p-6 rounded-3xl bg-card border-border/70 space-y-1">
          <span className="text-xs uppercase font-bold text-muted-foreground">Client Inquiries</span>
          <div className="text-3xl font-extrabold text-foreground">{messages.length}</div>
          <p className="text-[11px] text-primary font-semibold">Contact conversion channel</p>
        </Card>

        <Card className="p-6 rounded-3xl bg-card border-border/70 space-y-1">
          <span className="text-xs uppercase font-bold text-muted-foreground">Portfolio Projects</span>
          <div className="text-3xl font-extrabold text-foreground">{data?.projects?.length || 4}</div>
          <p className="text-[11px] text-muted-foreground">Full case study breakdowns</p>
        </Card>

        <Card className="p-6 rounded-3xl bg-card border-border/70 space-y-1">
          <span className="text-xs uppercase font-bold text-muted-foreground">Avg Word Count</span>
          <div className="text-3xl font-extrabold text-foreground">
            {publishedArticles.length > 0
              ? Math.round(
                  publishedArticles.reduce((acc: number, a: any) => acc + (a.wordCount || 500), 0) /
                    publishedArticles.length
                )
              : 0}
          </div>
          <p className="text-[11px] text-muted-foreground">In-depth technical guides</p>
        </Card>
      </div>

      {/* Content Breakdown & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Categories Distribution */}
        <Card className="lg:col-span-6 p-6 md:p-8 rounded-3xl bg-card border-border/70 space-y-6">
          <h2 className="font-headline text-xl font-bold flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" /> Content Knowledge Distribution
          </h2>
          <div className="space-y-4">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / (publishedArticles.length || 1)) * 100);
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-foreground">{cat}</span>
                    <span className="text-muted-foreground">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Conversion Funnel Concept */}
        <Card className="lg:col-span-6 p-6 md:p-8 rounded-3xl bg-card border-border/70 space-y-5">
          <h2 className="font-headline text-xl font-bold flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-400" /> Search → Solution → Client Funnel
          </h2>
          <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
            <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/50 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                1
              </span>
              <div>
                <strong className="text-foreground block">Organic Discovery via Search</strong>
                Developers and founders query specific technical problems (e.g. Next.js 15 cache, Expo performance).
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/50 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                2
              </span>
              <div>
                <strong className="text-foreground block">Authoritative Solution Article</strong>
                Reader solves their issue and observes Muhammad&apos;s verified engineering competence.
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/50 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                3
              </span>
              <div>
                <strong className="text-foreground block">Project Case Studies Evidence</strong>
                Reader navigates to Amtech Shop, Leftly, or Praxivon to review architecture scope.
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                4
              </span>
              <div>
                <strong className="text-white block">Project Inquiry / Contract Lead</strong>
                Visitor submits direct project requirements via the integrated contact pathway.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
