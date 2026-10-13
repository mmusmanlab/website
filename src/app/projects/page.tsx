import type { Metadata } from "next";
import Link from "next/link";
import ProjectsBrowser from "./projects-browser";
import Breadcrumbs from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Layout } from "lucide-react";
import { projects } from "@/app/lib/data";

export const metadata: Metadata = {
  title: "Software Projects & Case Studies — Muhammad M. Usman",
  description:
    "Explore production web, mobile, and full-stack software projects built with Next.js, React, React Native, Expo, TypeScript, and Node.js by Muhammad M. Usman.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Software Projects & Case Studies — Muhammad M. Usman",
    description:
      "Explore production web, mobile, and full-stack software projects built with Next.js, React, React Native, Expo, TypeScript, and Node.js.",
    url: "https://mmusmanlab.vercel.app/projects",
    type: "website",
  },
};

export default function ProjectsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Software Projects by Muhammad M. Usman",
    description: "Web, mobile, and full-stack software projects developed by Muhammad M. Usman.",
    url: "https://mmusmanlab.vercel.app/projects",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((p, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://mmusmanlab.vercel.app/projects/${p.id}`,
        name: p.name,
      })),
    },
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-6xl">
      <Breadcrumbs items={[{ label: "Projects" }]} />

      <div className="max-w-4xl mt-6 mb-12 md:mb-16">
        <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5 font-bold gap-1.5">
          <Layout size={14} /> Software Portfolio
        </Badge>
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
          Software Projects &amp; Case Studies
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
          Production applications across web, mobile, and technical infrastructure. Each project demonstrates deliberate technology selection, clean architecture, and real-world problem solving.
        </p>
      </div>

      <ProjectsBrowser />

      {/* Collaboration Conversion Banner */}
      <section className="mt-20 p-8 md:p-12 rounded-3xl bg-card border border-primary/20 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 font-bold">
            <Sparkles size={14} className="mr-1.5" /> Start Your Project
          </Badge>
          <h2 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight">
            Need an engineer to build or extend your application?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            I am available for freelance development, contract engineering, and technical advisory for startups and businesses.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Button size="lg" className="rounded-xl font-bold" asChild>
              <Link href="/contact">
                Discuss Your Requirements <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl font-bold" asChild>
              <Link href="/articles">Read Problem-Solving Articles</Link>
            </Button>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
