
import type { Metadata } from "next";
import ProjectsBrowser from "./projects-browser";

export const metadata: Metadata = {
  title: "Software Projects — Web, Mobile & Full-Stack Applications",
  description:
    "Explore web, mobile and full-stack software projects built with technologies including Next.js, React, React Native, Expo, TypeScript and Node.js.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="max-w-4xl mb-12 md:mb-20">
        <h1 className="font-headline text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">My Projects</h1>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
          Browse web, mobile and technical projects, including their described features and technology stacks.
        </p>
      </div>
      <ProjectsBrowser />
    </div>
  );
}
