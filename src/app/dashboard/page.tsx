"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  Layout,
  Mail,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Eye,
  RefreshCw,
  Power,
  Search,
  Code2,
  Lock,
  LogOut,
  Sliders,
  Check,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WysiwygEditor } from "@/components/wysiwyg-editor";
import Link from "next/link";

interface ArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  codeBlock?: {
    language: string;
    caption?: string;
    code: string;
  };
}

interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  content: ArticleSection[];
  relatedProjects: string[];
  sources?: Array<{ title: string; url: string }>;
  status: "published" | "draft";
  wordCount: number;
  difficulty?: string;
  readingTime?: string;
  isAutomated?: boolean;
}

interface Project {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  overview?: string;
  features?: string[];
  image: string;
  imageAlt?: string;
  technologies: string[];
  category: "Web" | "Mobile" | "Tool" | "Technical";
  lastModified?: string;
  demoUrl?: string;
  repoUrl?: string;
}

interface TopicSuggestion {
  topic: string;
  category: string;
  score: number;
  decision: string;
  reasons: string[];
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  projectType?: string;
  company?: string;
  createdAt: string;
}

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalProjects: number;
  unreadMessages: number;
  generationEnabled: boolean;
  geminiConfigured: boolean;
}

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data
  const [activeTab, setActiveTab] = useState<"approval" | "articles" | "projects" | "messages" | "runs">("approval");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // AI Discovery state
  const [suggestions, setSuggestions] = useState<TopicSuggestion[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [customCategory, setCustomCategory] = useState("Software Engineering");
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  // Article Edit Modal state
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isEditingNew, setIsEditingNew] = useState(false);

  // Project Edit Modal state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditingNewProject, setIsEditingNewProject] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/dashboard/auth");
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated) {
        loadDashboardData();
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch("/api/dashboard/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: passkeyInput }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      setIsAuthenticated(true);
      setPasskeyInput("");
      loadDashboardData();
    } catch (err: any) {
      setLoginError(err.message || "Invalid passkey.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/dashboard/auth", { method: "DELETE" });
    setIsAuthenticated(false);
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dashboard/data");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setArticles(data.articles || []);
        setProjects(data.projects || []);
        setContactMessages(data.contactMessages || []);
        setRuns(data.runs || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. AI DISCOVERY: Find candidate topics
  const handleDiscoverTopics = async () => {
    setIsDiscovering(true);
    setActionMessage("");
    try {
      const res = await fetch("/api/dashboard/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "discover" }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        setActionMessage(`Discovered ${data.suggestions.length} candidate problem topics.`);
      } else {
        throw new Error(data.error || "Could not discover topics.");
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsDiscovering(false);
    }
  };

  // 2. AI GENERATE DRAFT: Generate a draft for approval
  const handleGenerateDraft = async (topicTitle: string, category: string) => {
    setIsGeneratingDraft(true);
    setActionMessage(`Generating structured draft for: "${topicTitle}"...`);
    try {
      const res = await fetch("/api/dashboard/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-draft",
          topic: topicTitle,
          category,
          relatedProjects: ["praxivon", "amtech-shop"],
        }),
      });
      const data = await res.json();
      if (data.success && data.draft) {
        setActionMessage(`Draft created! It is waiting in the Approval Queue below.`);
        // Reload articles so the draft appears in approval queue
        await loadDashboardData();
        // Remove from suggested list if present
        setSuggestions((prev) => prev.filter((s) => s.topic !== topicTitle));
      } else {
        throw new Error(data.error || "Draft generation failed.");
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  // 3. APPROVE & PUBLISH DRAFT
  const handleApproveDraft = async (article: Article) => {
    setActionMessage(`Publishing '${article.title}'...`);
    try {
      const res = await fetch("/api/dashboard/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          articleData: article,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`'${article.title}' approved and published live!`);
        await loadDashboardData();
        if (editingArticle?.slug === article.slug) {
          setEditingArticle(null);
        }
      } else {
        throw new Error(data.error || "Approval failed.");
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  // 4. REJECT DRAFT
  const handleRejectDraft = async (slug: string) => {
    if (!confirm("Are you sure you want to reject and discard this draft?")) return;
    try {
      const res = await fetch("/api/dashboard/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          articleData: { slug },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage("Draft rejected and removed.");
        await loadDashboardData();
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  // 5. SAVE ARTICLE (Edit or create new)
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    try {
      const res = await fetch("/api/dashboard/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingArticle),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Article '${editingArticle.title}' saved successfully!`);
        setEditingArticle(null);
        await loadDashboardData();
      } else {
        throw new Error(data.error || "Save failed.");
      }
    } catch (err: any) {
      alert(`Error saving article: ${err.message}`);
    }
  };

  // 6. DELETE ARTICLE
  const handleDeleteArticle = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete article with slug: ${slug}?`)) return;
    try {
      const res = await fetch(`/api/dashboard/articles?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage("Article deleted successfully.");
        await loadDashboardData();
      } else {
        throw new Error(data.error || "Delete failed");
      }
    } catch (err: any) {
      alert(`Error deleting article: ${err.message}`);
    }
  };

  // 7. SAVE PROJECT
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      const res = await fetch("/api/dashboard/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProject),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Project '${editingProject.name}' saved successfully!`);
        setEditingProject(null);
        await loadDashboardData();
      } else {
        throw new Error(data.error || "Save failed.");
      }
    } catch (err: any) {
      alert(`Error saving project: ${err.message}`);
    }
  };

  // 8. DELETE PROJECT
  const handleDeleteProject = async (id: string) => {
    if (!confirm(`Are you sure you want to delete project: ${id}?`)) return;
    try {
      const res = await fetch(`/api/dashboard/projects?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage("Project deleted.");
        await loadDashboardData();
      } else {
        throw new Error(data.error || "Delete failed");
      }
    } catch (err: any) {
      alert(`Error deleting project: ${err.message}`);
    }
  };

  // LOGIN SCREEN
  if (isAuthenticated === false) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-card border-primary/20 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
              <Lock size={32} />
            </div>
            <h1 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight">
              Command Center
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Private management dashboard for Muhammad M. Usman.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Enter Dashboard Passkey
              </label>
              <Input
                type="password"
                placeholder="Passkey..."
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                required
                className="h-12 rounded-xl text-base bg-background border-muted-foreground/30 focus:border-primary"
              />
            </div>

            {loginError && (
              <p className="text-xs text-destructive font-medium bg-destructive/10 p-3 rounded-lg">
                {loginError}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
            >
              {isLoggingIn ? "Verifying..." : "Unlock Dashboard"}
            </Button>

            <p className="text-[11px] text-muted-foreground/70 text-center">
              Protected private route. Disallowed in robots.txt.
            </p>
          </form>
        </Card>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="animate-spin text-primary mx-auto" size={32} />
          <p className="text-muted-foreground text-sm font-medium">Checking authorization...</p>
        </div>
      </div>
    );
  }

  const draftArticles = articles.filter((a) => a.status === "draft");
  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 max-w-7xl">
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight">
              Website Management <span className="text-primary">Dashboard</span>
            </h1>
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-xs">
              Live
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Manage articles, projects, contact inquiries, and review AI-generated problem-solving drafts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadDashboardData} className="rounded-xl font-bold">
            <RefreshCw size={14} className={isLoading ? "animate-spin mr-1.5" : "mr-1.5"} /> Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-xl font-bold text-destructive hover:bg-destructive/10">
            <LogOut size={14} className="mr-1.5" /> Logout
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage("")} className="hover:text-foreground">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="p-4 rounded-2xl bg-card border-border/70">
          <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Published Articles</div>
          <div className="text-2xl font-extrabold text-foreground">{stats?.publishedArticles ?? 0}</div>
        </Card>

        <Card className="p-4 rounded-2xl bg-card border-amber-500/30 bg-amber-500/5">
          <div className="text-xs text-amber-400 font-bold uppercase mb-1">Needs Approval</div>
          <div className="text-2xl font-extrabold text-amber-400">{stats?.draftArticles ?? 0}</div>
        </Card>

        <Card className="p-4 rounded-2xl bg-card border-border/70">
          <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Projects</div>
          <div className="text-2xl font-extrabold text-foreground">{stats?.totalProjects ?? 0}</div>
        </Card>

        <Card className="p-4 rounded-2xl bg-card border-border/70">
          <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Inquiries</div>
          <div className="text-2xl font-extrabold text-foreground">{stats?.unreadMessages ?? 0}</div>
        </Card>

        <Card className="p-4 rounded-2xl bg-card border-border/70">
          <div className="text-xs text-muted-foreground font-medium uppercase mb-1">AI Engine</div>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-1">
            <CheckCircle2 size={14} /> Ready
          </div>
        </Card>

        <Card className="p-4 rounded-2xl bg-card border-border/70">
          <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Automation</div>
          <div className="text-sm font-bold text-primary flex items-center gap-1 mt-1">
            <Power size={14} /> {stats?.generationEnabled ? "Enabled" : "Paused"}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
        <button
          onClick={() => setActiveTab("approval")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === "approval"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Sparkles size={16} /> AI Discovery &amp; Approval Queue
          {draftArticles.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 text-xs flex items-center justify-center font-extrabold">
              {draftArticles.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("articles")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === "articles"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <BookOpen size={16} /> All Articles ({articles.length})
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === "projects"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Layout size={16} /> Projects ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab("messages")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === "messages"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Mail size={16} /> Contact Inquiries ({contactMessages.length})
        </button>

        <button
          onClick={() => setActiveTab("runs")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === "runs"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Sliders size={16} /> Cron Runs &amp; Logs
        </button>
      </div>

      {/* TAB 1: AI DISCOVERY & APPROVAL QUEUE */}
      {activeTab === "approval" && (
        <div className="space-y-10">
          {/* Section A: Drafts Needing Approval */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
                  <Clock className="text-amber-400" size={22} />
                  Pending Articles Needing Review &amp; Approval ({draftArticles.length})
                </h2>
                <p className="text-muted-foreground text-sm">
                  Generated or submitted draft articles. Review, edit sections or code snippets, then approve to publish live on the website.
                </p>
              </div>
            </div>

            {draftArticles.length === 0 ? (
              <Card className="p-8 text-center rounded-2xl bg-muted/20 border-dashed border-2">
                <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-2" />
                <h3 className="font-bold text-base">Approval Queue is Clear</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mt-1">
                  All articles are either published or none are currently in draft. Use the discovery section below to evaluate a new topic and generate a draft.
                </p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {draftArticles.map((draft) => (
                  <Card key={draft.slug} className="p-6 rounded-2xl bg-card border-amber-500/40 shadow-lg relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b pb-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                            Draft · Needs Approval
                          </Badge>
                          <span className="text-xs text-muted-foreground font-semibold">{draft.category}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{draft.readingTime}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{draft.wordCount} words</span>
                        </div>
                        <h3 className="font-headline text-xl md:text-2xl font-bold text-foreground">
                          {draft.title}
                        </h3>
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">/articles/{draft.slug}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingArticle(draft);
                            setIsEditingNew(false);
                          }}
                          className="rounded-xl font-bold flex items-center gap-1.5"
                        >
                          <Edit3 size={14} /> Adjust Content
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveDraft(draft)}
                          className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                        >
                          <Check size={14} /> Approve &amp; Publish Live
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRejectDraft(draft.slug)}
                          className="rounded-xl font-bold text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 size={14} /> Reject
                        </Button>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {draft.description}
                    </p>

                    {/* Section headings preview */}
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-xs space-y-2">
                      <div className="font-bold text-foreground uppercase tracking-wider text-[10px]">
                        Included Sections &amp; Solutions ({draft.content.length}):
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2 text-muted-foreground">
                        {draft.content.map((sec, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span className="truncate font-medium">{sec.heading}</span>
                            {sec.codeBlock && (
                              <Badge variant="outline" className="text-[9px] py-0 px-1 border-primary/30 text-primary">
                                {sec.codeBlock.language}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Section B: Problem Discovery & Topic Generator */}
          <section className="space-y-6 pt-6 border-t">
            <div>
              <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
                <Sparkles className="text-primary" size={22} />
                Discover Fresh Technical Problems &amp; Generate Drafts
              </h2>
              <p className="text-muted-foreground text-sm">
                Evaluates candidate problems against Muhammad M. Usman&apos;s stack (Next.js, React Native, TypeScript, Node.js) with scoring and duplicate prevention.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Brainstorming or custom topic */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="p-6 rounded-2xl bg-card border-border/70 space-y-4">
                  <h3 className="font-bold text-base">Custom Problem or Topic Idea</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                        Topic / Problem Title
                      </label>
                      <Input
                        placeholder="e.g. Next.js 15: Resolving Route Handler streaming timeout on Vercel..."
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        className="rounded-xl text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                        Category
                      </label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full h-10 bg-background border border-muted-foreground/30 rounded-xl px-3 text-sm"
                      >
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Backend Engineering">Backend Engineering</option>
                      </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        disabled={!customTopic || isGeneratingDraft}
                        onClick={() => handleGenerateDraft(customTopic, customCategory)}
                        className="w-full rounded-xl font-bold"
                      >
                        {isGeneratingDraft ? "Generating Draft..." : "Generate Draft for Approval"}
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                  <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <Sparkles size={16} /> Automated Topic Explorer
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Query the AI discovery engine to evaluate real developer challenges and generate scored topic candidates.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDiscoverTopics}
                    disabled={isDiscovering}
                    className="w-full rounded-xl font-bold"
                  >
                    {isDiscovering ? (
                      <>
                        <RefreshCw className="animate-spin mr-1.5" size={14} /> Scanning Topics...
                      </>
                    ) : (
                      <>Discover Candidate Topics</>
                    )}
                  </Button>
                </Card>
              </div>

              {/* Right Column: Suggested Candidate Topics with Scores */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="font-bold text-base flex items-center justify-between">
                  <span>Candidate Topics Pool</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {suggestions.length} available
                  </span>
                </h3>

                {suggestions.length === 0 ? (
                  <Card className="p-8 text-center rounded-2xl bg-muted/20 border-dashed border">
                    <p className="text-muted-foreground text-sm">
                      Click &quot;Discover Candidate Topics&quot; to populate suggestions with real-time opportunity scores.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {suggestions.map((item, idx) => (
                      <Card key={idx} className="p-5 rounded-2xl bg-card border-border/70 hover:border-primary/40 transition-colors space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={item.score >= 75 ? "default" : "secondary"}
                                className={`text-[10px] uppercase font-bold ${
                                  item.score >= 75 ? "bg-emerald-600 text-white" : ""
                                }`}
                              >
                                {item.decision} ({item.score}/100)
                              </Badge>
                              <span className="text-xs font-semibold text-primary">{item.category}</span>
                            </div>
                            <h4 className="font-bold text-base text-foreground leading-snug">{item.topic}</h4>
                          </div>

                          <Button
                            size="sm"
                            disabled={isGeneratingDraft}
                            onClick={() => handleGenerateDraft(item.topic, item.category)}
                            className="rounded-xl font-bold shrink-0 text-xs"
                          >
                            Generate Draft
                          </Button>
                        </div>

                        {item.reasons && (
                          <div className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3 space-y-0.5">
                            {item.reasons.map((r, ri) => (
                              <div key={ri}>{r}</div>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: ALL ARTICLES MANAGER */}
      {activeTab === "articles" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3 text-muted-foreground" size={16} />
              <Input
                placeholder="Search articles by title, tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl text-sm"
              />
            </div>

            <Button
              onClick={() => {
                setEditingArticle({
                  id: `art-${Date.now()}`,
                  slug: "",
                  title: "",
                  description: "",
                  publishedAt: new Date().toISOString().split("T")[0],
                  updatedAt: new Date().toISOString().split("T")[0],
                  category: "Software Engineering",
                  tags: ["TypeScript", "Next.js"],
                  difficulty: "Intermediate",
                  readingTime: "5 min read",
                  wordCount: 600,
                  status: "published",
                  content: [
                    {
                      heading: "Problem Overview",
                      paragraphs: ["Describe the technical issue here..."],
                    },
                  ],
                  relatedProjects: ["praxivon"],
                });
                setIsEditingNew(true);
              }}
              className="rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-primary/20"
            >
              <Plus size={16} /> Create New Article
            </Button>
          </div>

          <div className="divide-y border rounded-2xl bg-card overflow-hidden">
            {filteredArticles.map((art) => (
              <div key={art.slug} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
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
                    <span className="text-xs font-semibold text-primary">{art.category}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{art.publishedAt}</span>
                    {art.isAutomated && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground py-0">
                        AI Structured
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{art.title}</h3>
                  <p className="text-xs text-muted-foreground font-mono">/articles/{art.slug}</p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="rounded-xl font-bold text-xs"
                  >
                    <Link href={`/articles/${art.slug}`} target="_blank">
                      <Eye size={14} className="mr-1" /> View Live
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingArticle(art);
                      setIsEditingNew(false);
                    }}
                    className="rounded-xl font-bold text-xs"
                  >
                    <Edit3 size={14} className="mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteArticle(art.slug)}
                    className="rounded-xl font-bold text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROJECTS MANAGER */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-sm">
              Portfolio projects showcasing technical work in web, mobile, and systems engineering.
            </p>
            <Button
              onClick={() => {
                setEditingProject({
                  id: `new-project-${Date.now().toString().slice(-4)}`,
                  name: "",
                  shortDescription: "",
                  fullDescription: "",
                  overview: "",
                  category: "Web",
                  technologies: ["Next.js", "TypeScript"],
                  features: ["Core Feature 1"],
                  image: "https://picsum.photos/seed/project/800/600",
                });
                setIsEditingNewProject(true);
              }}
              className="rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-primary/20"
            >
              <Plus size={16} /> Add New Project
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <Card key={proj.id} className="p-6 rounded-2xl bg-card border-border/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs text-primary border-primary/30">
                      {proj.category}
                    </Badge>
                    <span className="text-[11px] font-mono text-muted-foreground">{proj.id}</span>
                  </div>
                  <h3 className="font-headline text-xl font-bold mb-2">{proj.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                    {proj.shortDescription}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.technologies.slice(0, 3).map((t) => (
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
                    Live Page <ExternalLink size={12} />
                  </Link>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingProject(proj);
                        setIsEditingNewProject(false);
                      }}
                      className="rounded-xl h-8 px-2 font-bold text-xs"
                    >
                      <Edit3 size={14} className="mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteProject(proj.id)}
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
      )}

      {/* TAB 4: CONTACT INQUIRIES */}
      {activeTab === "messages" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-headline text-xl font-bold">
              Received Client &amp; Project Inquiries ({contactMessages.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Stored securely on server.
            </p>
          </div>

          {contactMessages.length === 0 ? (
            <Card className="p-10 text-center rounded-2xl bg-muted/20 border-dashed border">
              <Mail size={36} className="text-muted-foreground mx-auto mb-2" />
              <h3 className="font-bold text-base">No Inquiries Yet</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mt-1">
                Messages submitted through the contact form will appear here with sender details and project requirements.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {contactMessages.map((msg) => (
                <Card key={msg.id} className="p-6 rounded-2xl bg-card border-border/70 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                    <div>
                      <h4 className="font-bold text-base text-foreground">{msg.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <a href={`mailto:${msg.email}`} className="text-primary hover:underline font-medium">
                          {msg.email}
                        </a>
                        {msg.company && msg.company !== "N/A" && (
                          <>
                            <span>·</span>
                            <span>{msg.company}</span>
                          </>
                        )}
                        {msg.projectType && (
                          <>
                            <span>·</span>
                            <Badge variant="secondary" className="text-[10px] py-0 px-2">
                              {msg.projectType}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <time className="text-xs text-muted-foreground font-medium">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "Recent"}
                    </time>
                  </div>

                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/40 font-normal">
                    {msg.message}
                  </p>

                  <div className="flex justify-end pt-2">
                    <Button size="sm" variant="outline" asChild className="rounded-xl font-bold text-xs">
                      <a href={`mailto:${msg.email}?subject=RE: Project Inquiry`}>
                        Reply via Email <ArrowRight size={12} className="ml-1.5" />
                      </a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CRON RUNS & SYSTEM LOGS */}
      {activeTab === "runs" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base">Automated Daily Article Publishing</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Triggered via secure endpoint <code>/api/cron/generate-article</code> with CRON_SECRET.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={stats?.generationEnabled ? "default" : "destructive"} className="text-xs">
                {stats?.generationEnabled ? "Automation Active" : "Kill Switch Active"}
              </Badge>
            </div>
          </div>

          <Card className="p-6 rounded-2xl bg-card border-border/70 space-y-4">
            <h3 className="font-bold text-base">Recent Automated Generation Runs</h3>
            {runs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cron execution history recorded yet.</p>
            ) : (
              <div className="divide-y text-xs">
                {runs.map((run, i) => (
                  <div key={i} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-foreground">{run.topic}</div>
                      <div className="text-muted-foreground">
                        {run.startedAt} · Model: {run.model}
                        {run.score && ` · Score: ${run.score}/100`}
                      </div>
                    </div>
                    <Badge
                      variant={run.status === "success" ? "default" : "secondary"}
                      className={`uppercase text-[10px] ${
                        run.status === "success" ? "bg-emerald-600 text-white" : ""
                      }`}
                    >
                      {run.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* MODAL: EDIT OR ADJUST ARTICLE */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 rounded-3xl bg-background border shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="font-headline text-2xl font-bold">
                  {isEditingNew ? "Create New Article" : "Adjust Article & Review"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Review and adjust technical content, code snippets, and metadata before saving or publishing.
                </p>
              </div>
              <button onClick={() => setEditingArticle(null)} className="p-2 hover:bg-muted rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Title *</label>
                  <Input
                    value={editingArticle.title}
                    onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                    required
                    className="rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Slug *</label>
                  <Input
                    value={editingArticle.slug}
                    onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                    required
                    className="rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <WysiwygEditor
                label="Article Overview & Description *"
                value={editingArticle.description}
                onChange={(val) => setEditingArticle({ ...editingArticle, description: val })}
                placeholder="Write a clear summary of the engineering challenge and key takeaway..."
                minHeight="80px"
                helperText="Formatted summary shown on article cards and search metadata."
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Category</label>
                  <Input
                    value={editingArticle.category}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    className="rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Difficulty</label>
                  <select
                    value={editingArticle.difficulty || "Intermediate"}
                    onChange={(e) => setEditingArticle({ ...editingArticle, difficulty: e.target.value })}
                    className="w-full h-10 bg-background border border-muted-foreground/30 rounded-xl px-3 text-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Status</label>
                  <select
                    value={editingArticle.status}
                    onChange={(e) =>
                      setEditingArticle({
                        ...editingArticle,
                        status: e.target.value as "published" | "draft",
                      })
                    }
                    className="w-full h-10 bg-background border border-muted-foreground/30 rounded-xl px-3 text-sm font-bold text-primary"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (In Review)</option>
                  </select>
                </div>
              </div>

              {/* Sections Editor */}
              <div className="space-y-4 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-foreground">Content Sections ({editingArticle.content.length})</label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingArticle({
                        ...editingArticle,
                        content: [
                          ...editingArticle.content,
                          { heading: "New Section", paragraphs: ["Enter content..."] },
                        ],
                      });
                    }}
                    className="rounded-xl text-xs"
                  >
                    <Plus size={12} className="mr-1" /> Add Section
                  </Button>
                </div>

                <div className="space-y-5">
                  {editingArticle.content.map((sec, sIdx) => (
                    <div key={sIdx} className="p-5 rounded-2xl border bg-muted/10 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <Input
                          placeholder="Section Heading"
                          value={sec.heading}
                          onChange={(e) => {
                            const newContent = [...editingArticle.content];
                            newContent[sIdx].heading = e.target.value;
                            setEditingArticle({ ...editingArticle, content: newContent });
                          }}
                          className="font-bold text-sm bg-background"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newContent = editingArticle.content.filter((_, i) => i !== sIdx);
                            setEditingArticle({ ...editingArticle, content: newContent });
                          }}
                          className="text-destructive hover:bg-destructive/10 p-2 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <WysiwygEditor
                        label={`Section ${sIdx + 1} Body & Formatting`}
                        value={[...sec.paragraphs, ...(sec.bullets ? sec.bullets.map((b) => `- ${b}`) : [])].join("\n\n")}
                        onChange={(val) => {
                          const newContent = [...editingArticle.content];
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

                          newContent[sIdx].paragraphs = paragraphs.length > 0 ? paragraphs : [val];
                          if (bullets.length > 0) {
                            newContent[sIdx].bullets = bullets;
                          } else {
                            delete newContent[sIdx].bullets;
                          }
                          setEditingArticle({ ...editingArticle, content: newContent });
                        }}
                        placeholder="Write or format this section's technical explanation, root causes, diagnosis steps, or architectural reasoning..."
                        minHeight="140px"
                        helperText="Use toolbar for bold, italic, headings, bullet lists, blockquotes, and links."
                      />

                      {/* Code Block Integration */}
                      <div className="pt-1">
                        {sec.codeBlock ? (
                          <div className="p-3.5 rounded-xl border border-border/80 bg-neutral-950 text-neutral-200 space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold flex items-center gap-1.5 text-primary">
                                <Code2 size={14} /> Production Code Solution
                              </span>
                              <div className="flex items-center gap-2">
                                <select
                                  value={sec.codeBlock.language}
                                  onChange={(e) => {
                                    const newContent = [...editingArticle.content];
                                    if (newContent[sIdx].codeBlock) {
                                      newContent[sIdx].codeBlock!.language = e.target.value;
                                      setEditingArticle({ ...editingArticle, content: newContent });
                                    }
                                  }}
                                  className="bg-neutral-900 border border-neutral-800 rounded px-2 py-0.5 text-[11px] text-neutral-300 outline-none"
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
                                    const newContent = [...editingArticle.content];
                                    delete newContent[sIdx].codeBlock;
                                    setEditingArticle({ ...editingArticle, content: newContent });
                                  }}
                                  className="text-neutral-400 hover:text-destructive text-xs"
                                >
                                  Remove Code Block
                                </button>
                              </div>
                            </div>
                            <Input
                              placeholder="Caption / Description (e.g. Memoized list handler)"
                              value={sec.codeBlock.caption || ""}
                              onChange={(e) => {
                                const newContent = [...editingArticle.content];
                                if (newContent[sIdx].codeBlock) {
                                  newContent[sIdx].codeBlock!.caption = e.target.value;
                                  setEditingArticle({ ...editingArticle, content: newContent });
                                }
                              }}
                              className="h-8 text-xs bg-neutral-900 border-neutral-800 text-neutral-300"
                            />
                            <Textarea
                              placeholder="// Paste or write production code here..."
                              value={sec.codeBlock.code}
                              onChange={(e) => {
                                const newContent = [...editingArticle.content];
                                if (newContent[sIdx].codeBlock) {
                                  newContent[sIdx].codeBlock!.code = e.target.value;
                                  setEditingArticle({ ...editingArticle, content: newContent });
                                }
                              }}
                              className="font-mono text-xs min-h-[110px] bg-neutral-900/80 border-neutral-800 text-emerald-400 leading-relaxed"
                            />
                          </div>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newContent = [...editingArticle.content];
                              newContent[sIdx].codeBlock = {
                                language: "tsx",
                                caption: "Solution snippet",
                                code: "// Add production code snippet\n",
                              };
                              setEditingArticle({ ...editingArticle, content: newContent });
                            }}
                            className="text-xs text-primary hover:bg-primary/10 rounded-lg h-7 px-2.5"
                          >
                            <Code2 size={13} className="mr-1" /> + Add Code Block to Section
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setEditingArticle(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    handleApproveDraft(editingArticle);
                  }}
                  className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Check size={14} className="mr-1" /> Approve &amp; Publish Live
                </Button>
                <Button type="submit" className="rounded-xl font-bold">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: EDIT OR CREATE PROJECT */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 rounded-3xl bg-background border shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="font-headline text-2xl font-bold">
                {isEditingNewProject ? "Add New Project" : "Edit Project"}
              </h3>
              <button onClick={() => setEditingProject(null)} className="p-2 hover:bg-muted rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Project Name *</label>
                  <Input
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                    required
                    className="rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Project ID (slug) *</label>
                  <Input
                    value={editingProject.id}
                    onChange={(e) => setEditingProject({ ...editingProject, id: e.target.value })}
                    required
                    className="rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Category</label>
                <select
                  value={editingProject.category}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      category: e.target.value as "Web" | "Mobile" | "Tool" | "Technical",
                    })
                  }
                  className="w-full h-10 bg-background border border-muted-foreground/30 rounded-xl px-3 text-sm"
                >
                  <option value="Web">Web</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Technical">Technical</option>
                  <option value="Tool">Tool</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Short Description *</label>
                <Textarea
                  value={editingProject.shortDescription}
                  onChange={(e) => setEditingProject({ ...editingProject, shortDescription: e.target.value })}
                  required
                  className="rounded-xl text-sm min-h-[60px]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Full Description *</label>
                <Textarea
                  value={editingProject.fullDescription}
                  onChange={(e) => setEditingProject({ ...editingProject, fullDescription: e.target.value })}
                  required
                  className="rounded-xl text-sm min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Technologies (comma separated)</label>
                <Input
                  value={editingProject.technologies.join(", ")}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Screenshot Image URL</label>
                <Input
                  value={editingProject.image}
                  onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
                  className="rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setEditingProject(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl font-bold">
                  Save Project
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
