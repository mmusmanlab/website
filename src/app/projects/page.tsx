
"use client";

import { projects } from "@/app/lib/data";
import { ProjectCard } from "@/components/project-card";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const [filter, setFilter] = useState<"All" | "Web" | "Mobile" | "Tool" | "Engineering">("All");

  const filteredProjects = filter === "All" 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="max-w-4xl mb-12 md:mb-20">
        <h1 className="font-headline text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">My Projects</h1>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
          A deep dive into my professional work, open-source contributions, and experimental side projects. 
          Use the filters below to browse by category.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3 mb-12 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
        {(["All", "Web", "Mobile", "Engineering", "Tool"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "px-6 md:px-8 py-2.5 md:py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap",
              filter === cat 
                ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-20 md:py-32 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
          <p className="text-muted-foreground text-xl font-medium">No projects found in this category.</p>
        </div>
      )}
    </div>
  );
}
