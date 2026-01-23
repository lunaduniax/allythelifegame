import { FC } from 'react';
import { Project } from '@/types';
import { ProjectCard } from './ProjectCard';
import { Plus } from 'lucide-react';

interface ProjectsCarouselProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  getProgress: (project: Project) => number;
  onCreateProject: () => void;
}

export const ProjectsCarousel: FC<ProjectsCarouselProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  getProgress,
  onCreateProject
}) => {
  return (
    <div className="overflow-x-auto scrollbar-hide pb-4 scroll-smooth overscroll-x-contain touch-pan-x snap-x snap-mandatory">
      <div className="flex flex-nowrap gap-3 px-5 my-0 py-[9px]">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            progress={getProgress(project)}
            isSelected={project.id === selectedProjectId}
            onSelect={() => onSelectProject(project.id)}
          />
        ))}
        
        {/* Create New Goal Card */}
        <button
          onClick={onCreateProject}
          className="flex-shrink-0 w-44 p-4 rounded-xl cursor-pointer transition-all duration-200 border border-border bg-card/50 hover:bg-card hover:border-muted-foreground/30 flex flex-col items-center justify-center gap-2 snap-start"
        >
          <Plus size={28} className="text-muted-foreground" />
          <span className="font-semibold leading-tight text-xl text-muted-foreground">
            Crear nueva meta
          </span>
        </button>
      </div>
    </div>
  );
};