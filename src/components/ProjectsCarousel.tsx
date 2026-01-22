import { FC } from 'react';
import { Project } from '@/types';
import { ProjectCard } from './ProjectCard';

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
  onCreateProject,
}) => {
  // Sort to put yellow card last
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.color === 'yellow' && b.color !== 'yellow') return 1;
    if (a.color !== 'yellow' && b.color === 'yellow') return -1;
    return 0;
  });

  return (
    <div className="overflow-x-auto scrollbar-hide pb-4">
      <div className="flex gap-3 px-5">
        {sortedProjects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            progress={getProgress(project)}
            isSelected={project.id === selectedProjectId}
            onSelect={() => onSelectProject(project.id)}
            onCreateNew={onCreateProject}
            isCreateCard={project.color === 'yellow'}
          />
        ))}
      </div>
    </div>
  );
};
