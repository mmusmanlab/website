"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Your message could not be sent. Please try again.");
      }

      setIsSent(true);
      form.reset();
      toast({ title: "Message sent", description: "Your message was delivered. Thank you for reaching out." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Your message could not be sent. Please try again.";
      setSubmitError(message);
      toast({ title: "Message not sent", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-16 lg:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div className="space-y-12">
            <div>
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">Let's <span className="text-primary">Connect</span></h1>
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">Whether you have a digital project idea, need a solar installation, or just want to discuss a custom power solution, I'm here to help.</p>
            </div>
            <div className="space-y-8">
              <div className="flex items-start gap-5 group">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0"><Mail size={24} /></div>
                <div><h2 className="font-bold text-lg mb-1">Email</h2><a href="mailto:mmusmanlab@gmail.com" className="text-muted-foreground hover:text-primary transition-colors text-lg">mmusmanlab@gmail.com</a></div>
              </div>
              <div className="flex items-start gap-5 group">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0"><Phone size={24} /></div>
                <div><h2 className="font-bold text-lg mb-1">Phone</h2><div className="flex flex-col gap-1"><a href="tel:+2347061797301" className="text-muted-foreground hover:text-primary transition-colors text-lg">+234 70 6179 7301</a><a href="tel:+2348160784464" className="text-muted-foreground hover:text-primary transition-colors text-lg">+234 81 6078 4464</a></div></div>
              </div>
              <div className="flex items-start gap-5 group">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0"><MapPin size={24} /></div>
                <div><h2 className="font-bold text-lg mb-1">Office Location</h2><p className="text-muted-foreground text-lg leading-relaxed">No. 106 block A1 upstairs,<br />Bichi general market,<br />Kano State, Nigeria</p></div>
              </div>
            </div>
          </div>

          <Card className="p-8 md:p-12 border-primary/20 bg-card/50 backdrop-blur-md rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            {isSent ? (
              <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary mb-4"><CheckCircle2 size={48} /></div>
                <h2 className="font-headline text-3xl font-bold">Message Delivered!</h2>
                <p className="text-muted-foreground text-lg max-w-xs mx-auto">Your message was delivered. Thank you for reaching out.</p>
                <Button onClick={() => setIsSent(false)} variant="outline" className="h-12 px-8 rounded-xl">Send Another Message</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3"><label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label><Input id="name" name="name" autoComplete="name" maxLength={100} placeholder="Enter your name" required className="h-14 bg-background/50 focus:ring-primary border-muted-foreground/20 rounded-2xl text-lg" /></div>
                <div className="space-y-3"><label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label><Input id="email" name="email" type="email" autoComplete="email" maxLength={254} placeholder="example@mail.com" required className="h-14 bg-background/50 focus:ring-primary border-muted-foreground/20 rounded-2xl text-lg" /></div>
                <div className="space-y-3"><label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Your Message</label><Textarea id="message" name="message" minLength={10} maxLength={5000} placeholder="How can I help you today?" required className="min-h-[160px] bg-background/50 focus:ring-primary border-muted-foreground/20 rounded-2xl text-lg resize-none" /></div>
                <div className="absolute -left-[10000px]" aria-hidden="true"><label htmlFor="website">Leave this field empty</label><input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
                {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
                <Button type="submit" size="lg" className="w-full h-16 rounded-2xl text-xl font-extrabold transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 animate-spin" size={24} />Transmitting...</> : <>Send Message<Send className="ml-2" size={20} /></>}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}