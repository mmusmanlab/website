"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Heading2,
  Heading3,
  Eye,
  Edit3,
  Eraser,
  Copy,
  Check,
  Undo2,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
  helperText?: string;
  className?: string;
}

export function WysiwygEditor({
  value,
  onChange,
  placeholder = "Write content here...",
  minHeight = "160px",
  label,
  helperText,
  className = "",
}: WysiwygEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const historyRef = useRef<string[]>([value]);
  const historyIndexRef = useRef<number>(0);

  // Sync history if external value changes drastically
  useEffect(() => {
    if (value !== historyRef.current[historyIndexRef.current]) {
      historyRef.current.push(value);
      if (historyRef.current.length > 30) historyRef.current.shift();
      historyIndexRef.current = historyRef.current.length - 1;
    }
  }, [value]);

  const updateContent = (newValue: string) => {
    onChange(newValue);
    historyRef.current.push(newValue);
    if (historyRef.current.length > 30) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
  };

  const undo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      onChange(historyRef.current[historyIndexRef.current]);
    }
  };

  // Helper to wrap or insert text at cursor
  const applyFormat = (prefix: string, suffix: string = prefix, defaultPlaceholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let replacement = "";
    let newCursorPos = start;

    if (selectedText.length > 0) {
      // Wrap selected text
      replacement = `${prefix}${selectedText}${suffix}`;
      newCursorPos = start + prefix.length + selectedText.length + suffix.length;
    } else {
      // Insert placeholder
      const placeholderText = defaultPlaceholder || "text";
      replacement = `${prefix}${placeholderText}${suffix}`;
      newCursorPos = start + prefix.length;
    }

    const updated = value.substring(0, start) + replacement + value.substring(end);
    updateContent(updated);

    setTimeout(() => {
      textarea.focus();
      if (selectedText.length > 0) {
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + (defaultPlaceholder || "text").length);
      }
    }, 10);
  };

  // Line prefix formatting (e.g. lists, blockquotes, headings)
  const applyLinePrefix = (linePrefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Find start of current line
    const beforeCursor = value.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf("\n") + 1;
    const afterCursor = value.substring(end);
    const nextLineEnd = afterCursor.indexOf("\n");
    const lineEnd = nextLineEnd === -1 ? value.length : end + nextLineEnd;

    const currentLine = value.substring(lineStart, lineEnd);
    let updatedLine = "";

    // Toggle off if already prefixed
    if (currentLine.startsWith(linePrefix)) {
      updatedLine = currentLine.substring(linePrefix.length);
    } else {
      updatedLine = `${linePrefix}${currentLine}`;
    }

    const updated = value.substring(0, lineStart) + updatedLine + value.substring(lineEnd);
    updateContent(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + linePrefix.length, end + linePrefix.length);
    }, 10);
  };

  const insertLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || "link text";
    const url = prompt("Enter URL:", "https://");

    if (url) {
      const replacement = `[${selectedText}](${url})`;
      const updated = value.substring(0, start) + replacement + value.substring(end);
      updateContent(updated);
    }
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        const textarea = textareaRef.current;
        const start = textarea?.selectionStart ?? value.length;
        const end = textarea?.selectionEnd ?? value.length;
        const alt = file.name.replace(/\.[^/.]+$/, "");
        const imageMarkdown = `\n\n![${alt}](${data.url})\n\n`;
        const updated = value.substring(0, start) + imageMarkdown + value.substring(end);
        updateContent(updated);
      } else {
        alert(data.error || "Image upload failed");
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const clearFormatting = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (!selectedText) return;

    // Strip common markdown symbols
    const cleaned = selectedText
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/~~(.*?)~~/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^#+\s+/gm, "")
      .replace(/^>\s+/gm, "")
      .replace(/^-\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "");

    const updated = value.substring(0, start) + cleaned + value.substring(end);
    updateContent(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      applyFormat("**", "**", "bold text");
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
      e.preventDefault();
      applyFormat("*", "*", "italic text");
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      insertLink();
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  // Simple, safe preview renderer for common markdown formatting
  const renderSimpleMarkdown = (text: string) => {
    if (!text.trim()) {
      return <p className="text-muted-foreground/60 italic text-sm">No content entered yet...</p>;
    }

    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    lines.forEach((line, i) => {
      if (line.startsWith("### ")) {
        elements.push(
          <h4 key={i} className="text-base font-bold text-foreground mt-3 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h3 key={i} className="text-lg font-bold text-foreground mt-4 mb-1">
            {line.replace("## ", "")}
          </h3>
        );
      } else if (line.startsWith("> ")) {
        elements.push(
          <blockquote key={i} className="border-l-4 border-primary/50 pl-3 italic text-muted-foreground my-2 text-sm bg-muted/10 py-1 rounded-r">
            {line.replace("> ", "")}
          </blockquote>
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(
          <li key={i} className="ml-5 list-disc text-sm text-foreground/90 my-0.5">
            {line.replace(/^[-*]\s+/, "")}
          </li>
        );
      } else if (/^\d+\.\s+/.test(line)) {
        elements.push(
          <li key={i} className="ml-5 list-decimal text-sm text-foreground/90 my-0.5">
            {line.replace(/^\d+\.\s+/, "")}
          </li>
        );
      } else if (line.trim().length === 0) {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(
          <p key={i} className="text-sm text-foreground/90 leading-relaxed mb-1.5">
            {line}
          </p>
        );
      }
    });

    return <div className="space-y-1">{elements}</div>;
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold flex items-center gap-1 transition-colors ${
                activeTab === "write"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Edit3 size={12} /> Edit
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold flex items-center gap-1 transition-colors ${
                activeTab === "preview"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Eye size={12} /> Preview
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border/80 bg-background overflow-hidden shadow-sm focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        {/* WYSIWYG Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 p-2 bg-muted/30 border-b border-border/60 text-muted-foreground">
          <button
            type="button"
            title="Bold (Ctrl+B)"
            onClick={() => applyFormat("**", "**", "bold text")}
            className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg transition-colors"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            title="Italic (Ctrl+I)"
            onClick={() => applyFormat("*", "*", "italic text")}
            className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg transition-colors"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            title="Strikethrough"
            onClick={() => applyFormat("~~", "~~", "strikethrough")}
            className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg transition-colors"
          >
            <Strikethrough size={15} />
          </button>

          <span className="w-px h-4 bg-border/80 mx-1" />

          <button
            type="button"
            title="Heading 2"
            onClick={() => applyLinePrefix("## ")}
            className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg transition-colors"
          >
            <Heading2 size={15} />
          </button>
          <button
            type="button"
            title="Heading 3"
            onClick={() => applyLinePrefix("### ")}
            className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg transition-colors"
          >
            <Heading3 size={15} />
          </button>

          <span className="w-px h-4 bg-border/80 mx-1" />

          <button
            type="button"
            title="Bullet List"
            onClick={() => applyLinePrefix("- ")}
            className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg transition-colors"
          >
            <List size={15} />
          </button>
          <button
            type="button"
            title="Numbered List"
            onClick={() => applyLinePrefix("1. ")}
            className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg transition-colors"
          >
            <ListOrdered size={15} />
          </button>
          <button
            type="button"
            title="Blockquote"
            onClick={() => applyLinePrefix("> ")}
            className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg transition-colors"
          >
            <Quote size={15} />
          </button>

          <span className="w-px h-4 bg-border/80 mx-1" />

          <button
            type="button"
            title="Inline Code"
            onClick={() => applyFormat("`", "`", "code")}
            className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg transition-colors"
          >
            <Code size={15} />
          </button>
          <button
            type="button"
            title="Insert Link (Ctrl+K)"
            onClick={insertLink}
            className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg transition-colors"
          >
            <Link2 size={15} />
          </button>
          <button
            type="button"
            title="Upload and Insert Image (Local Storage)"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploadingImage}
            className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg transition-colors text-primary"
          >
            <ImageIcon size={15} className={isUploadingImage ? "animate-pulse" : ""} />
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFile}
          />

          <span className="w-px h-4 bg-border/80 mx-1" />

          <button
            type="button"
            title="Clear formatting on selection"
            onClick={clearFormatting}
            className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg transition-colors"
          >
            <Eraser size={15} />
          </button>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              title="Undo (Ctrl+Z)"
              onClick={undo}
              className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg transition-colors"
            >
              <Undo2 size={14} />
            </button>
            <button
              type="button"
              title="Copy all text"
              onClick={handleCopy}
              className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === "write" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => updateContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full p-4 bg-transparent text-sm text-foreground outline-none resize-y leading-relaxed font-normal selection:bg-primary/20"
          />
        ) : (
          <div
            style={{ minHeight }}
            className="w-full p-4 bg-muted/10 overflow-y-auto leading-relaxed"
          >
            {renderSimpleMarkdown(value)}
          </div>
        )}

        {/* Footer info: Counts and help */}
        <div className="px-3 py-1.5 bg-muted/20 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{helperText || "Supports Markdown formatting, lists, quotes and code."}</span>
          <div className="flex items-center gap-3">
            <span>{wordCount} words</span>
            <span>{charCount} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
}
