"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/app/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
        <Button onClick={() => router.push("/projects")}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href="/projects"
        className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT CONTENT */}
        <div className="lg:col-span-8">
          {/* IMAGE */}
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border mb-10 shadow-2xl">
            <Image
              src={project.image}
              alt={project.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* BADGES */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1">
              {project.category}
            </Badge>

            {project.technologies.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="font-normal border-muted-foreground/30"
              >
                {tech}
              </Badge>
            ))}
          </div>

          {/* TITLE */}
          <h1 className="font-headline text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            {project.name}
          </h1>

          {/* DESCRIPTION */}
          <div className="prose prose-invert max-w-none mb-12">
            <p className="text-muted-foreground text-lg leading-relaxed">
              {project.fullDescription}
            </p>
          </div>

          {/* PROJECT INSIGHT (REPLACED AI SECTION) */}
          <Card className="p-8 border-primary/10 bg-muted/20 rounded-2xl">
            <div className="mb-6">
              <h3 className="font-headline text-xl font-bold flex items-center gap-2">
                <span className="text-primary">●</span>
                Project Impact & Engineering Insight
              </h3>
              <p className="text-muted-foreground text-sm mt-2">
                A breakdown of the architecture, performance focus, and real-world value of this project.
              </p>
            </div>

            <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
              <p>
                This project was designed with a focus on scalability, clean architecture,
                and modern UI performance. It demonstrates practical implementation of
                full-stack development principles using{" "}
                {project.technologies.join(", ")}.
              </p>

              <p>
                The system emphasizes reusable components, efficient state handling,
                and responsive design patterns optimized for both mobile and desktop environments.
              </p>

              <p>
                From a development standpoint, this project reflects strong engineering practices
                including modular design, API integration structure, and production-ready deployment considerations.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {project.technologies.slice(0, 6).map((tech) => (
                <Badge
                  key={tech}
                  variant="outline"
                  className="border-muted-foreground/30"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="p-6 sticky top-24">
            <h3 className="font-headline text-lg font-bold mb-6">
              Project Links
            </h3>

            <div className="flex flex-col gap-4">
              {project.demoUrl && (
                <Button className="w-full h-12" asChild>
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live Demo <ExternalLink size={18} className="ml-2" />
                  </a>
                </Button>
              )}

              {project.repoUrl && (
                <Button variant="outline" className="w-full h-12" asChild>
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Source Code <Github size={18} className="ml-2" />
                  </a>
                </Button>
              )}
            </div>

            <div className="mt-8 pt-8 border-t space-y-6">
              <div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Category
                </h4>
                <p className="font-medium">{project.category} Application</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Role
                </h4>
                <p className="font-medium">Lead Full Stack Developer</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Timeline
                </h4>
                <p className="font-medium">3 Months Development</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
