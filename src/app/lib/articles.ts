export interface Article {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  content: { heading: string; paragraphs: string[]; bullets?: string[] }[];
  relatedProjects: string[];
}

export const articles: Article[] = [
  {
    slug: "react-native-ecommerce-expo-firebase",
    title: "How I Built a React Native E-commerce App with Expo and Firebase",
    description: "A case study of Amtech Shop, a cross-platform retail app described with shopping, product updates, payment integration and inventory administration.",
    publishedAt: "2026-09-30",
    updatedAt: "2026-09-30",
    category: "Mobile Development",
    tags: ["React Native", "Expo", "Firebase", "TypeScript", "E-commerce"],
    content: [
      {
        heading: "Project overview",
        paragraphs: [
          "Amtech Shop is described as an Android and iOS e-commerce application for retail businesses. The project record identifies React Native and Expo for the app and lists Firebase and TypeScript in its stack.",
          "The available project information describes the product scope, but does not document implementation details such as Firebase services, payment provider, data model or deployment process. This case study stays with the documented scope rather than filling those gaps with assumptions.",
        ],
      },
      {
        heading: "Documented functionality",
        paragraphs: ["The project description names these areas of functionality:"],
        bullets: ["A shopping experience", "Real-time product updates", "Payment integration", "An inventory administration dashboard"],
      },
      {
        heading: "Technology choices",
        paragraphs: [
          "React Native and Expo are the named mobile technologies, with Firebase and TypeScript also listed for the project. The project record does not specify how responsibilities were divided among those technologies, so no further architecture claims are made here.",
        ],
      },
    ],
    relatedProjects: ["amtech-shop"],
  },
  {
    slug: "household-budget-tracker-react-native-expo",
    title: "Building a Household Budget Tracker with React Native and Expo",
    description: "A factual overview of Leftly, an Expo and React Native household budgeting project with expense tracking, overspending alerts and spending insights.",
    publishedAt: "2026-09-30",
    updatedAt: "2026-09-30",
    category: "Mobile Development",
    tags: ["React Native", "Expo", "TypeScript", "Redux", "Personal Finance"],
    content: [
      {
        heading: "Project overview",
        paragraphs: [
          "Leftly is described as a household budget and expense-tracking tool built with Expo. Its listed technologies are Expo, React Native, TypeScript and Redux.",
          "The project description focuses on helping households keep track of budgets and expenses. It does not specify account models, storage, synchronization behavior or alert thresholds, so those implementation details are not assumed here.",
        ],
      },
      {
        heading: "Documented functionality",
        paragraphs: ["The available project description names these user-facing functions:"],
        bullets: ["Household budget tracking", "Expense management", "Alerts for overspending", "Graphical insights into spending habits"],
      },
      {
        heading: "Technology choices",
        paragraphs: [
          "The project record lists React Native and Expo alongside TypeScript and Redux. It does not describe specific Redux state boundaries or the implementation of the visual insights, so the case study limits itself to the named stack and functionality.",
        ],
      },
    ],
    relatedProjects: ["leftly"],
  },
  {
    slug: "educational-platform-nextjs-typescript",
    title: "Building an Educational Platform with Next.js and TypeScript",
    description: "A project-based look at Praxivon, an educational website organized around structured learning paths, courses and visual academic progress.",
    publishedAt: "2026-09-30",
    updatedAt: "2026-09-30",
    category: "Web Development",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Education"],
    content: [
      {
        heading: "Project overview",
        paragraphs: [
          "Praxivon is described as an educational website that gives students structured learning paths and access to courses. The project description also names visual academic progress tracking.",
          "The listed technology stack is Next.js, TypeScript, Tailwind CSS and Node.js. The available project information does not document the course data model, user authentication, content-management approach or server implementation, so those details are intentionally left out.",
        ],
      },
      {
        heading: "Documented functionality",
        paragraphs: ["The project record describes three main product areas:"],
        bullets: ["Structured learning paths", "Course access", "Visual academic progress tracking"],
      },
      {
        heading: "Technology choices",
        paragraphs: [
          "Next.js and TypeScript are identified as the core web technologies, with Tailwind CSS and Node.js also listed. The portfolio describes the interface as SEO-friendly, but does not provide performance measurements or further architectural specifics.",
        ],
      },
    ],
    relatedProjects: ["praxivon"],
  },
];