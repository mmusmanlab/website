"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  FolderOpen,
  Link2,
  HardDrive,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  className?: string;
}

interface UploadedFile {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Featured Image",
  helperText = "Upload a local image (PNG, JPG, WebP) or enter an image URL.",
  className = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"upload" | "url">("upload");
  const [showGallery, setShowGallery] = useState(false);
  const [galleryFiles, setGalleryFiles] = useState<UploadedFile[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLocalUpload = value?.startsWith("/uploads/");

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/") && !/\.(png|jpe?g|webp|gif|svg)$/i.test(file.name)) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WebP, GIF, SVG).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image exceeds 10MB limit.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success && data.url) {
        onChange(data.url);
      } else {
        throw new Error(data.error || "Failed to upload image.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Upload failed. Please retry.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const loadGallery = async () => {
    setLoadingGallery(true);
    try {
      const res = await fetch("/api/upload");
      const data = await res.json();
      if (res.ok && data.files) {
        setGalleryFiles(data.files);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGallery(false);
    }
  };

  const toggleGallery = () => {
    if (!showGallery) {
      loadGallery();
    }
    setShowGallery(!showGallery);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header and Toggle Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
            {label}
          </label>
          {helperText && <p className="text-[11px] text-muted-foreground mt-0.5">{helperText}</p>}
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Button
            type="button"
            variant={inputMode === "upload" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setInputMode("upload")}
            className="h-7 text-xs px-2.5 rounded-lg font-semibold"
          >
            <Upload size={12} className="mr-1" /> Local Upload
          </Button>
          <Button
            type="button"
            variant={inputMode === "url" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setInputMode("url")}
            className="h-7 text-xs px-2.5 rounded-lg font-semibold"
          >
            <Link2 size={12} className="mr-1" /> Image URL
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleGallery}
            className="h-7 text-xs px-2.5 rounded-lg border-border/70 text-muted-foreground hover:text-foreground"
          >
            <FolderOpen size={12} className="mr-1" /> Browse
          </Button>
        </div>
      </div>

      {/* Upload Zone or URL Input */}
      {inputMode === "upload" ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-border/80 hover:border-primary/60 bg-muted/10 hover:bg-muted/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              {isUploading ? (
                <RefreshCw size={20} className="animate-spin text-primary" />
              ) : (
                <Upload size={20} />
              )}
            </div>

            <div>
              <p className="text-sm font-bold text-foreground">
                {isUploading ? "Uploading to local storage..." : "Click to select or drag and drop image"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                PNG, JPG, WebP up to 10MB &bull; Stored locally in{" "}
                <code className="text-primary font-mono text-[11px]">/public/uploads</code>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://picsum.photos/seed/project/800/600 or /uploads/..."
            className="rounded-xl h-10 text-xs font-mono"
          />
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20 font-medium">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Current Image Preview */}
      {value && (
        <div className="relative rounded-2xl border border-border/80 bg-card overflow-hidden p-3 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-muted/40 shrink-0 border border-border/50">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://picsum.photos/seed/fallback/800/600";
              }}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold truncate">{value.split("/").pop() || "Image"}</span>
              {isLocalUpload ? (
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono">
                  <HardDrive size={10} className="mr-1" /> Local Storage
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
                  External URL
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground font-mono truncate">{value}</p>
            <p className="text-[10px] text-muted-foreground">
              Ready for production. When Cloudflare R2 is enabled later, local files will sync automatically.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              className="h-8 text-xs text-destructive hover:bg-destructive/10 rounded-lg px-2.5"
            >
              <X size={14} className="mr-1" /> Remove
            </Button>
          </div>
        </div>
      )}

      {/* Gallery Selector Modal / Drawer */}
      {showGallery && (
        <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen size={16} className="text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Local Image Library (/public/uploads)</h4>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowGallery(false)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </Button>
          </div>

          {loadingGallery ? (
            <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
              <RefreshCw size={14} className="animate-spin mr-2" /> Loading uploads...
            </div>
          ) : galleryFiles.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No local images uploaded yet. Use the upload zone above to upload project screenshots or diagrams.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1">
              {galleryFiles.map((file) => (
                <button
                  key={file.filename}
                  type="button"
                  onClick={() => {
                    onChange(file.url);
                    setShowGallery(false);
                  }}
                  className={`group relative rounded-xl border p-1 text-left transition-all overflow-hidden ${
                    value === file.url
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "border-border/60 hover:border-primary/50 bg-muted/10"
                  }`}
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/40 mb-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] font-mono truncate text-foreground px-1">{file.filename}</p>
                  <p className="text-[9px] text-muted-foreground px-1">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
