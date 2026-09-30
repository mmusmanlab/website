import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/app/lib/data";
import { articles } from "@/app/lib/articles";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Breadcrumbs from "@/components/breadcrumbs";

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

  const title = `${project.name} — ${project.technologies.slice(0, 3).join(", ")} Project`;
  const description = project.overview ?? project.shortDescription;
  const canonical = `/projects/${project.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "article", title, description, url: canonical },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProjectDetailsPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = projects.find((entry) => entry.id === id);
  if (!project) notFound();

  const relatedArticles = articles.filter((article) => article.relatedProjects.includes(project.id));
  const relatedProjects = projects.filter((entry) => entry.id !== project.id).slice(0, 3);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: project.overview ?? project.shortDescription,
    url: `${baseUrl}/projects/${project.id}`,
    author: { "@type": "Person", name: "Muhammad M. Usman", url: `${baseUrl}/about` },
    keywords: project.technologies.join(", "),
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: project.name }]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
        <div className="lg:col-span-8">
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border mb-10 shadow-2xl">
            <Image src={project.image} alt={project.imageAlt ?? `${project.name} project placeholder image`} fill className="object-cover" priority />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1">{project.category}</Badge>
            {project.technologies.map((technology) => (
              <Badge key={technology} variant="outline" className="font-normal border-muted-foreground/30">{technology}</Badge>
            ))}
          </div>

          <h1 className="font-headline text-4xl md:text-5xl font-bold mb-6 tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-12">{project.overview ?? project.fullDescription}</p>

          <section className="mb-10">
            <h2 className="font-headline text-2xl font-bold mb-4">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">{project.fullDescription}</p>
          </section>

          {project.features && (
            <section className="mb-10">
              <h2 className="font-headline text-2xl font-bold mb-4">Key Features</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                {project.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </section>
          )}

          <section className="mb-12">
            <h2 className="font-headline text-2xl font-bold mb-4">Technology Stack</h2>
            <ul className="flex flex-wrap gap-2" aria-label="Technologies">
              {project.technologies.map((technology) => (
                <li key={technology}><Badge variant="outline">{technology}</Badge></li>
              ))}
            </ul>
          </section>

          {relatedArticles.length > 0 && (
            <section className="border-t border-border/70 pt-8 mb-10">
              <h2 className="font-headline text-2xl font-bold mb-5">Related Articles</h2>
              <ul className="space-y-3">
                {relatedArticles.map((article) => (
                  <li key={article.slug}><Link className="text-primary hover:underline" href={`/articles/${article.slug}`}>{article.title}</Link></li>
                ))}
              </ul>
            </section>
          )}

          <section className="border-t border-border/70 pt-8">
            <h2 className="font-headline text-2xl font-bold mb-5">Related Projects</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedProjects.map((related) => (
                <Card key={related.id} className="p-5">
                  <h3 className="font-bold mb-2"><Link className="hover:text-primary" href={`/projects/${related.id}`}>{related.name}</Link></h3>
                  <p className="text-sm text-muted-foreground">{related.shortDescription}</p>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <Card className="p-6 sticky top-24">
            <h2 className="font-headline text-lg font-bold mb-5">Project Details</h2>
            <h3 className="text-sm font-bold text-muted-foreground uppercase mb-2">Category</h3>
            <p className="font-medium">{project.category}</p>
          </Card>
        </aside>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    </div>
  );
}