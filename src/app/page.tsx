"use client";

import Link from "next/link";
import { projects, skills } from "@/app/lib/data";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code2, Globe, Terminal, Layers, ShieldCheck } from "lucide-react";

export default function Home() {
  const featuredProjects = projects.slice(0, 3);
  
  const skillIcons = {
    Frontend: <Globe size={20} />,
    Backend: <Terminal size={20} />,
    Mobile: <Code2 size={20} />,
    Tools: <Layers size={20} />,
  };

  const skillCategories = ["Frontend", "Backend", "Mobile", "Tools"] as const;

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20 md:pb-32">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-24 lg:pt-32 pb-8 md:pb-16">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-bold border border-primary/20 bg-primary/5 text-primary rounded-full">
            Full-Stack Software Engineer
          </Badge>
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-extrabold mb-8 tracking-tight leading-[1.1] md:leading-tight">
            Muhammad <span className="gradient-text">M. Usman</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-10 leading-relaxed max-w-3xl mx-auto">
            A results-driven Full-Stack Software Engineer specializing in the architecture of modern web and mobile ecosystems. Muhammad leverages a hybrid perspective—bridging advanced JavaScript technologies with a deep understanding of technical systems infrastructure to deliver scalable, secure, and user-centric solutions.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Badge variant="outline" className="bg-background/50 border-muted-foreground/20 text-muted-foreground px-3 py-1 flex gap-2 items-center">
              <ShieldCheck size={14} /> Systems Thinking
            </Badge>
            <Badge variant="outline" className="bg-background/50 border-muted-foreground/20 text-muted-foreground px-3 py-1">
              Currently pursuing B.Sc (Ed) – Computer Science Education at FCE (Technical) Bichi
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-xl text-sm font-bold shadow-xl shadow-primary/20" asChild>
              <Link href="/projects">
                Explore Portfolio <ArrowRight className="ml-2" size={16} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-xl text-sm font-bold" asChild>
              <Link href="/contact">Consultation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Competencies */}
      <section className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="font-headline text-3xl font-bold mb-4">Core Competencies</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive technology stack designed for high-performance delivery across the digital landscape.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category) => (
            <div key={category} className="glass-card p-8 rounded-[2rem] border border-border/50 flex flex-col gap-5 hover:border-primary/30 transition-all duration-500 group">
              <div className="bg-primary/10 text-primary w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
                {skillIcons[category]}
              </div>
              <div>
                <h3 className="font-headline text-xl font-bold mb-3">{category} Engineering</h3>
                <div className="flex flex-wrap gap-2">
                  {skills
                    .filter((s) => s.category === category)
                    .map((skill) => (
                      <span key={skill.name} className="text-[11px] font-bold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {skill.name}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold mb-4">Strategic Solutions</h2>
            <p className="text-muted-foreground max-w-md">
              Showcasing projects that demonstrate complex problem-solving and technical excellence.
            </p>
          </div>
          <Button variant="ghost" className="hidden md:flex group p-0 h-auto hover:bg-transparent text-primary hover:text-primary/80 font-bold" asChild>
            <Link href="/projects">
              View Detailed Case Studies <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
