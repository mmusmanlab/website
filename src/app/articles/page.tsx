import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "@/app/lib/articles";

export const metadata: Metadata = {
  title: "Articles & Project Notes",
  description: "Technical articles and project case studies about mobile applications, web development and the technologies used in Muhammad M. Usman's portfolio.",
  alternates: { canonical: "/articles" },
};

export default function ArticlesPage() {
  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <header className="max-w-4xl mb-12 md:mb-16">
        <h1 className="font-headline text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Articles &amp; Project Notes</h1>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">Project-based notes on application features and the technologies documented for each build.</p>
      </header>
      <div className="divide-y divide-border/70 border-y border-border/70">
        {articles.map((article) => (
          <article key={article.slug} className="py-7 md:py-9 grid md:grid-cols-[minmax(0,1fr)_12rem] gap-4 md:gap-10">
            <div>
              <p className="text-xs font-semibold text-primary mb-3">{article.category} · <time dateTime={article.publishedAt}>{article.publishedAt}</time></p>
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-3"><Link href={`/articles/${article.slug}`} className="hover:text-primary">{article.title}</Link></h2>
              <p className="text-muted-foreground leading-relaxed">{article.description}</p>
              <ul className="flex flex-wrap gap-2 mt-4" aria-label="Article tags">
                {article.tags.map((tag) => <li key={tag} className="text-xs text-muted-foreground">{tag}</li>)}
              </ul>
            </div>
            <div className="md:text-right self-end">
              <Link href={`/articles/${article.slug}`} className="text-sm font-bold text-primary hover:underline">Read article <span aria-hidden="true">→</span></Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}