import { NextRequest, NextResponse } from "next/server";
import { isDashboardAuthorized } from "@/lib/dashboard-auth";
import { saveProject, deleteProject, Project } from "@/lib/projects-store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.name || !body.id || !body.shortDescription || !body.fullDescription) {
      return NextResponse.json({ error: "Project ID, name, short description, and full description are required." }, { status: 400 });
    }

    const project: Project = {
      id: body.id.trim().toLowerCase().replace(/\s+/g, "-"),
      name: body.name.trim(),
      shortDescription: body.shortDescription.trim(),
      fullDescription: body.fullDescription.trim(),
      overview: body.overview?.trim() || body.shortDescription.trim(),
      features: Array.isArray(body.features) ? body.features : [],
      image: body.image || "https://picsum.photos/seed/project/800/600",
      imageAlt: body.imageAlt || `${body.name} project screenshot`,
      technologies: Array.isArray(body.technologies) ? body.technologies : ["TypeScript"],
      demoUrl: body.demoUrl?.trim(),
      repoUrl: body.repoUrl?.trim(),
      category: body.category || "Web",
      lastModified: new Date().toISOString().split("T")[0],
    };

    const saved = await saveProject(project);
    return NextResponse.json({ success: true, project: saved });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save project" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const deleted = await deleteProject(id);
    if (!deleted) {
      return NextResponse.json({ error: "Project not found or could not be deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Project deleted successfully." });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
