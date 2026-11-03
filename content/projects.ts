export type ProjectStatus = "done" | "in-progress" | "planned";
export type ProjectKind = "fullstack" | "frontend" | "backend";
export type Link = string | null | "TODO";

export type Project = {
  id: string;
  status: ProjectStatus;
  kind: ProjectKind;
  featured: boolean;
  orbit?: 1 | 2 | 3;   // required unless status is "planned"
  angle?: number;      // degrees, required unless status is "planned"
  stack: string[];
  links: { live: Link; repo: Link };
  images: string[];    // paths under /public; [] = no screenshots
};

// Array order = display order (list view, Fast mode).
export const projects: Project[] = [
  { id: "nabd-masr", status: "done", kind: "frontend", featured: true, orbit: 1, angle: 40,
    stack: ["React", "TypeScript", "Material UI", "Vite"],
    links: { live: null, repo: "https://github.com/N3ssar/nabd-masr" },
    images: [
      "/projects/nabd-masr/landing-page.png",
      "/projects/nabd-masr/search-results.png",
      "/projects/nabd-masr/loading-state.png",
    ] },

  { id: "around-the-world", status: "done", kind: "frontend", featured: true, orbit: 2, angle: 150,
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "React Router"],
    links: { live: "https://around-the-w0rld.vercel.app/", repo: "TODO" },
    images: [] },

  { id: "notenest", status: "done", kind: "backend", featured: true, orbit: 2, angle: 285,
    stack: ["Node.js", "Express.js", "MongoDB", "Mongoose", "Postman"],
    links: { live: null, repo: "https://github.com/N3ssar/NoteNest" },
    images: [] },

  { id: "forsa", status: "in-progress", kind: "fullstack", featured: true, orbit: 1, angle: 225,
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS"], // TODO owner: add the database and auth library once chosen
    links: { live: null, repo: "https://github.com/N3ssar/forsa" }, // live demo hidden on purpose until applying/admin work
    images: [] },

  { id: "kanban", status: "done", kind: "frontend", featured: false, orbit: 3, angle: 90,
    stack: ["React", "Redux Toolkit", "Tailwind CSS"],
    links: { live: "https://flowban-app.netlify.app/", repo: "TODO" },
    images: ["/projects/kanban/board.png", "/projects/kanban/task-details.png"] },

  { id: "caltrack", status: "done", kind: "frontend", featured: false, orbit: 3, angle: 210,
    stack: ["React", "TypeScript", "React Router", "CSS Modules"],
    links: { live: "https://clatrack.netlify.app/", repo: "TODO" },
    images: ["/projects/caltrack/tracker.png", "/projects/caltrack/form-validation.png"] },

  { id: "portfolio", status: "done", kind: "fullstack", featured: false, orbit: 3, angle: 355,
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "next-intl", "Resend"],
    links: { live: null, repo: "TODO" }, // live is null: the visitor is already on it
    images: [] },

  { id: "wasla", status: "planned", kind: "fullstack", featured: false,
    stack: ["MongoDB", "Express.js", "React", "Node.js"],
    links: { live: null, repo: null },
    images: [] },
];
