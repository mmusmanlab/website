import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { isDashboardAuthorized } from "@/lib/dashboard-auth";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    console.error("[Upload] Error creating upload dir:", err);
  }
}

/**
 * GET /api/upload
 * List all locally uploaded images in /public/uploads
 */
export async function GET(request: NextRequest) {
  try {
    await ensureUploadDir();
    const files = await fs.readdir(UPLOAD_DIR);
    
    const fileStats = await Promise.all(
      files
        .filter((file) => !file.startsWith(".") && /\.(png|jpe?g|webp|gif|svg)$/i.test(file))
        .map(async (filename) => {
          try {
            const filePath = path.join(UPLOAD_DIR, filename);
            const stat = await fs.stat(filePath);
            return {
              filename,
              url: `/uploads/${filename}`,
              size: stat.size,
              createdAt: stat.birthtime.toISOString(),
              modifiedAt: stat.mtime.toISOString(),
            };
          } catch {
            return null;
          }
        })
    );

    const validFiles = fileStats
      .filter(Boolean)
      .sort((a, b) => new Date(b!.modifiedAt).getTime() - new Date(a!.modifiedAt).getTime());

    return NextResponse.json({
      success: true,
      storageDriver: "local",
      r2Status: "future_pending_billing",
      count: validFiles.length,
      files: validFiles,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to list uploads" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/upload
 * Handles local file upload into /public/uploads
 */
export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();

    const contentType = request.headers.get("content-type") || "";

    // 1. Multipart Form Data upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided in form data" }, { status: 400 });
      }

      // Validate mime type
      const mime = file.type || "application/octet-stream";
      const isImage = mime.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name);
      if (!isImage) {
        return NextResponse.json({ error: "Only image files (PNG, JPG, WebP, GIF, SVG) are accepted." }, { status: 400 });
      }

      // Max size: 10MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File exceeds 10MB maximum limit." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
      const filename = `${Date.now()}-${sanitizedName}`;
      const filePath = path.join(UPLOAD_DIR, filename);

      await fs.writeFile(filePath, buffer);

      const url = `/uploads/${filename}`;
      return NextResponse.json({
        success: true,
        url,
        filename,
        size: file.size,
        mimeType: mime,
        storageDriver: "local",
        message: "Image successfully uploaded to local storage (/public/uploads).",
      });
    }

    // 2. Base64 JSON upload fallback
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { filename: rawName, base64, mimeType = "image/png" } = body;

      if (!base64) {
        return NextResponse.json({ error: "Missing base64 image data" }, { status: 400 });
      }

      const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");

      const ext = mimeType.split("/")[1] || "png";
      const sanitizedName = (rawName || `image.${ext}`).replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
      const filename = `${Date.now()}-${sanitizedName}`;
      const filePath = path.join(UPLOAD_DIR, filename);

      await fs.writeFile(filePath, buffer);

      const url = `/uploads/${filename}`;
      return NextResponse.json({
        success: true,
        url,
        filename,
        size: buffer.length,
        mimeType,
        storageDriver: "local",
        message: "Image successfully uploaded to local storage (/public/uploads).",
      });
    }

    return NextResponse.json({ error: "Unsupported Content-Type. Use multipart/form-data or application/json" }, { status: 400 });
  } catch (err: any) {
    console.error("[Upload API Error]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload?filename=...
 */
export async function DELETE(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    // Security check to avoid path traversal
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, safeName);

    await fs.unlink(filePath);

    return NextResponse.json({
      success: true,
      message: `Deleted ${safeName} from local storage.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to delete file" },
      { status: 500 }
    );
  }
}
