import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticles } from "@/lib/articles-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import Breadcrumbs from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Technical Knowledge Hub & Problem-Solving Articles",
  description:
    "Engineering guides, framework diagnostics, and practical solutions for Next.js, React Native, TypeScript, Expo, and scalable full-stack applications by Muhammad M. Usman.",
  alternates: { canonical: "/articles" },
  openGraph: {
    title: "Technical Knowledge Hub & Problem-Solving Articles — Muhammad M. Usman",
    description:
      "Engineering guides, framework diagnostics, and practical solutions for Next.js, React Native, TypeScript, Expo, and full-stack software systems.",
    url: "https://mmusmanlab.vercel.app/articles",
    type: "website",
  },
};

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();

  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Technical Knowledge Hub & Engineering Articles",
    description: "Engineering guides, framework diagnostics, and practical solutions by Muhammad M. Usman.",
    url: "https://mmusmanlab.vercel.app/articles",
    author: {
      "@type": "Person",
      name: "Muhammad M. Usman",
      url: "https://mmusmanlab.vercel.app/about",
    },
    hasPart: articles.map((article) => ({
      "@type": "Article",
      headline: article.title,
      url: `https://mmusmanlab.vercel.app/articles/${article.slug}`,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
    })),
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-6xl">
      <Breadcrumbs items={[{ label: "Technical Articles" }]} />

      <header className="max-w-4xl mt-6 mb-12 md:mb-16">
        <Badge variant="outline" className="mb-4 px-3.5 py-1.5 border-primary/30 text-primary bg-primary/5 font-bold rounded-full gap-2">
          <BookOpen size={14} /> Knowledge & Problem Solving Hub
        </Badge>
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
          Engineering Articles &amp; Practical Solutions
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
          In-depth technical guides, production case studies, and framework diagnostics across Next.js, React Native, TypeScript, Expo, and modern backend systems.
        </p>
      </header>

      {/* Main Articles Stream */}
      <div className="divide-y divide-border/70 border-y border-border/70">
        {articles.map((article) => (
          <article
            key={article.slug}
            className="py-8 md:py-10 grid md:grid-cols-[minmax(0,1fr)_14rem] gap-6 md:gap-10 hover:bg-muted/10 transition-colors rounded-xl px-2 -mx-2"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
                <span className="font-bold text-primary">{article.category}</span>
                <span className="text-muted-foreground">·</span>
                <time dateTime={article.publishedAt} className="text-muted-foreground font-medium">
                  {article.publishedAt}
                </time>
                {article.readingTime && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock size={12} /> {article.readingTime}
                    </span>
                  </>
                )}
                {article.difficulty && (
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                    {article.difficulty}
                  </Badge>
                )}
              </div>

              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-3">
                <Link href={`/articles/${article.slug}`} className="hover:text-primary transition-colors">
                  {article.title}
                </Link>
              </h2>
              
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">
                {article.description}
              </p>

              <div className="flex flex-wrap gap-2 items-center" aria-label="Article tags">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:text-right flex md:flex-col justify-between items-start md:items-end gap-4 self-center md:self-end">
              <Button variant="outline" size="sm" className="rounded-xl font-bold group" asChild>
                <Link href={`/articles/${article.slug}`}>
                  Read Solution <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>

      {/* Conversion Banner: Reader to Client / Collaboration */}
      <section className="mt-16 p-8 md:p-12 rounded-3xl bg-card border border-primary/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="max-w-2xl relative z-10 space-y-4">
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 font-bold">
            <Sparkles size={14} className="mr-1.5" /> Technical Collaboration
          </Badge>
          <h2 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight">
            Facing a complex challenge in your web or mobile codebase?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            I help startups, teams, and business founders architect, build, and debug robust applications using Next.js, React Native, TypeScript, and Node.js.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Button size="lg" className="rounded-xl font-bold" asChild>
              <Link href="/contact">
                Discuss Your Project <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl font-bold" asChild>
              <Link href="/projects">
                View Project Implementations
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionStructuredData).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}