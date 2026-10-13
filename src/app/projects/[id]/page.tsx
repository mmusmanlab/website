import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/app/lib/data";
import { getPublishedArticles } from "@/lib/articles-store";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/breadcrumbs";
import { ArrowRight, Sparkles, BookOpen, Layers, CheckCircle2 } from "lucide-react";

const baseUrl = "https://mmusmanlab.vercel.app";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((entry) => entry.id === id);
  if (!project) return {};

  const title = `${project.name} — Full-Stack Case Study by Muhammad M. Usman`;
  const description = project.overview ?? project.shortDescription;
  const canonical = `/projects/${project.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "article", title, description, url: `${baseUrl}${canonical}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProjectDetailsPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = projects.find((entry) => entry.id === id);
  if (!project) notFound();

  const allArticles = await getPublishedArticles();
  const relatedArticles = allArticles.filter((article) => article.relatedProjects.includes(project.id));
  const relatedProjects = projects.filter((entry) => entry.id !== project.id).slice(0, 3);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.name,
    description: project.overview ?? project.shortDescription,
    url: `${baseUrl}/projects/${project.id}`,
    applicationCategory: project.category === "Mobile" ? "MobileApplication" : "WebApplication",
    operatingSystem: project.category === "Mobile" ? "Android, iOS" : "All",
    author: {
      "@type": "Person",
      name: "Muhammad M. Usman",
      url: `${baseUrl}/about`,
      jobTitle: "Full-Stack Software Engineer",
    },
    keywords: project.technologies.join(", "),
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-6xl">
      <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: project.name }]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border mb-10 shadow-2xl bg-muted">
            <Image
              src={project.image}
              alt={project.imageAlt ?? `${project.name} project screenshot placeholder`}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3.5 py-1 text-xs font-bold">
              {project.category} Engineering
            </Badge>
            {project.technologies.map((technology) => (
              <Badge key={technology} variant="outline" className="font-medium border-muted-foreground/30 text-xs">
                {technology}
              </Badge>
            ))}
          </div>

          <h1 className="font-headline text-3xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
            {project.name}
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-12">
            {project.overview ?? project.fullDescription}
          </p>

          <section className="mb-10 space-y-4">
            <h2 className="font-headline text-2xl font-bold">Project Overview &amp; Architecture</h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{project.fullDescription}</p>
          </section>

          {project.features && (
            <section className="mb-10 space-y-4">
              <h2 className="font-headline text-2xl font-bold">Key Delivered Capabilities</h2>
              <ul className="space-y-3">
                {project.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-base text-muted-foreground">
                    <CheckCircle2 size={18} className="text-primary shrink-0 mt-1" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mb-12 space-y-4">
            <h2 className="font-headline text-2xl font-bold">Technology Stack</h2>
            <div className="flex flex-wrap gap-2" aria-label="Technologies used">
              {project.technologies.map((technology) => (
                <Badge key={technology} variant="secondary" className="px-3 py-1 font-semibold text-xs">
                  {technology}
                </Badge>
              ))}
            </div>
          </section>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="border-t border-border/70 pt-8 mb-10">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={20} className="text-primary" />
                <h2 className="font-headline text-2xl font-bold">Technical Articles Covering This Stack</h2>
              </div>
              <ul className="space-y-3">
                {relatedArticles.map((article) => (
                  <li key={article.slug} className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/40 transition-colors">
                    <Link className="text-foreground hover:text-primary font-bold text-base block mb-1" href={`/articles/${article.slug}`}>
                      {article.title}
                    </Link>
                    <p className="text-xs text-muted-foreground line-clamp-2">{article.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Related Projects */}
          <section className="border-t border-border/70 pt-8">
            <h2 className="font-headline text-2xl font-bold mb-5">More Software Projects</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedProjects.map((related) => (
                <Card key={related.id} className="p-5 hover:border-primary/40 transition-colors">
                  <Badge variant="outline" className="mb-2 text-[10px]">{related.category}</Badge>
                  <h3 className="font-bold mb-2">
                    <Link className="hover:text-primary transition-colors" href={`/projects/${related.id}`}>
                      {related.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{related.shortDescription}</p>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Details & Direct Collaboration CTA */}
        <aside className="lg:col-span-4 space-y-6">
          <Card className="p-6 sticky top-28 bg-card border border-border/70 space-y-6">
            <div>
              <h2 className="font-headline text-lg font-bold mb-4">Project Summary</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase block">Category</span>
                  <span className="font-semibold text-foreground">{project.category} Engineering</span>
                </div>
                {project.lastModified && (
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase block">Last Updated</span>
                    <span className="font-semibold text-foreground">{project.lastModified}</span>
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase block">Stack</span>
                  <span className="text-xs text-muted-foreground">{project.technologies.join(", ")}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Sparkles size={16} /> Need a Similar Solution?
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                I can help design, develop, and deploy custom web or mobile applications matching your specific technical requirements.
              </p>
              <Button size="sm" className="w-full rounded-xl font-bold" asChild>
                <Link href="/contact">
                  Discuss Your Build <ArrowRight size={14} className="ml-1.5" />
                </Link>
              </Button>
            </div>
          </Card>
        </aside>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}