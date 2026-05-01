
import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  const handle = "mmusmanlab";
  
  return (
    <footer className="border-t py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h3 className="font-headline text-2xl font-extrabold tracking-tighter mb-2">
              MM<span className="text-primary">Usman</span>
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs font-medium">
              Hybrid Software Engineer and Electrical Partner building professional, scalable digital and power solutions.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a href={`https://github.com/${handle}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Github size={20} />
            </a>
            <a href={`https://linkedin.com/in/${handle}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Linkedin size={20} />
            </a>
            <a href={`https://twitter.com/${handle}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter size={20} />
            </a>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground font-semibold">
          © {new Date().getFullYear()} Muhd M. Usman. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
