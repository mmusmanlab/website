import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles } from "@/app/lib/articles";
import { projects } from "@/app/lib/data";
import Breadcrumbs from "@/components/breadcrumbs";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((entry) => entry.slug === slug);
  if (!article) return {};

  const canonical = `/articles/${article.slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical },
    openGraph: { type: "article", title: article.title, description: article.description, url: canonical, publishedTime: article.publishedAt, modifiedTime: article.updatedAt },
    twitter: { card: "summary_large_image", title: article.title, description: article.description },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = articles.find((entry) => entry.slug === slug);
  if (!article) notFound();

  const relatedProjects = projects.filter((project) => article.relatedProjects.includes(project.id));
  const otherArticles = articles.filter((entry) => entry.slug !== article.slug);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Person", name: "Muhammad M. Usman", url: "https://mmusmanlab.vercel.app/about" },
    mainEntityOfPage: `https://mmusmanlab.vercel.app/articles/${article.slug}`,
  };

  return (
    <article className="container mx-auto px-6 py-12 md:py-20 max-w-5xl">
      <Breadcrumbs items={[{ label: "Articles", href: "/articles" }, { label: article.title }]} />
      <header className="max-w-3xl py-10 md:py-14">
        <p className="text-sm font-semibold text-primary mb-4">{article.category} · <time dateTime={article.publishedAt}>{article.publishedAt}</time></p>
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">{article.title}</h1>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">{article.description}</p>
      </header>

      <div className="max-w-3xl">
        {article.content.map((section) => (
          <section key={section.heading} className="mb-10">
            <h2 className="font-headline text-2xl font-bold mb-4">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph} className="text-muted-foreground leading-relaxed mb-4">{paragraph}</p>)}
            {section.bullets && (
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            )}
          </section>
        ))}

        <section className="border-t border-border/70 pt-8 mb-10">
          <h2 className="font-headline text-2xl font-bold mb-4">Related Projects</h2>
          <ul className="space-y-3">
            {relatedProjects.map((project) => <li key={project.id}><Link className="text-primary hover:underline" href={`/projects/${project.id}`}>{project.name}: {project.shortDescription}</Link></li>)}
          </ul>
        </section>

        <section className="border-t border-border/70 pt-8">
          <h2 className="font-headline text-2xl font-bold mb-4">More Articles</h2>
          <ul className="space-y-3">
            {otherArticles.map((entry) => <li key={entry.slug}><Link className="text-primary hover:underline" href={`/articles/${entry.slug}`}>{entry.title}</Link></li>)}
          </ul>
        </section>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    </article>
  );
}