"use client";

import Image from "next/image";
import Link from "next/link";
import { Project } from "@/app/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="group overflow-hidden flex flex-col h-full bg-card hover:border-primary/50 transition-all duration-300">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={project.image}
          alt={project.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          data-ai-hint="project screenshot"
        />
        {/* Navigation Overlay */}
        <Link 
          href={`/projects/${project.id}`}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10"
        >
          <div className="p-4 rounded-full bg-transparent text-white transform scale-50 group-hover:scale-100 transition-transform duration-300 drop-shadow-2xl">
            <ExternalLink size={48} />
          </div>
        </Link>
      </div>
      <CardContent className="p-6 flex-grow">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-accent border-accent/30 font-medium">
            {project.category}
          </Badge>
        </div>
        <h3 className="font-headline text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
          {project.shortDescription}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.technologies.slice(0, 3).map((tech) => (
            <span key={tech} className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
              +{project.technologies.length - 3}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0 mt-auto">
        <Button variant="link" className="p-0 h-auto text-primary group-hover:translate-x-1 transition-transform" asChild>
          <Link href={`/projects/${project.id}`}>
            View Details <ArrowRight size={16} className="ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
