import type { Metadata } from "next";
import Link from "next/link";
import { projects, skills } from "@/app/lib/data";
import { articles } from "@/app/lib/articles";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code2, Globe, Terminal, Layers, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Full-Stack Software Engineer Building Web & Mobile Applications",
  description:
    "Muhammad M. Usman builds web, mobile and full-stack applications with Next.js, React, React Native, Expo, TypeScript and Node.js. Explore projects and technical articles.",
  alternates: { canonical: "/" },
};

export default function Home() {
  const featuredProjects = projects.slice(0, 3);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Muhammad M. Usman",
      url: "https://mmusmanlab.vercel.app",
      jobTitle: "Software Engineer",
      knowsAbout: ["Next.js", "React", "React Native", "Expo", "TypeScript", "Node.js"],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "MMUsmanLab",
      url: "https://mmusmanlab.vercel.app",
      description: "Portfolio and project notes of Muhammad M. Usman.",
      author: { "@type": "Person", name: "Muhammad M. Usman" },
    },
  ];
  
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
            Full-Stack Software Engineer Building Web &amp; Mobile Applications
          </h1>
          <p className="font-headline text-2xl font-bold mb-5">Muhammad <span className="gradient-text">M. Usman</span></p>
          <p className="text-muted-foreground text-lg md:text-xl mb-10 leading-relaxed max-w-3xl mx-auto">
            I build web, mobile and full-stack applications using Next.js, React, React Native, Expo, TypeScript and Node.js. My projects include retail e-commerce, household budgeting, educational platforms and technical systems.
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
            Technologies I use across web, mobile, backend and systems projects.
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
              Explore project descriptions, features and the technologies used.
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

      <section className="container mx-auto px-6" aria-labelledby="latest-articles-heading">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
          <div>
            <h2 id="latest-articles-heading" className="font-headline text-3xl md:text-4xl font-extrabold mb-4">Latest Articles</h2>
            <p className="text-muted-foreground max-w-md">Notes and case studies based on the projects in this portfolio.</p>
          </div>
          <Button variant="ghost" className="p-0 h-auto text-primary font-bold" asChild>
            <Link href="/articles">Browse all articles <ArrowRight size={18} className="ml-2" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((article) => (
            <article key={article.slug} className="border-t border-border/70 pt-5">
              <p className="text-xs text-muted-foreground mb-3">{article.category} · <time dateTime={article.publishedAt}>{article.publishedAt}</time></p>
              <h3 className="font-headline text-xl font-bold mb-3"><Link className="hover:text-primary" href={`/articles/${article.slug}`}>{article.title}</Link></h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{article.description}</p>
              <Link className="text-sm font-bold text-primary" href={`/articles/${article.slug}`}>Read article <ArrowRight size={14} className="inline ml-1" /></Link>
            </article>
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    </div>
  );
}
