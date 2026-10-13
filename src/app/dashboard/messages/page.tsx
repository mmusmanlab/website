"use client";

import { useState, useEffect } from "react";
import { Mail, RefreshCw, ArrowRight, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/data");
      if (res.ok) {
        const json = await res.json();
        setMessages(json.contactMessages || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight">
              Client &amp; Project Inquiries
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              {messages.length} Total
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Project inquiries submitted via the public contact form at /contact.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadMessages} className="rounded-xl font-bold">
          <RefreshCw size={14} className={loading ? "animate-spin mr-1.5" : "mr-1.5"} /> Refresh Inbox
        </Button>
      </div>

      {messages.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl bg-card border-dashed border space-y-3">
          <Mail size={40} className="text-muted-foreground mx-auto mb-2 opacity-50" />
          <h3 className="font-bold text-lg">No Inquiries Received Yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            When potential clients or collaborators submit project requests through the contact form, their name, email, project type, and requirements will be stored and displayed here.
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          {messages.map((msg, i) => (
            <Card key={msg.id || i} className="p-6 md:p-8 rounded-3xl bg-card border-border/70 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">{msg.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <a href={`mailto:${msg.email}`} className="text-primary hover:underline font-medium">
                        {msg.email}
                      </a>
                      {msg.company && msg.company !== "N/A" && (
                        <>
                          <span>·</span>
                          <span>{msg.company}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {msg.projectType || "General Software Inquiry"}
                  </Badge>
                  <time className="text-xs text-muted-foreground font-medium">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : "Recent"}
                  </time>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 font-normal">
                {msg.message}
              </div>

              <div className="flex justify-end pt-1">
                <Button size="sm" asChild className="rounded-xl font-bold text-xs h-9">
                  <a href={`mailto:${msg.email}?subject=RE: Project Inquiry (${encodeURIComponent(msg.projectType || "Software")})`}>
                    Reply Directly via Email <ArrowRight size={13} className="ml-1.5" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
