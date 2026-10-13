import fs from "fs/promises";
import path from "path";
import { Project } from "@/app/lib/data";
import { cloudflareD1Adapter } from "./storage-adapters";

export type { Project };

export const initialProjects: Project[] = [
  {
    id: "amtech-shop",
    name: "Amtech Shop",
    shortDescription: "A cross-platform e-commerce solution for retail businesses.",
    fullDescription: "Amtech Shop is a comprehensive Android and iOS e-commerce application built with React Native and Expo. It features a seamless shopping experience, real-time product updates, secure payment integration, and a dedicated admin dashboard for inventory management.",
    overview: "A cross-platform Android and iOS e-commerce application for retail businesses, described as using React Native, Expo, Firebase and TypeScript.",
    features: ["Shopping experience", "Real-time product updates", "Payment integration", "Inventory administration dashboard"],
    image: "https://picsum.photos/seed/amtech/800/600",
    imageAlt: "Placeholder image for Amtech Shop, a mobile e-commerce project",
    technologies: ["React Native", "Expo", "Firebase", "TypeScript"],
    category: "Mobile",
    lastModified: "2026-09-30",
  },
  {
    id: "leftly",
    name: "Leftly",
    shortDescription: "Household financial budget tracker and real-time alert system.",
    fullDescription: "Leftly is a specialized financial tool built with Expo to help households track budgets and manage expenses. It includes smart alert systems for overspending and graphical insights into spending habits, ensuring financial discipline for families.",
    overview: "A household budget and expense-tracking application built with Expo and React Native.",
    features: ["Household budget tracking", "Expense management", "Overspending alerts", "Graphical spending insights"],
    image: "https://picsum.photos/seed/leftly/800/600",
    imageAlt: "Placeholder image for Leftly, a household budget tracker project",
    technologies: ["Expo", "React Native", "TypeScript", "Redux"],
    category: "Mobile",
    lastModified: "2026-09-30",
  },
  {
    id: "praxivon",
    name: "Praxivon",
    shortDescription: "Path-level educational platform for online learning.",
    fullDescription: "Praxivon is an educational website designed to provide structured learning paths. Built with Next.js and TypeScript, it offers a fast, SEO-friendly interface for students to access courses and track their academic progress visually.",
    overview: "An educational website for structured learning paths, course access and visual academic progress tracking.",
    features: ["Structured learning paths", "Course access", "Visual academic progress tracking"],
    image: "https://picsum.photos/seed/praxivon/800/600",
    imageAlt: "Placeholder image for Praxivon, an educational platform project",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Node.js"],
    category: "Web",
    lastModified: "2026-09-30",
  },
  {
    id: "technical-systems",
    name: "Technical Infrastructure & Systems",
    shortDescription: "Development and management of technical network infrastructure.",
    fullDescription: "Beyond application development, I have extensive experience managing technical infrastructure. This includes optimizing network services and developing specialized technical systems that bridge hardware and software requirements.",
    overview: "Work described as network infrastructure management and technical systems spanning hardware and software requirements.",
    features: ["Network routing & service reliability", "Infrastructure monitoring", "Internal diagnostic tooling"],
    image: "https://picsum.photos/seed/tech/800/600",
    imageAlt: "Placeholder image for network infrastructure and technical systems work",
    technologies: ["Network Management", "IoT", "Systems Design"],
    category: "Technical",
    lastModified: "2026-09-30",
  },
];

const PROJECTS_FILE_PATH = path.join(process.cwd(), "src/lib/data/projects.json");
let memoryProjects: Project[] = [...initialProjects];
let isSeeded = false;

async function seedInitialProjectsToD1() {
  if (isSeeded) return;
  try {
    for (const proj of initialProjects) {
      await cloudflareD1Adapter.saveProject(proj);
    }
    isSeeded = true;
  } catch (err) {
    console.warn("[ProjectsStore] Could not auto-seed to D1:", err);
  }
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    const d1Projects = await cloudflareD1Adapter.getAllProjects();
    if (d1Projects && d1Projects.length > 0) {
      memoryProjects = d1Projects;
      return d1Projects;
    }
  } catch (err) {
    console.warn("[ProjectsStore] D1 query failed, using fallback:", err);
  }

  // Seed to D1 if D1 was empty
  await seedInitialProjectsToD1();

  // File fallback
  try {
    const raw = await fs.readFile(PROJECTS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryProjects = parsed;
      return parsed;
    }
  } catch {
    try {
      await fs.mkdir(path.dirname(PROJECTS_FILE_PATH), { recursive: true });
      await fs.writeFile(PROJECTS_FILE_PATH, JSON.stringify(initialProjects, null, 2), "utf-8");
    } catch {
      // Memory fallback
    }
  }

  return memoryProjects;
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const d1Project = await cloudflareD1Adapter.getProjectById(id);
    if (d1Project) return d1Project;
  } catch (err) {
    console.warn("[ProjectsStore] D1 getProjectById failed:", err);
  }

  const all = await getAllProjects();
  return all.find((p) => p.id === id) ?? null;
}

export async function saveProject(project: Project): Promise<Project> {
  const updatedProject = {
    ...project,
    lastModified: new Date().toISOString().split("T")[0],
  };

  try {
    await cloudflareD1Adapter.saveProject(updatedProject);
  } catch (err) {
    console.warn("[ProjectsStore] Failed saving project to D1:", err);
  }

  const all = await getAllProjects();
  const index = all.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    all[index] = updatedProject;
  } else {
    all.push(updatedProject);
  }
  memoryProjects = all;

  try {
    await fs.mkdir(path.dirname(PROJECTS_FILE_PATH), { recursive: true });
    await fs.writeFile(PROJECTS_FILE_PATH, JSON.stringify(all, null, 2), "utf-8");
  } catch {
    // Memory fallback
  }

  return updatedProject;
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    await cloudflareD1Adapter.deleteProject(id);
  } catch (err) {
    console.warn("[ProjectsStore] Failed deleting project from D1:", err);
  }

  const all = await getAllProjects();
  const filtered = all.filter((p) => p.id !== id);
  if (filtered.length === all.length) {
    return false;
  }

  memoryProjects = filtered;
  try {
    await fs.writeFile(PROJECTS_FILE_PATH, JSON.stringify(filtered, null, 2), "utf-8");
  } catch {
    // Memory fallback
  }
  return true;
}
