export type SkillStatus = "core" | "learning" | "studied";
export type SkillGroup = "frontend" | "backend" | "tools" | "design" | "university";

export type Skill = {
  id: string;
  label: string;             // technical name, not translated
  group: SkillGroup;
  status: SkillStatus;
  star?: boolean;            // shown in the constellation
  x?: number; y?: number;    // fixed star position in viewBox 340x260 (agent fills once)
  usedIn?: string[];         // project ids
  note?: string;             // key in messages.skills.notes
};

export const skills: Skill[] = [
  // Frontend
  { id: "react", label: "React", group: "frontend", status: "core", star: true, x: 150, y: 115,
    usedIn: ["nabd-masr", "around-the-world", "kanban", "caltrack", "forsa"] },
  { id: "typescript", label: "TypeScript", group: "frontend", status: "core", star: true, x: 205, y: 65,
    usedIn: ["nabd-masr", "around-the-world", "caltrack", "forsa", "portfolio"] },
  { id: "javascript", label: "JavaScript (ES6+)", group: "frontend", status: "core" },
  { id: "router", label: "React Router", group: "frontend", status: "core", star: true, x: 95, y: 50,
    usedIn: ["around-the-world", "caltrack"] },
  { id: "html", label: "HTML5", group: "frontend", status: "core" },
  { id: "css", label: "CSS3", group: "frontend", status: "core" },
  { id: "tailwind", label: "Tailwind CSS", group: "frontend", status: "core", star: true, x: 225, y: 150,
    usedIn: ["around-the-world", "kanban", "forsa", "portfolio"] },
  { id: "mui", label: "Material UI", group: "frontend", status: "core", star: true, x: 50, y: 105,
    usedIn: ["nabd-masr"] },
  { id: "cssmodules", label: "CSS Modules", group: "frontend", status: "core",
    usedIn: ["caltrack"] },
  { id: "nextjs", label: "Next.js", group: "frontend", status: "learning", star: true, x: 290, y: 95,
    usedIn: ["forsa", "portfolio"], note: "nextNote" },
  { id: "redux", label: "Redux Toolkit", group: "frontend", status: "learning", star: true, x: 165, y: 205,
    usedIn: ["kanban"] },

  // Backend and APIs
  { id: "rest", label: "REST APIs", group: "backend", status: "core", star: true, x: 85, y: 170,
    usedIn: ["nabd-masr", "around-the-world", "notenest"] },
  { id: "node", label: "Node.js and Express", group: "backend", status: "learning", star: true, x: 45, y: 220,
    usedIn: ["notenest"] },
  { id: "mongo", label: "MongoDB and Mongoose", group: "backend", status: "learning", star: true, x: 125, y: 235,
    usedIn: ["notenest"] },

  // Testing, tools and OS
  { id: "vitest", label: "Vitest", group: "tools", status: "core", star: true, x: 285, y: 30, note: "vitestNote" },
  { id: "postman", label: "Postman", group: "tools", status: "core", usedIn: ["notenest"] },
  { id: "git", label: "Git", group: "tools", status: "core" },
  { id: "github", label: "GitHub", group: "tools", status: "core" },
  { id: "vite", label: "Vite", group: "tools", status: "core", usedIn: ["nabd-masr", "around-the-world"] },
  { id: "netlify", label: "Netlify", group: "tools", status: "core" },
  { id: "vercel", label: "Vercel", group: "tools", status: "core" },
  { id: "linux", label: "Linux (Fedora)", group: "tools", status: "core" },
  { id: "cli", label: "Command line", group: "tools", status: "core" },

  // Design and UI
  { id: "figma", label: "Figma", group: "design", status: "core", star: true, x: 290, y: 210, note: "figmaNote" },
  { id: "responsive", label: "Responsive design", group: "design", status: "core" },
  { id: "a11y", label: "Web accessibility", group: "design", status: "core" },
  { id: "theming", label: "Light/dark theming", group: "design", status: "core" },

  // University coursework (owner may delete any of these, see TODO.md)
  { id: "python", label: "Python", group: "university", status: "studied" },
  { id: "cpp", label: "C++", group: "university", status: "studied" },
  { id: "csharp", label: "C#", group: "university", status: "studied" },
  { id: "sqlserver", label: "SQL Server", group: "university", status: "studied" },
  { id: "oop", label: "OOP", group: "university", status: "studied" },
  { id: "dsa", label: "Data structures and algorithms", group: "university", status: "studied" },
];
