import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getPublishedArticles, getRelatedArticles } from "@/lib/articles-store";
import { projects } from "@/app/lib/data";
import Breadcrumbs from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Clock, ExternalLink, Sparkles, Terminal, User } from "lucide-react";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const canonical = `/articles/${article.slug}`;
  return {
    title: `${article.title} — Muhammad M. Usman`,
    description: article.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url: `https://mmusmanlab.vercel.app${canonical}`,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      tags: article.tags,
      authors: ["https://mmusmanlab.vercel.app/about"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const relatedProjects = projects.filter((project) => article.relatedProjects?.includes(project.id));
  const otherArticles = await getRelatedArticles(article, 3);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    wordCount: article.wordCount,
    proficiencyLevel: article.difficulty ?? "Intermediate",
    author: {
      "@type": "Person",
      name: "Muhammad M. Usman",
      url: "https://mmusmanlab.vercel.app/about",
      jobTitle: "Full-Stack Software Engineer",
    },
    publisher: {
      "@type": "Person",
      name: "Muhammad M. Usman",
      url: "https://mmusmanlab.vercel.app",
    },
    mainEntityOfPage: `https://mmusmanlab.vercel.app/articles/${article.slug}`,
    keywords: article.tags.join(", "),
  };

  return (
    <article className="container mx-auto px-6 py-12 md:py-20 max-w-4xl">
      <Breadcrumbs items={[{ label: "Articles", href: "/articles" }, { label: article.title }]} />

      <header className="py-8 md:py-12 border-b border-border/60">
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-primary mb-4">
          <span>{article.category}</span>
          <span className="text-muted-foreground">·</span>
          <time dateTime={article.publishedAt} className="text-muted-foreground font-medium">
            {article.publishedAt}
          </time>
          {article.readingTime && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="flex items-center gap-1 text-muted-foreground font-medium">
                <Clock size={14} /> {article.readingTime}
              </span>
            </>
          )}
          {article.difficulty && (
            <Badge variant="outline" className="border-primary/30 text-primary text-xs">
              {article.difficulty}
            </Badge>
          )}
        </div>

        <h1 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
          {article.title}
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
          {article.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-6" aria-label="Tags">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="px-3 py-1 text-xs font-semibold">
              #{tag}
            </Badge>
          ))}
        </div>
      </header>

      {/* Article Content */}
      <div className="py-10 space-y-12">
        {article.content.map((section, idx) => (
          <section key={section.heading || idx} className="space-y-4">
            <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {section.heading}
            </h2>

            {section.paragraphs.map((p, pIdx) => (
              <p key={pIdx} className="text-muted-foreground text-base md:text-lg leading-relaxed">
                {p}
              </p>
            ))}

            {section.bullets && section.bullets.length > 0 && (
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-base md:text-lg leading-relaxed">
                {section.bullets.map((b, bIdx) => (
                  <li key={bIdx}>{b}</li>
                ))}
              </ul>
            )}

            {section.codeBlock && (
              <div className="my-6 rounded-2xl overflow-hidden border border-border/80 bg-neutral-950 shadow-xl">
                <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-border/40 text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-primary" />
                    <span>{section.codeBlock.caption ?? "Code Solution"}</span>
                  </div>
                  <span className="uppercase tracking-wider font-mono font-bold text-neutral-400">
                    {section.codeBlock.language}
                  </span>
                </div>
                <pre className="p-4 md:p-6 overflow-x-auto text-sm font-mono text-neutral-200 leading-relaxed no-scrollbar">
                  <code>{section.codeBlock.code}</code>
                </pre>
              </div>
            )}
          </section>
        ))}

        {/* Sources / References */}
        {article.sources && article.sources.length > 0 && (
          <section className="border-t border-border/70 pt-8 mt-12">
            <h3 className="font-headline text-lg font-bold mb-4">Authoritative References &amp; Documentation</h3>
            <ul className="space-y-2">
              {article.sources.map((src, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <ExternalLink size={14} className="text-muted-foreground" />
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    {src.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Content Attribution Note */}
        {article.isAutomated && (
          <p className="text-xs text-muted-foreground/80 italic border-l-2 border-primary/30 pl-4 py-1">
            Note: This article was researched and structured through the MMUsmanLab problem-discovery engine using official technical documentation and validated against production engineering standards.
          </p>
        )}
      </div>

      {/* Author Card & Engagement */}
      <section className="my-10 p-6 md:p-8 rounded-2xl bg-card/60 border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
            <User size={28} />
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg">Muhammad M. Usman</h3>
            <p className="text-sm text-muted-foreground leading-snug">
              Full-Stack Software Engineer specializing in Next.js, React Native, TypeScript, Expo, and Node.js.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl font-bold shrink-0" asChild>
          <Link href="/about">About Muhammad</Link>
        </Button>
      </section>

      {/* Conversion Section: Problem to Project Collaboration */}
      <section className="my-12 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-card to-background border border-primary/25 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5 font-bold">
            <Sparkles size={14} className="mr-1.5" /> Need Technical Assistance?
          </Badge>
          <h2 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight">
            Need help solving this in your application or building a new product?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl">
            Whether you need contract development, architectural consulting, or hands-on implementation across web and mobile platforms, I can help turn your technical requirements into working software.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Button size="lg" className="rounded-xl font-bold shadow-lg shadow-primary/20" asChild>
              <Link href="/contact">
                Start a Conversation <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl font-bold" asChild>
              <Link href="/projects">View Case Studies</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="border-t border-border/70 pt-10 mb-10">
          <h2 className="font-headline text-2xl font-bold mb-6">Related Project Case Studies</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {relatedProjects.map((project) => (
              <Card key={project.id} className="p-5 hover:border-primary/40 transition-colors">
                <Badge variant="secondary" className="mb-2 text-xs">{project.category}</Badge>
                <h3 className="font-bold text-lg mb-2">
                  <Link className="hover:text-primary transition-colors" href={`/projects/${project.id}`}>
                    {project.name}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {project.shortDescription}
                </p>
                <Link className="text-xs font-bold text-primary hover:underline flex items-center gap-1" href={`/projects/${project.id}`}>
                  View Project <ArrowRight size={12} />
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* More Articles */}
      {otherArticles.length > 0 && (
        <section className="border-t border-border/70 pt-10">
          <h2 className="font-headline text-2xl font-bold mb-6">More Engineering Articles</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {otherArticles.map((entry) => (
              <Card key={entry.slug} className="p-5 hover:border-primary/40 transition-colors flex flex-col justify-between">
                <div>
                  <p className="text-xs text-primary font-semibold mb-2">{entry.category}</p>
                  <h3 className="font-bold text-base mb-2 leading-snug">
                    <Link className="hover:text-primary transition-colors" href={`/articles/${entry.slug}`}>
                      {entry.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {entry.description}
                  </p>
                </div>
                <Link className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-auto" href={`/articles/${entry.slug}`}>
                  Read Article <ArrowRight size={12} />
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </article>
  );
}