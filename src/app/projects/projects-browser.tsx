"use client";

import { useState } from "react";
import { projects } from "@/app/lib/data";
import { ProjectCard } from "@/components/project-card";
import { cn } from "@/lib/utils";

const categories = ["All", "Web", "Mobile", "Technical", "Tool"] as const;
type CategoryFilter = (typeof categories)[number];

export default function ProjectsBrowser() {
  const [filter, setFilter] = useState<CategoryFilter>("All");
  const filteredProjects = filter === "All"
    ? projects
    : projects.filter((project) => project.category === filter);

  return (
    <>
      <div className="flex flex-wrap gap-2 md:gap-3 mb-12 overflow-x-auto pb-4 md:pb-0 no-scrollbar" aria-label="Filter projects by category">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={filter === category}
            onClick={() => setFilter(category)}
            className={cn(
              "px-6 md:px-8 py-2.5 md:py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap",
              filter === category
                ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {category === "Technical" ? "Engineering" : category}
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
    </>
  );
}