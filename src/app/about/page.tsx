import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code2, GraduationCap, Laptop, Rocket, Award, BookOpen, ArrowRight, CheckCircle2, Handshake } from "lucide-react";
import profilePic from "@/lib/mmusmanlab.webp";

export const metadata: Metadata = {
  title: "About Muhammad M. Usman — Full-Stack Software Engineer",
  description:
    "Learn about Muhammad M. Usman's software engineering background, web & mobile architecture with Next.js, React Native, Expo, TypeScript and Node.js.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const experiences = [
    {
      role: "Full-Stack Software Engineer",
      company: "Freelance & Contract Development",
      period: "2020 - Present",
      description:
        "Developing robust web and mobile applications for clients and startups. Specializing in Next.js, React Native, Expo, TypeScript, and Node.js. Built scalable e-commerce solutions, household budgeting systems, and education platforms.",
    },
    {
      role: "Senior Developer & Technical Lead",
      company: "BichiNet",
      period: "2024 - 2025",
      description:
        "Led software development initiatives and managed technical infrastructure. Optimized internal network services, developer tooling, and systems reliability.",
    },
  ];

  const education = [
    {
      degree: "B.Sc (Ed) – Computer Science Education",
      school: "Federal College of Education (Technical) Bichi",
      period: "2025 - Present",
      description:
        "Focusing on advanced computing, software architecture, algorithm design, and technical pedagogy.",
    },
    {
      degree: "Nigeria Certificate in Education (NCE) – Biology / Computer Science",
      school: "Federal College of Education (Technical) Bichi",
      period: "2020 - 2023",
      description:
        "Dual major building foundational computer science concepts, structured problem-solving, and scientific methodologies.",
    },
    {
      degree: "Complete Web Development Bootcamp",
      school: "London App Brewery",
      period: "2021 - 2022",
      description:
        "Full-stack software engineering certification focusing on modern JavaScript, Node.js, Express, databases, and application security.",
    },
    {
      degree: "Mobile App Development Certification",
      school: "Codedamn",
      period: "2023",
      description:
        "Intensive training in React Native and Expo for production Android and iOS mobile application development.",
    },
  ];

  const collaborationModes = [
    {
      title: "Contract & Freelance Development",
      description:
        "End-to-end execution of web or mobile application features from technical specification to deployment.",
    },
    {
      title: "Startup MVP Engineering",
      description:
        "Helping early-stage founders turn product concepts into functional, testable software without bloated dependencies.",
    },
    {
      title: "Codebase Modernization & Debugging",
      description:
        "Resolving framework upgrade incompatibilities, memory leaks in React Native, and type inconsistencies.",
    },
    {
      title: "Technical Architecture & Consulting",
      description:
        "Reviewing stack choices, data structures, and API contracts for teams building on Next.js, React Native, or Node.js.",
    },
  ];

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column - Intro */}
        <div className="lg:col-span-5 space-y-8 md:space-y-10 lg:sticky lg:top-28">
          <div className="relative group max-w-xs sm:max-w-sm mx-auto lg:mx-0">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-background shadow-2xl bg-muted">
              <Image
                src={profilePic}
                alt="Muhammad M. Usman — Software Engineer"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
              Muhammad <span className="gradient-text">M. Usman</span>
            </h1>
            <p className="text-primary font-bold text-lg mb-4">Full-Stack Software Engineer</p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
              I build reliable web, mobile, and backend systems. Bridging high-level system architecture with intuitive user experiences.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2.5">
              <Badge variant="outline" className="px-3.5 py-1.5 border-primary/20 bg-primary/5 text-primary font-bold rounded-xl flex gap-1.5">
                <Code2 size={14} /> Web &amp; Mobile Specialist
              </Badge>
              <Badge variant="outline" className="px-3.5 py-1.5 border-accent/20 bg-accent/5 text-accent font-bold rounded-xl flex gap-1.5">
                <Award size={14} /> Full-Stack Architecture
              </Badge>
            </div>

            <div className="pt-6">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold" asChild>
                <Link href="/contact">
                  Work With Muhammad <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-7 space-y-12 md:space-y-16">
          {/* Professional Summary */}
          <section>
            <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight mb-4">Engineering Focus</h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">
              My engineering work is centered on modern JavaScript and TypeScript environments: Next.js, React, Node.js, Express, and cross-platform mobile development with React Native and Expo.
            </p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              I believe in clean, defensible code, predictable state boundaries, and building digital products that withstand real-world usage. Whether building an e-commerce catalog, an educational platform, or a financial tool, my goal is always to deliver software that is performant, maintainable, and discoverable.
            </p>
          </section>

          {/* Openness to Opportunities / Collaboration */}
          <section className="p-8 rounded-3xl bg-muted/20 border border-border/80">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Handshake size={24} />
              </div>
              <h2 className="font-headline text-2xl font-bold tracking-tight">Available For Projects &amp; Teams</h2>
            </div>
            <p className="text-muted-foreground text-base leading-relaxed mb-6">
              I actively take on software development projects, contract engineering roles, and technical consulting engagements. Here are the common ways I collaborate:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {collaborationModes.map((mode, i) => (
                <div key={i} className="p-4 rounded-2xl bg-card border border-border/50">
                  <h3 className="font-bold text-sm mb-1 text-foreground flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-primary shrink-0" />
                    {mode.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">{mode.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Career Journey */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Laptop size={26} />
              </div>
              <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">Software Engineering Experience</h2>
            </div>
            <div className="space-y-8">
              {experiences.map((exp, i) => (
                <div key={i} className="relative pl-8 md:pl-10 border-l-2 border-muted pb-4 last:pb-0">
                  <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-background border-4 border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"></div>
                  <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-1 mb-2">
                    <h3 className="font-bold text-xl">{exp.role}</h3>
                    <span className="text-xs text-primary font-bold bg-primary/5 px-3 py-1 rounded-full w-fit">{exp.period}</span>
                  </div>
                  <p className="text-muted-foreground font-semibold text-sm mb-2">{exp.company}</p>
                  <p className="text-muted-foreground text-base leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                <GraduationCap size={26} />
              </div>
              <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">Education &amp; Credentials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {education.map((edu, i) => (
                <Card key={i} className="p-6 bg-muted/20 border-none rounded-2xl hover:bg-muted/30 transition-all duration-300">
                  <div className="flex items-start gap-3 mb-3">
                    <BookOpen size={18} className="text-accent shrink-0 mt-1" />
                    <h3 className="font-bold text-base leading-snug">{edu.degree}</h3>
                  </div>
                  <p className="text-muted-foreground text-xs font-medium mb-3">{edu.school}</p>
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-background">
                    {edu.period}
                  </Badge>
                </Card>
              ))}
            </div>
          </section>

          {/* Core Strengths */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Rocket size={26} />
              </div>
              <h2 className="font-headline text-2xl font-bold tracking-tight">Areas of Technical Practice</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js App Router",
                "React & React 19",
                "React Native & Expo",
                "TypeScript",
                "Node.js & Express",
                "REST API Design",
                "Database Architecture",
                "Zod Schema Validation",
                "State Management",
                "Performance Optimization",
                "Debugging & Profiling",
                "System Architecture",
              ].map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="px-3.5 py-1.5 bg-muted/50 text-xs font-semibold rounded-xl border border-transparent hover:border-primary/20 transition-colors"
                >
                  {item}
                </Badge>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
