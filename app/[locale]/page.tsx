import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { RightNow } from "@/components/RightNow";
import { Projects } from "@/components/projects/Projects";
import { ProjectSelectionProvider } from "@/components/projects/ProjectSelection";
import { Skills } from "@/components/skills/Skills";
import { projects } from "@/content/projects";
import { defaultSelectedProject, visibleProjects } from "@/lib/status";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProjectSelectionProvider
        defaultSelectedId={defaultSelectedProject(projects)?.id ?? visibleProjects(projects)[0]?.id}
      >
        <Projects />
        <Skills />
      </ProjectSelectionProvider>
      <RightNow />
      <About />
      <Contact />
    </>
  );
}
