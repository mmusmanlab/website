"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Layers,
  BookOpen,
  Sparkles,
  Layout,
  Mail,
  BarChart3,
  Settings,
  Lock,
  LogOut,
  ExternalLink,
  Menu,
  X,
  RefreshCw,
  Database,
  Cloud,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Layers, exact: true },
  { href: "/dashboard/articles", label: "Articles", icon: BookOpen },
  { href: "/dashboard/approval", label: "AI Approval Queue", icon: Sparkles },
  { href: "/dashboard/projects", label: "Projects", icon: Layout },
  { href: "/dashboard/messages", label: "Inquiries", icon: Mail },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings & Cloudflare", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/dashboard/auth");
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
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
    } catch (err: any) {
      setLoginError(err.message || "Invalid passkey.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/dashboard/auth", { method: "DELETE" });
    setIsAuthenticated(false);
    router.push("/dashboard");
  };

  // Login Gate
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-card border-primary/20 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
              <Lock size={32} />
            </div>
            <h1 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight">
              Command Center
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Private website &amp; content management for Muhammad M. Usman.
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

            <div className="text-center">
              <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                ← Return to Public Portfolio
              </Link>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <RefreshCw className="animate-spin text-primary mx-auto" size={32} />
          <p className="text-muted-foreground text-sm font-medium">Authenticating dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border/80 bg-card sticky top-0 z-40">
        <Link href="/dashboard" className="font-headline text-xl font-extrabold">
          MM<span className="text-primary">Usman</span>
          <span className="text-xs font-mono font-normal text-muted-foreground ml-2">Admin</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </Button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card/95 md:bg-card border-r border-border/70 flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-1/0 md:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-border/60 flex items-center justify-between">
          <Link href="/dashboard" className="font-headline text-2xl font-extrabold tracking-tight">
            MM<span className="text-primary">Usman</span>
            <span className="text-[11px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">
              HUB
            </span>
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-1 text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={18} className={isActive ? "" : "text-primary"} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Cloudflare Readiness & Footer Actions */}
        <div className="p-4 border-t border-border/60 space-y-3 bg-muted/10">
          <div className="p-3 rounded-xl bg-card border border-border/50 text-[11px] space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-foreground">
              <Database size={13} className="text-primary" /> D1 &amp; R2 Ready
            </div>
            <p className="text-muted-foreground leading-snug">
              Schema adapters structured for Cloudflare D1 SQL &amp; R2 bucket uploads.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1 h-9 rounded-xl text-xs font-bold"
            >
              <Link href="/" target="_blank">
                <ExternalLink size={12} className="mr-1.5" /> Live Site
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-9 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10"
              title="Logout"
            >
              <LogOut size={14} />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar on desktop */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 border-b border-border/60 bg-card/40 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <span>mmusmanlab.vercel.app</span>
            <span>/</span>
            <span className="text-foreground font-bold">{pathname}</span>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 text-xs py-1">
              Production Active
            </Badge>
            <Button variant="ghost" size="sm" asChild className="rounded-xl text-xs font-bold">
              <Link href="/" target="_blank">
                <ExternalLink size={13} className="mr-1.5" /> Visit Public Portfolio
              </Link>
            </Button>
          </div>
        </div>

        {/* Route Page Container */}
        <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
