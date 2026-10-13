"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const projectTypes = [
  "Web Application (Next.js / React)",
  "Mobile Application (React Native / Expo)",
  "Backend & API Engineering (Node.js)",
  "Application Modernization & Debugging",
  "Technical Consulting & Architecture",
  "Startup MVP Development",
  "Other Software Inquiry",
];

export default function ContactForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedType, setSelectedType] = useState(projectTypes[0]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.projectType = selectedType;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Your message could not be sent. Please try again.");
      }

      setIsSent(true);
      form.reset();
      toast({
        title: "Message Delivered",
        description: "Thank you for reaching out. I will review your requirements and reply promptly.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Your message could not be sent. Please try again.";
      setSubmitError(message);
      toast({ title: "Message not sent", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-14 lg:py-20 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Context & Contact Details */}
        <div className="lg:col-span-5 space-y-10">
          <div>
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5 font-bold gap-1.5">
              <Sparkles size={14} /> Open for Collaboration
            </Badge>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
              Let&apos;s Build Your <span className="gradient-text">Software Product</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Have a web or mobile project in mind? Looking for contract software engineering, MVP development, or technical consulting? Reach out directly and let&apos;s turn your requirements into working software.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                <Mail size={22} />
              </div>
              <div>
                <h2 className="font-bold text-base mb-0.5">Email</h2>
                <a href="mailto:mmusmanlab@gmail.com" className="text-muted-foreground hover:text-primary transition-colors text-base font-medium">
                  mmusmanlab@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                <Phone size={22} />
              </div>
              <div>
                <h2 className="font-bold text-base mb-0.5">Phone &amp; WhatsApp</h2>
                <div className="flex flex-col gap-0.5 text-base text-muted-foreground font-medium">
                  <a href="tel:+2347061797301" className="hover:text-primary transition-colors">+234 70 6179 7301</a>
                  <a href="tel:+2348160784464" className="hover:text-primary transition-colors">+234 81 6078 4464</a>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                <MapPin size={22} />
              </div>
              <div>
                <h2 className="font-bold text-base mb-0.5">Location &amp; Remote Work</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Kano State, Nigeria · Available worldwide for remote engineering, asynchronous collaboration, and contract development.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 text-xs text-muted-foreground flex items-center gap-3">
              <ShieldCheck size={20} className="text-primary shrink-0" />
              <span>Direct engineer response within 24-48 hours. No middleman agencies or spam.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <Card className="p-8 md:p-10 border-primary/20 bg-card/60 backdrop-blur-md rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            {isSent ? (
              <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-2">
                  <CheckCircle2 size={42} />
                </div>
                <h2 className="font-headline text-2xl md:text-3xl font-bold">Inquiry Received</h2>
                <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
                  Thank you for describing your project. I will review the scope and get back to you with insights and next steps.
                </p>
                <Button onClick={() => setIsSent(false)} variant="outline" className="h-12 px-6 rounded-xl font-bold">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    Project Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full h-12 bg-background border border-muted-foreground/30 focus:border-primary rounded-xl px-4 text-sm font-medium text-foreground outline-none transition-colors"
                  >
                    {projectTypes.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Your Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      autoComplete="name"
                      maxLength={100}
                      placeholder="Alex Taylor"
                      required
                      className="h-12 bg-background border-muted-foreground/30 rounded-xl text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      placeholder="alex@company.com"
                      required
                      className="h-12 bg-background border-muted-foreground/30 rounded-xl text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="company" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Organization / Project Name (Optional)
                  </label>
                  <Input
                    id="company"
                    name="company"
                    maxLength={100}
                    placeholder="Startup, Company, or Project Name"
                    className="h-12 bg-background border-muted-foreground/30 rounded-xl text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Project Details &amp; Requirements *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    minLength={10}
                    maxLength={5000}
                    placeholder="Tell me about what you want to build, the current state of your code, or the specific technical challenge you are facing..."
                    required
                    className="min-h-[140px] bg-background border-muted-foreground/30 rounded-xl text-base resize-none"
                  />
                </div>

                {/* Honeypot field for bot protection */}
                <div className="absolute -left-[10000px]" aria-hidden="true">
                  <label htmlFor="website">Leave this field empty</label>
                  <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                {submitError && (
                  <p role="alert" className="text-sm text-destructive font-medium">
                    {submitError}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 rounded-xl text-base font-bold shadow-lg shadow-primary/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={20} />
                      Submitting Inquiry...
                    </>
                  ) : (
                    <>
                      Send Project Inquiry <Send className="ml-2" size={18} />
                    </>
                  )}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}