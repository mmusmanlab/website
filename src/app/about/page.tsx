"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Code2, GraduationCap, Laptop, Rocket, Award, BookOpen } from "lucide-react";
import profilePic from "@/lib/mmusmanlab.webp";

export default function AboutPage() {
  const experiences = [
    {
      role: "Full-Stack Software Engineer",
      company: "Freelance / Self-Employed",
      period: "2020 - Present",
      description: "Developing robust web and mobile applications for various clients. Specializing in React, Next.js, and Expo. Built scalable e-commerce solutions and financial tracking tools."
    },
    {
      role: "Senior Developer & Management",
      company: "BichiNet",
      period: "2024 - 2025",
      description: "Led software development initiatives and managed technical infrastructure. Optimized network services and internal tools for improved operational efficiency."
    }
  ];

  const education = [
    {
      degree: "B.Sc (Ed) – Computer Science Education",
      school: "Federal College of Education (Technical) Bichi",
      period: "2025 - Present",
      description: "Focusing on advanced computing, software architecture, and the intersection of technology and pedagogy."
    },
    {
      degree: "Nigeria Certificate in Education (NCE) – Biology/Computer Science",
      school: "Federal College of Education (Technical) Bichi",
      period: "2020 - 2023",
      description: "Dual major focusing on biological sciences and fundamental computer science principles."
    },
    {
      degree: "Complete Web Development Bootcamp",
      school: "London App Brewery",
      period: "2021 - 2022",
      description: "Professional full-stack certification focusing on modern JavaScript, Node.js, and database management."
    },
    {
      degree: "Mobile App Development Certification",
      school: "Codedamn",
      period: "2023",
      description: "Intensive training in React Native and Expo for cross-platform Android/iOS development."
    }
  ];

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        {/* Left Column - Intro */}
        <div className="lg:col-span-5 space-y-8 md:space-y-12">
          <div className="relative group max-w-xs sm:max-w-sm mx-auto lg:mx-0">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-background shadow-2xl bg-muted">
              <Image
                src={profilePic}
                alt="Muhammad M. Usman"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
              Muhammad <span className="gradient-text">M. Usman</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8">
              A Full-Stack Software Engineer dedicated to building modern, scalable web and mobile applications. I bridge high-level architecture with intuitive user interfaces.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <Badge variant="outline" className="px-4 py-2 border-primary/20 bg-primary/5 text-primary font-bold rounded-xl flex gap-2">
                <Code2 size={14} /> Web & Mobile Specialist
              </Badge>
              <Badge variant="outline" className="px-4 py-2 border-accent/20 bg-accent/5 text-accent font-bold rounded-xl flex gap-2">
                <Award size={14} /> Full-Stack Architect
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-7 space-y-12 md:space-y-16">
          {/* Professional Summary */}
          <section>
             <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight mb-6">Professional Identity</h2>
             <p className="text-muted-foreground text-lg leading-relaxed">
               I focus on building modern web and mobile applications using JavaScript technologies like React, Next.js, and Node.js. My expertise extends to developing cross-platform mobile apps using Expo and React Native, always aiming for scalable systems and intuitive user experiences. 
               My broader technical experience allows me to understand the full lifecycle of a digital product, from infrastructure to interface.
             </p>
          </section>

          {/* Career Journey */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Laptop size={28} />
              </div>
              <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">Engineering Experience</h2>
            </div>
            <div className="space-y-10">
              {experiences.map((exp, i) => (
                <div key={i} className="relative pl-8 md:pl-10 border-l-2 border-muted pb-4 last:pb-0">
                  <div className="absolute left-[-11px] top-1 w-5 h-5 rounded-full bg-background border-4 border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"></div>
                  <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-1 mb-3">
                    <h3 className="font-bold text-xl md:text-2xl">{exp.role}</h3>
                    <span className="text-sm text-primary font-bold bg-primary/5 px-3 py-1 rounded-full w-fit">{exp.period}</span>
                  </div>
                  <p className="text-muted-foreground font-bold mb-3">{exp.company}</p>
                  <p className="text-muted-foreground/80 leading-relaxed text-base md:text-lg">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                <GraduationCap size={28} />
              </div>
              <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">Education & Certifications</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {education.map((edu, i) => (
                <Card key={i} className="p-6 bg-muted/20 border-none rounded-[1.5rem] hover:bg-muted/30 transition-all hover:-translate-y-1 duration-300">
                  <div className="flex items-start gap-3 mb-4">
                    <BookOpen size={20} className="text-accent shrink-0 mt-1" />
                    <h4 className="font-bold text-lg leading-snug">{edu.degree}</h4>
                  </div>
                  <p className="text-muted-foreground text-sm font-medium mb-4">{edu.school}</p>
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-background">
                    {edu.period}
                  </Badge>
                </Card>
              ))}
            </div>
          </section>

          {/* Core Strengths */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                <Rocket size={28} />
              </div>
              <h2 className="font-headline text-2xl font-bold tracking-tight">Expertise</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {["Full-Stack Dev", "Mobile Engineering", "UI/UX Design", "System Architecture", "Cloud Integration", "API Development", "Computer Science Education"].map(item => (
                <Badge key={item} variant="secondary" className="px-4 py-2 bg-muted/40 hover:bg-muted text-sm font-semibold transition-all duration-300 rounded-xl border border-transparent hover:border-primary/20">
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
