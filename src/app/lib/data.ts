export interface Project {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  overview?: string;
  features?: string[];
  image: string;
  imageAlt?: string;
  technologies: string[];
  demoUrl?: string;
  repoUrl?: string;
  category: "Web" | "Mobile" | "Tool" | "Technical";
  lastModified?: string;
}

export interface Skill {
  name: string;
  proficiency: number; // 1-100
  category: "Frontend" | "Backend" | "Mobile" | "Tools";
}

export const projects: Project[] = [
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
    lastModified: "2026-09-30"
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
    lastModified: "2026-09-30"
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
    lastModified: "2026-09-30"
  },
  {
    id: "technical-systems",
    name: "Technical Infrastructure & Systems",
    shortDescription: "Development and management of technical network infrastructure.",
    fullDescription: "Beyond application development, I have extensive experience managing technical infrastructure. This includes optimizing network services and developing specialized technical systems that bridge hardware and software requirements.",
    overview: "Work described as network infrastructure management and technical systems spanning hardware and software requirements.",
    image: "https://picsum.photos/seed/tech/800/600",
    imageAlt: "Placeholder image for network infrastructure and technical systems work",
    technologies: ["Network Management", "IoT", "Systems Design"],
    category: "Technical",
    lastModified: "2026-09-30"
  }
];

export const skills: Skill[] = [
  { name: "Next.js / React", proficiency: 92, category: "Frontend" },
  { name: "React Native / Expo", proficiency: 95, category: "Mobile" },
  { name: "Node.js / Express", proficiency: 90, category: "Backend" },
  { name: "TypeScript", proficiency: 88, category: "Frontend" },
  { name: "Firebase", proficiency: 90, category: "Backend" },
  { name: "MongoDB", proficiency: 85, category: "Backend" },
  { name: "Python / Flask", proficiency: 80, category: "Backend" },
  { name: "Tailwind CSS", proficiency: 94, category: "Frontend" },
  { name: "PostgreSQL", proficiency: 82, category: "Backend" },
  { name: "Git / Docker", proficiency: 85, category: "Tools" }
];
