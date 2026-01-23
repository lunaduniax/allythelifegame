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
}

export const ProjectsCarousel: FC<ProjectsCarouselProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  getProgress,
  onCreateProject
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
    const cardWidth = 176 + 12; // w-44 (176px) + gap-3 (12px)
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="relative group">
      {/* Left Arrow - Desktop only */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-card/90 border border-border shadow-md hover:bg-card transition-all opacity-0 group-hover:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </button>
      )}

      {/* Right Arrow - Desktop only */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-card/90 border border-border shadow-md hover:bg-card transition-all opacity-0 group-hover:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} className="text-foreground" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide pb-4 scroll-smooth overscroll-x-contain touch-pan-x snap-x snap-mandatory"
      >
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
    </div>
  );
};
