"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Layout, Mail, Layers, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/", label: "Home", icon: Layers },
  { href: "/projects", label: "Projects", icon: Layout },
  { href: "/about", label: "About", icon: User },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 flex items-center border-b",
      scrolled 
        ? "bg-background/90 backdrop-blur-xl border-border/50 py-2 shadow-sm" 
        : "bg-transparent border-transparent py-4"
    )}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="group flex items-center relative z-[60]">
          <span className="font-headline text-2xl font-extrabold tracking-tighter">
            MM<span className="text-primary group-hover:text-primary transition-colors">Usman</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-bold transition-all hover:text-primary relative group py-2",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon size={16} className={cn("transition-transform group-hover:scale-110", isActive && "scale-110")} />
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-xl h-12 w-12 transition-all active:scale-90">
                <Menu size={28} strokeWidth={2.5} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] sm:max-w-xs border-l border-border/40 bg-background/98 backdrop-blur-2xl p-0">
              <div className="flex flex-col h-full">
                <SheetHeader className="text-left px-6 py-8 border-b border-border/40">
                  <SheetTitle className="font-headline text-2xl font-extrabold tracking-tighter">
                    MM<span className="text-primary">Usman</span>
                  </SheetTitle>
                </SheetHeader>
                
                <ScrollArea className="flex-grow">
                  <div className="flex flex-col gap-1 p-4">
                    {navLinks.map((link, idx) => {
                      const Icon = link.icon;
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          style={{ animationDelay: `${idx * 50}ms` }}
                          className={cn(
                            "flex items-center gap-4 px-4 py-3.5 rounded-xl text-lg font-bold transition-all animate-in slide-in-from-right-5 duration-300",
                            isActive 
                              ? "bg-primary/10 text-primary shadow-sm" 
                              : "text-muted-foreground hover:bg-muted/50"
                          )}
                        >
                          <Icon size={22} className={cn(isActive && "text-primary")} />
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </ScrollArea>

                <div className="p-6 border-t border-border/40 bg-muted/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 opacity-70">Professional Consult</p>
                  <Button className="w-full h-14 rounded-xl text-base font-bold shadow-lg shadow-primary/20" asChild onClick={() => setOpen(false)}>
                    <Link href="/contact">Get In Touch</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
