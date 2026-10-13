import type { Metadata } from "next";
import Link from "next/link";
import { projects, skills } from "@/app/lib/data";
import { getPublishedArticles } from "@/lib/articles-store";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Code2,
  Globe,
  Terminal,
  Layers,
  Sparkles,
  Smartphone,
  Server,
  Wrench,
  CheckCircle,
  Briefcase,
  BookOpen,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Muhammad M. Usman — Full-Stack Software Engineer",
  description:
    "Muhammad M. Usman builds web, mobile and backend applications with Next.js, React, React Native, Expo, TypeScript and Node.js. Available for contract development and technical consulting.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const featuredProjects = projects.slice(0, 3);
  const latestArticles = (await getPublishedArticles()).slice(0, 3);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Muhammad M. Usman",
      url: "https://mmusmanlab.vercel.app",
      jobTitle: "Full-Stack Software Engineer",
      knowsAbout: [
        "Next.js",
        "React",
        "React Native",
        "Expo",
        "TypeScript",
        "JavaScript",
        "Node.js",
        "Express",
        "REST APIs",
        "Databases",
        "Software Architecture",
      ],
      alumniOf: "Federal College of Education (Technical) Bichi",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "MMUsmanLab",
      url: "https://mmusmanlab.vercel.app",
      description: "Portfolio, technical knowledge hub, and engineering resources by Muhammad M. Usman.",
      author: { "@type": "Person", name: "Muhammad M. Usman" },
    },
  ];

  const services = [
    {
      icon: <Globe className="text-primary" size={26} />,
      title: "Full-Stack Web Applications",
      description:
        "Building fast, SEO-ready web applications using Next.js, React, TypeScript, and modern Server Actions. Clean user interfaces backed by solid data architecture.",
      deliverables: ["Next.js App Router applications", "Interactive web dashboards", "E-commerce & educational portals"],
    },
    {
      icon: <Smartphone className="text-primary" size={26} />,
      title: "Cross-Platform Mobile Apps",
      description:
        "Developing native-quality Android and iOS applications with React Native and Expo. Seamless offline-first state, push alerts, and snappy mobile performance.",
      deliverables: ["Expo & React Native applications", "App store / Play store preparation", "Smooth device-native integrations"],
    },
    {
      icon: <Server className="text-primary" size={26} />,
      title: "Backend & API Architecture",
      description:
        "Designing scalable REST APIs, database schemas, secure authentication flows, and webhook integrations with Node.js, Express, and structured data stores.",
      deliverables: ["Type-safe API routes & validation", "Database integrations & migrations", "Third-party service integrations"],
    },
    {
      icon: <Wrench className="text-primary" size={26} />,
      title: "Application Modernization & Debugging",
      description:
        "Resolving framework upgrade issues, profiling slow rendering pipelines, fixing state bottlenecks, and modernizing legacy codebases into typed architectures.",
      deliverables: ["Next.js & React version upgrades", "React Native memory & scroll optimization", "Type safety & architectural refactoring"],
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
      <section className="relative overflow-hidden pt-12 md:pt-20 lg:pt-28 pb-8 md:pb-16">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 text-xs font-bold border border-primary/25 bg-primary/10 text-primary rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Available for Client Projects, Contract Development &amp; Consulting
          </div>

          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1] md:leading-tight">
            Full-Stack Software Engineer Building Scalable Web &amp; Mobile Products
          </h1>

          <p className="font-headline text-2xl font-bold mb-5">
            Muhammad <span className="gradient-text">M. Usman</span>
          </p>

          <p className="text-muted-foreground text-lg md:text-xl mb-10 leading-relaxed max-w-3xl mx-auto">
            I help startups, teams, and businesses turn technical requirements into reliable, production-ready software. Specializing in Next.js, React, React Native, Expo, TypeScript, and Node.js.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-xl text-sm font-bold shadow-xl shadow-primary/20" asChild>
              <Link href="/contact">
                Discuss Your Project <ArrowRight className="ml-2" size={16} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-xl text-sm font-bold" asChild>
              <Link href="/projects">Explore Projects</Link>
            </Button>
            <Button size="lg" variant="ghost" className="w-full sm:w-auto h-12 px-6 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground" asChild>
              <Link href="/articles">Read Engineering Articles</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What I Build & Solve (Services / Solutions) */}
      <section className="container mx-auto px-6 py-6" aria-labelledby="services-heading">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-3 border-primary/30 text-primary bg-primary/5 font-bold">
            <Briefcase size={14} className="mr-1.5" /> What I Can Solve For You
          </Badge>
          <h2 id="services-heading" className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Engineering Capabilities &amp; Development Services
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            From initial product architecture to post-launch optimization, here is how I help clients turn software ideas into high-performing reality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="p-8 rounded-3xl bg-card border border-border/70 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  {service.icon}
                </div>
                <h3 className="font-headline text-xl md:text-2xl font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-6">{service.description}</p>
                <div className="space-y-2 mb-6">
                  {service.deliverables.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                      <CheckCircle size={14} className="text-primary shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-border/50">
                <Link href="/contact" className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1.5">
                  Request consultation on this <ArrowRight size={14} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section className="container mx-auto px-6" aria-labelledby="featured-projects-heading">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/30 text-primary bg-primary/5 font-bold">
              <Sparkles size={14} className="mr-1.5" /> Working Evidence
            </Badge>
            <h2 id="featured-projects-heading" className="font-headline text-3xl md:text-4xl font-extrabold mb-4">
              Featured Software Projects
            </h2>
            <p className="text-muted-foreground max-w-xl text-base md:text-lg">
              Explore concrete examples of applications I have built across web, mobile, and technical systems.
            </p>
          </div>
          <Button variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80 font-bold group" asChild>
            <Link href="/projects">
              Browse all projects <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* Core Competencies */}
      <section className="container mx-auto px-6 py-6" aria-labelledby="competencies-heading">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2 id="competencies-heading" className="font-headline text-3xl font-bold mb-4">
            Core Technology Stack
          </h2>
          <p className="text-muted-foreground">
            Technologies I actively apply across modern frontend, mobile, backend, and infrastructure projects.
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
                      <span key={skill.name} className="text-[11px] font-bold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {skill.name}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Technical Knowledge Articles */}
      <section className="container mx-auto px-6" aria-labelledby="latest-articles-heading">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/30 text-primary bg-primary/5 font-bold">
              <BookOpen size={14} className="mr-1.5" /> Technical Knowledge Hub
            </Badge>
            <h2 id="latest-articles-heading" className="font-headline text-3xl md:text-4xl font-extrabold mb-4">
              Latest Engineering &amp; Problem-Solving Articles
            </h2>
            <p className="text-muted-foreground max-w-xl text-base md:text-lg">
              Practical guides and architectural case studies addressing real software development challenges.
            </p>
          </div>
          <Button variant="ghost" className="p-0 h-auto text-primary font-bold group" asChild>
            <Link href="/articles">
              Browse full knowledge hub <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestArticles.map((article) => (
            <article key={article.slug} className="border border-border/70 p-6 rounded-2xl bg-card hover:border-primary/40 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span className="font-semibold text-primary">{article.category}</span>
                  {article.readingTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {article.readingTime}
                    </span>
                  )}
                </div>
                <h3 className="font-headline text-lg md:text-xl font-bold mb-3 leading-snug">
                  <Link className="hover:text-primary transition-colors" href={`/articles/${article.slug}`}>
                    {article.title}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                  {article.description}
                </p>
              </div>
              <Link className="text-sm font-bold text-primary inline-flex items-center gap-1.5 mt-auto hover:underline" href={`/articles/${article.slug}`}>
                Read Solution <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Primary Project Collaboration CTA */}
      <section className="container mx-auto px-6">
        <div className="p-10 md:p-16 rounded-[2.5rem] bg-gradient-to-r from-card via-card to-primary/10 border border-primary/25 shadow-2xl text-center max-w-5xl mx-auto relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 font-bold px-3 py-1">
              Let&apos;s Build Together
            </Badge>
            <h2 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight">
              Have a software project in mind? Let&apos;s discuss your requirements.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Whether you need to build a new web or mobile application from scratch, extend an existing product, or solve an architectural challenge, I am available to help.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-9 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 w-full sm:w-auto" asChild>
                <Link href="/contact">
                  Start a Conversation <ArrowRight className="ml-2" size={18} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl text-base font-bold w-full sm:w-auto" asChild>
                <Link href="/about">Learn More About Muhammad</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    </div>
  );
}
