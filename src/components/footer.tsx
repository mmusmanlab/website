"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Linkedin, Twitter, ArrowRight } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const handle = "mmusmanlab";

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="border-t py-14 bg-background">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5 space-y-4">
            <h3 className="font-headline text-2xl font-extrabold tracking-tighter">
              MM<span className="text-primary">Usman</span>
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Full-Stack Software Engineer specializing in Next.js, React Native, TypeScript, Expo, and Node.js. Available for freelance projects, contract software development, and technical consulting.
            </p>
            <div className="flex items-center gap-5 pt-2">
              <a
                href={`https://github.com/${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href={`https://linkedin.com/in/${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href={`https://twitter.com/${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter profile"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-primary transition-colors">Software Projects</Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-primary transition-colors">Technical Articles</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">About Muhammad</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">Contact &amp; Inquiries</Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Project Collaboration</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Have an idea or an existing codebase that needs engineering support? Let&apos;s turn it into a high-performing product.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                Get in touch for projects <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-medium">
          <p>© {new Date().getFullYear()} Muhammad M. Usman. All rights reserved.</p>
          <p>Built with Next.js, React, TypeScript &amp; Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}
