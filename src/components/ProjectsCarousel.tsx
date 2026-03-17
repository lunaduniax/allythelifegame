import { FC, useRef, useState, useEffect } from 'react';
import { Project } from '@/types';
import { ProjectCard } from './ProjectCard';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProjectsCarouselProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  getProgress: (project: Project) => number;
  onCreateProject: () => void;
  onDeleteProject?: (projectId: string) => void;
}

export const ProjectsCarousel: FC<ProjectsCarouselProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  getProgress,
  onCreateProject,
  onDeleteProject
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [projects]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = 248 + 16;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="relative group">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full glass-chip shadow-md hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full glass-chip shadow-md hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} className="text-foreground" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide pb-5 scroll-smooth overscroll-x-contain touch-pan-x snap-x snap-mandatory"
      >
        <div className="flex flex-nowrap gap-4 px-5 my-0 py-[9px]">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              progress={getProgress(project)}
              isSelected={project.id === selectedProjectId}
              onSelect={() => onSelectProject(project.id)}
              onDelete={onDeleteProject}
            />
          ))}

          <button
            onClick={onCreateProject}
            className="glass-panel premium-outline flex-shrink-0 w-[15.5rem] p-5 rounded-[30px] cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between gap-4 snap-start text-left"
          >
            <div className="glass-chip w-12 h-12 rounded-full flex items-center justify-center">
              <Plus size={24} className="text-primary" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Nueva meta</span>
              <div className="font-semibold leading-tight text-[1.65rem] text-foreground mt-2">
                Crear nueva meta
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};