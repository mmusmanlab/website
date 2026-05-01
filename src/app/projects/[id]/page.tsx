
"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/app/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Github, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { generateProjectSummary } from "@/ai/flows/project-summary-generation";
import { useToast } from "@/hooks/use-toast";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const project = projects.find((p) => p.id === id);
  
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
        <Button onClick={() => router.push("/projects")}>Back to Projects</Button>
      </div>
    );
  }

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setAiSummary(null);
    try {
      const result = await generateProjectSummary({
        projectName: project.name,
        projectDescription: project.fullDescription,
        technologiesUsed: project.technologies,
        demoLink: project.demoUrl,
        sourceCodeLink: project.repoUrl,
      });
      
      if (result && result.summary) {
        setAiSummary(result.summary);
        toast({
          title: "Summary Generated",
          description: "AI has successfully analyzed your project.",
        });
      } else {
        throw new Error("No summary returned from AI");
      }
    } catch (error: any) {
      console.error("AI Generation failed:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "There was an issue connecting to the AI service. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/projects" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft size={18} className="mr-2" />
        Back to Projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border mb-10 shadow-2xl">
            <Image
              src={project.image}
              alt={project.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1">
              {project.category}
            </Badge>
            {project.technologies.map(tech => (
              <Badge key={tech} variant="outline" className="font-normal border-muted-foreground/30">
                {tech}
              </Badge>
            ))}
          </div>

          <h1 className="font-headline text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            {project.name}
          </h1>

          <div className="prose prose-invert max-w-none mb-12">
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              {project.fullDescription}
            </p>
          </div>

          {/* AI Enhancer Component */}
          <Card className="p-8 border-primary/20 bg-primary/5 rounded-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
              <div>
                <h3 className="font-headline text-xl font-bold flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" />
                  AI Project Highlights
                </h3>
                <p className="text-muted-foreground text-sm">
                  Let AI generate a professional summary of this project's key impact.
                </p>
              </div>
              <Button 
                onClick={handleGenerateSummary} 
                disabled={isGenerating}
                className="shrink-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>
            </div>

            {aiSummary && (
              <div className="bg-card p-6 rounded-xl border border-primary/10 animate-in fade-in slide-in-from-top-4 duration-500">
                <p className="text-foreground/90 font-medium italic leading-relaxed">
                  "{aiSummary}"
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="p-6 sticky top-24">
            <h3 className="font-headline text-lg font-bold mb-6">Project Links</h3>
            <div className="flex flex-col gap-4">
              {project.demoUrl && (
                <Button className="w-full h-12" asChild>
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    Live Demo <ExternalLink size={18} className="ml-2" />
                  </a>
                </Button>
              )}
              {project.repoUrl && (
                <Button variant="outline" className="w-full h-12" asChild>
                  <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                    Source Code <Github size={18} className="ml-2" />
                  </a>
                </Button>
              )}
            </div>

            <div className="mt-8 pt-8 border-t space-y-6">
              <div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Category</h4>
                <p className="font-medium">{project.category} Application</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Role</h4>
                <p className="font-medium">Lead Full Stack Developer</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Timeline</h4>
                <p className="font-medium">3 Months Development</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
