"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Play,
  Copy,
  Check,
  Terminal,
  Table,
  Layers,
  ArrowRight,
  ShieldCheck,
  HardDrive,
  UploadCloud,
  Code2,
  Sparkles,
  FolderOpen,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function DashboardDatabasePage() {
  const [loading, setLoading] = useState(true);
  const [d1Data, setD1Data] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Local uploads state
  const [uploadsCount, setUploadsCount] = useState<number>(0);

  // SQL Console state
  const [customSql, setCustomSql] = useState("SELECT * FROM articles LIMIT 3");
  const [queryResult, setQueryResult] = useState<any>(null);
  const [copiedWrangler, setCopiedWrangler] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  useEffect(() => {
    loadD1Status();
    loadUploadsCount();
  }, []);

  const loadD1Status = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/d1");
      const json = await res.json();
      if (res.ok) {
        setD1Data(json);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUploadsCount = async () => {
    try {
      const res = await fetch("/api/upload");
      const json = await res.json();
      if (res.ok && json.files) {
        setUploadsCount(json.files.length);
      }
    } catch {
      // Ignore
    }
  };

  const handleAction = async (action: string) => {
    setActionLoading(action);
    setFeedback(null);
    try {
      const res = await fetch("/api/dashboard/d1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({ type: "success", message: json.message });
        await loadD1Status();
        await loadUploadsCount();
      } else {
        setFeedback({ type: "error", message: json.error || json.message || "Action failed." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Network error." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRunQuery = async () => {
    if (!customSql.trim()) return;
    setActionLoading("query");
    setFeedback(null);
    try {
      const res = await fetch("/api/dashboard/d1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_query", sql: customSql }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setQueryResult(json);
      } else {
        setFeedback({ type: "error", message: json.error || "Query failed" });
        setQueryResult(null);
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const wranglerSnippet = `// wrangler.jsonc
{
  "name": "mmusmanlab",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "mmusmanlab-db",
      "database_id": "mmusmanlab-db"
    }
  ],
  "r2_buckets": [
    {
      "binding": "R2_ASSETS",
      "bucket_name": "mmusmanlab-assets"
    }
  ]
}`;

  const copyWrangler = () => {
    navigator.clipboard.writeText(wranglerSnippet);
    setCopiedWrangler(true);
    setTimeout(() => setCopiedWrangler(false), 2000);
  };

  const copyCliCommand = () => {
    navigator.clipboard.writeText("npx wrangler d1 execute mmusmanlab-db --file=./schema.sql --remote");
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const status = d1Data?.status;
  const stats = d1Data?.stats;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight">
              Cloudflare D1 Database
            </h1>
            <Badge variant="outline" className="border-primary/40 text-primary font-mono text-xs px-2.5 py-0.5">
              mmusmanlab-db
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Serverless relational SQLite edge database on Cloudflare with automated data transformation &amp; local image uploads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadD1Status}
            disabled={loading}
            className="rounded-xl font-bold"
          >
            <RefreshCw size={14} className={loading ? "animate-spin mr-1.5" : "mr-1.5"} /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => handleAction("transform_all")}
            disabled={actionLoading === "transform_all"}
            className="rounded-xl font-bold bg-primary text-primary-foreground shadow-sm"
          >
            {actionLoading === "transform_all" ? (
              <RefreshCw size={14} className="animate-spin mr-1.5" />
            ) : (
              <Sparkles size={14} className="mr-1.5" />
            )}
            Transform All Data to D1
          </Button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Database Connection Status Card */}
      <Card className="p-6 md:p-8 rounded-3xl bg-card border-border/70 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Database size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg">Target Database: mmusmanlab-db</h2>
                <Badge
                  variant={status?.connected ? "default" : "destructive"}
                  className="text-[11px] font-bold"
                >
                  {status?.connected ? "ACTIVE & READY" : "DISCONNECTED"}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                  MODE: {status?.mode?.toUpperCase() || "ACTIVE"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {status?.message || "Cloudflare D1 client active and operational."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("migrate")}
              disabled={actionLoading === "migrate"}
              className="rounded-xl text-xs font-bold"
            >
              {actionLoading === "migrate" ? (
                <RefreshCw size={12} className="animate-spin mr-1.5" />
              ) : (
                <Play size={12} className="mr-1.5" />
              )}
              Run Schema Migration
            </Button>
            <Button
              size="sm"
              onClick={() => handleAction("transform_all")}
              disabled={actionLoading === "transform_all"}
              className="rounded-xl text-xs font-bold bg-primary text-primary-foreground"
            >
              <Layers size={12} className="mr-1.5" />
              Transform Existing Data
            </Button>
          </div>
        </div>

        {/* Live Status Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-border/50">
          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40">
            <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Articles
            </div>
            <div className="text-2xl font-black mt-1 text-foreground">
              {stats?.articles ?? 0} <span className="text-xs font-normal text-muted-foreground">rows</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40">
            <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Projects
            </div>
            <div className="text-2xl font-black mt-1 text-foreground">
              {stats?.projects ?? 0} <span className="text-xs font-normal text-muted-foreground">rows</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40">
            <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Inquiries
            </div>
            <div className="text-2xl font-black mt-1 text-foreground">
              {stats?.inquiries ?? 0} <span className="text-xs font-normal text-muted-foreground">rows</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40">
            <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Topics
            </div>
            <div className="text-2xl font-black mt-1 text-foreground">
              {stats?.topics ?? 0} <span className="text-xs font-normal text-muted-foreground">rows</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40">
            <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Audit Runs
            </div>
            <div className="text-2xl font-black mt-1 text-foreground">
              {stats?.runs ?? 0} <span className="text-xs font-normal text-muted-foreground">rows</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Storage & Image Upload Strategy Architecture */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Local Storage Driver (Active Now) */}
        <Card className="p-6 rounded-3xl bg-card border-border/70 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <HardDrive size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base">Local Image Storage (Active Now)</h3>
                <p className="text-[11px] text-muted-foreground">Driver: <code>/public/uploads</code></p>
              </div>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
              ACTIVE
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            All project screenshots, architecture diagrams, and WYSIWYG editor media are saved directly to local storage at zero cost with no billing required.
          </p>

          <div className="p-3 rounded-2xl bg-muted/20 border border-border/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ImageIcon size={14} className="text-emerald-400" />
              <span className="font-semibold text-foreground">Uploads Directory:</span>
              <code className="text-muted-foreground text-[11px]">/public/uploads</code>
            </div>
            <span className="font-mono text-emerald-400 font-bold">{uploadsCount} files stored</span>
          </div>
        </Card>

        {/* Cloudflare R2 Storage (Kept for Future) */}
        <Card className="p-6 rounded-3xl bg-card border-border/70 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Cloud size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base">Cloudflare R2 (Future Step)</h3>
                <p className="text-[11px] text-muted-foreground">Bucket: <code>mmusmanlab-assets</code></p>
              </div>
            </div>
            <Badge variant="outline" className="text-muted-foreground border-border/80 text-[10px] font-bold">
              PENDING BILLING
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Kept on standby. Cloudflare requires an active billing method on your account before enabling R2 bucket provisioning. When you enable billing later, R2 seamlessly activates via <code>cloudflareR2Adapter</code> without touching code.
          </p>

          <div className="p-3 rounded-2xl bg-neutral-950 font-mono text-[11px] text-neutral-300 flex items-center justify-between">
            <span className="truncate">Driver Binding: R2_ASSETS</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={copyWrangler}
              className="h-6 text-[11px] px-2 text-neutral-400 hover:text-white"
            >
              {copiedWrangler ? "Copied" : "Copy Config"}
            </Button>
          </div>
        </Card>
      </div>

      {/* SQL Query Console */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={20} className="text-primary" />
            <h2 className="font-headline text-xl font-bold">D1 Interactive SQL Console</h2>
          </div>
          <span className="text-xs text-muted-foreground">Direct query execution on mmusmanlab-db</span>
        </div>

        <Card className="p-6 rounded-3xl bg-neutral-950 border border-border/80 text-neutral-200 space-y-4">
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-neutral-800 text-xs font-mono">
            <span className="text-neutral-400 font-sans font-semibold">Preset Queries:</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCustomSql("SELECT id, slug, title, status FROM articles ORDER BY published_at DESC LIMIT 5;")}
              className="h-7 text-xs px-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
            >
              Latest Articles
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCustomSql("SELECT id, name, category, technologies FROM projects LIMIT 5;")}
              className="h-7 text-xs px-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
            >
              Projects List
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCustomSql("SELECT id, name, email, project_type, created_at FROM contact_inquiries LIMIT 5;")}
              className="h-7 text-xs px-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
            >
              Contact Inquiries
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCustomSql("SELECT id, topic, tech_stack, used FROM article_topics LIMIT 5;")}
              className="h-7 text-xs px-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
            >
              Topics
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCustomSql("SELECT count(*) as total_articles FROM articles;")}
              className="h-7 text-xs px-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
            >
              Count Articles
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={customSql}
              onChange={(e) => setCustomSql(e.target.value)}
              placeholder="SELECT * FROM articles WHERE status = 'published' LIMIT 5;"
              className="font-mono text-xs bg-neutral-900 border-neutral-800 text-neutral-200 h-11 rounded-xl"
            />
            <Button
              onClick={handleRunQuery}
              disabled={actionLoading === "query"}
              className="h-11 px-6 rounded-xl font-bold bg-primary text-primary-foreground shrink-0"
            >
              {actionLoading === "query" ? (
                <RefreshCw size={14} className="animate-spin mr-1.5" />
              ) : (
                <Play size={14} className="mr-1.5" />
              )}
              Run SQL
            </Button>
          </div>

          {/* Results Display */}
          {queryResult && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-mono">
                  Rows returned: {queryResult.results?.length ?? 0}
                </span>
                {queryResult.meta?.latencyMs !== undefined && (
                  <span className="font-mono text-[11px] text-emerald-400">
                    Execution Time: {queryResult.meta.latencyMs}ms
                  </span>
                )}
              </div>
              <pre className="p-4 rounded-xl bg-neutral-900 overflow-x-auto text-xs font-mono text-neutral-200 max-h-72 leading-relaxed">
                <code>{JSON.stringify(queryResult.results, null, 2)}</code>
              </pre>
            </div>
          )}
        </Card>
      </section>

      {/* Cloudflare Setup Guide & Commands */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* CLI execution commands */}
        <Card className="p-6 md:p-7 rounded-3xl bg-card border-border/70 space-y-4">
          <div className="flex items-center gap-2">
            <Code2 size={20} className="text-primary" />
            <h3 className="font-bold text-base">Cloudflare D1 CLI Execution</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Execute migrations or queries directly against your remote Cloudflare D1 database via Wrangler CLI:
          </p>

          <div className="p-3.5 rounded-2xl bg-neutral-950 font-mono text-xs text-neutral-300 flex items-center justify-between gap-3">
            <span className="truncate">npx wrangler d1 execute mmusmanlab-db --file=./schema.sql --remote</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={copyCliCommand}
              className="h-7 w-7 p-0 shrink-0 text-neutral-400 hover:text-white"
            >
              {copiedSchema ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </Button>
          </div>

          <div className="space-y-2 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Full schema file generated at <code>/schema.sql</code></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Includes indexes on <code>slug</code>, <code>status</code>, and <code>published_at</code></span>
            </div>
          </div>
        </Card>

        {/* Cloudflare Deployment Readiness */}
        <Card className="p-6 md:p-7 rounded-3xl bg-card border-border/70 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-500" />
              <h3 className="font-bold text-base">Full-Stack Production Ready</h3>
            </div>
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
              Configured
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Both the application stores and the Cloudflare D1 adapters are decoupled. Your app reads from and writes to <code>mmusmanlab-db</code>, with graceful fallbacks and automatic synchronization.
          </p>

          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/50 space-y-1.5 text-xs">
            <div className="font-semibold text-foreground flex items-center gap-2">
              <Database size={14} className="text-primary" />
              Database: <code>mmusmanlab-db</code>
            </div>
            <p className="text-muted-foreground text-[11px]">
              Schema covers articles, projects, inquiries, topics, and audit runs with foreign-safe relational keys.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
