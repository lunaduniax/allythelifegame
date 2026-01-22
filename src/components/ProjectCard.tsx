import { FC } from 'react';
import { Project } from '@/types';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  progress: number;
  isSelected: boolean;
  onSelect: () => void;
  onCreateNew?: () => void;
  isCreateCard?: boolean;
}

export const ProjectCard: FC<ProjectCardProps> = ({
  project,
  progress,
  isSelected,
  onSelect,
  onCreateNew,
  isCreateCard,
}) => {
  const isYellow = project.color === 'yellow';

  return (
    <div className="flex items-stretch gap-0">
      <div
        onClick={onSelect}
        className={cn(
          "flex-shrink-0 w-44 p-4 rounded-xl cursor-pointer transition-all duration-200",
          isYellow 
            ? "bg-accent text-accent-foreground" 
            : "bg-card-light text-card-light-foreground",
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
      >
        <span className={cn(
          "text-xs font-medium opacity-70 block mb-2",
          isYellow ? "text-accent-foreground/70" : "text-card-light-foreground/70"
        )}>
          {project.category}
        </span>
        
        <h3 className="text-lg font-semibold leading-tight mb-4 line-clamp-2">
          {project.name}
        </h3>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span className={cn(
              "text-xs font-medium",
              isYellow ? "text-accent-foreground/70" : "text-card-light-foreground/70"
            )}>
              Progreso
            </span>
            <span className="text-sm font-semibold">{progress} %</span>
          </div>
          
          <div className={cn(
            "h-2 rounded-full overflow-hidden",
            isYellow ? "bg-accent-foreground/20" : "bg-card-light-foreground/20"
          )}>
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isYellow ? "bg-accent-foreground" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {isCreateCard && onCreateNew && (
        <button
          onClick={onCreateNew}
          className="flex flex-col items-center justify-center w-16 ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-1">
            <Plus size={20} />
          </div>
          <span className="text-[10px] font-medium text-center leading-tight">
            Crear<br />nueva
          </span>
        </button>
      )}
    </div>
  );
};
