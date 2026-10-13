"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Database,
  Cloud,
  Power,
  Shield,
  Key,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardSettingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedSchema, setCopiedSchema] = useState(false);

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

  const sqlSchema = `-- Cloudflare D1 Database Schema Migration
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  published_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT NOT NULL,
  content TEXT NOT NULL,
  related_projects TEXT NOT NULL,
  sources TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  word_count INTEGER DEFAULT 0,
  difficulty TEXT DEFAULT 'Intermediate',
  reading_time TEXT DEFAULT '5 min read',
  is_automated INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  overview TEXT,
  features TEXT,
  image TEXT NOT NULL,
  technologies TEXT NOT NULL,
  category TEXT NOT NULL,
  last_modified TEXT,
  demo_url TEXT,
  repo_url TEXT
);

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  project_type TEXT,
  company TEXT,
  created_at TEXT NOT NULL
);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const runs = data?.runs || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight">
            Settings &amp; Infrastructure
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            System configuration, automation controls, and Cloudflare D1/R2 migration readiness.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} className="rounded-xl font-bold">
          <RefreshCw size={14} className={loading ? "animate-spin mr-1.5" : "mr-1.5"} /> Refresh
        </Button>
      </div>

      {/* Cloudflare D1 & R2 Readiness */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Database size={22} className="text-primary" />
            <h2 className="font-headline text-2xl font-bold">Cloudflare D1 &amp; R2 Architecture</h2>
          </div>
          <Link href="/dashboard/database">
            <Button size="sm" className="rounded-xl font-bold bg-primary text-primary-foreground">
              Open D1 Console &amp; Tables <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The application data adapters and database interfaces have been decoupled into <code>src/lib/storage-adapters.ts</code>, ready for zero-latency SQL queries on Cloudflare D1 and object uploads on Cloudflare R2.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          <Card className="p-6 rounded-3xl bg-card border-border/70 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-primary/30 text-primary font-bold">
                Cloudflare D1
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-bold">
                SQL Ready
              </Badge>
            </div>
            <h3 className="font-bold text-base">Serverless SQLite / D1 Binding</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Stores published articles, topics pool, contact messages, and project records in high-speed edge tables.
            </p>
            <div className="pt-2 text-[11px] font-mono text-muted-foreground">
              Binding: <code>DB</code> (mmusmanlab-db)
            </div>
          </Card>

          <Card className="p-6 rounded-3xl bg-card border-border/70 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-primary/30 text-primary font-bold">
                Image Storage
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-bold">
                Local Active / R2 Future
              </Badge>
            </div>
            <h3 className="font-bold text-base">Media Uploads &amp; Local Storage</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Images are stored locally in <code>/public/uploads</code> without billing requirements. Cloudflare R2 (<code>mmusmanlab-assets</code>) is reserved for future activation.
            </p>
            <div className="pt-2 text-[11px] font-mono text-muted-foreground">
              Driver: <code>local</code> &bull; R2 Bucket: <code>mmusmanlab-assets</code>
            </div>
          </Card>
        </div>

        {/* SQL Schema Preview */}
        <Card className="p-6 rounded-3xl bg-neutral-950 border border-border/80 text-neutral-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-primary flex items-center gap-1.5 font-mono">
              <Code2 size={14} /> D1 Migration Script (schema.sql)
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={copySql}
              className="h-8 rounded-xl text-xs font-bold bg-neutral-900 border-neutral-800 text-neutral-300"
            >
              {copiedSchema ? <Check size={13} className="mr-1 text-emerald-400" /> : <Copy size={13} className="mr-1" />}
              {copiedSchema ? "Copied" : "Copy SQL"}
            </Button>
          </div>
          <pre className="p-4 rounded-xl bg-neutral-900 overflow-x-auto text-xs font-mono text-neutral-300 leading-relaxed max-h-60 no-scrollbar">
            <code>{sqlSchema}</code>
          </pre>
        </Card>
      </section>

      {/* Automation Controls & Kill Switch */}
      <section className="space-y-4 pt-6 border-t border-border/60">
        <div className="flex items-center gap-2">
          <Power size={22} className="text-primary" />
          <h2 className="font-headline text-2xl font-bold">Automated Publishing &amp; Safety</h2>
        </div>

        <Card className="p-6 md:p-8 rounded-3xl bg-card border-border/70 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base">Emergency Kill Switch</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Controls whether the scheduled cron job is permitted to publish or generate new articles automatically.
              </p>
            </div>
            <Badge
              variant={data?.stats?.generationEnabled ? "default" : "destructive"}
              className="text-xs py-1"
            >
              {data?.stats?.generationEnabled ? "AUTOMATION ACTIVE" : "KILL-SWITCH ENGAGED"}
            </Badge>
          </div>

          <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 text-xs text-muted-foreground space-y-1">
            <div className="font-bold text-foreground">Environment Variable Flag:</div>
            <p className="font-mono">ARTICLE_GENERATION_ENABLED={data?.stats?.generationEnabled ? "true" : "false"}</p>
            <p>Set to <code>false</code> in environment variables to immediately halt automated cycles while preserving all existing content.</p>
          </div>
        </Card>

        {/* Audit Log */}
        <Card className="p-6 rounded-3xl bg-card border-border/70 space-y-4">
          <h3 className="font-bold text-base">Recent Automated Generation Runs</h3>
          {runs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No cron execution history recorded yet.</p>
          ) : (
            <div className="divide-y text-xs">
              {runs.map((r: any, i: number) => (
                <div key={i} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-foreground">{r.topic}</div>
                    <div className="text-muted-foreground text-[11px]">
                      {r.startedAt} · Model: {r.model} {r.score && `· Score: ${r.score}/100`}
                    </div>
                  </div>
                  <Badge
                    variant={r.status === "success" ? "default" : "secondary"}
                    className={`text-[10px] uppercase font-bold ${
                      r.status === "success" ? "bg-emerald-600 text-white" : ""
                    }`}
                  >
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
