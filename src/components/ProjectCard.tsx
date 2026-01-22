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

// Helper to determine if a hex color is light (for text contrast)
const isLightColor = (hexColor: string): boolean => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};
export const ProjectCard: FC<ProjectCardProps> = ({
  project,
  progress,
  isSelected,
  onSelect,
  onCreateNew,
  isCreateCard
}) => {
  const isLight = isLightColor(project.color);
  const textColor = isLight ? 'text-gray-900' : 'text-white';
  const textMutedColor = isLight ? 'text-gray-700' : 'text-white/70';
  return <div className="flex items-stretch gap-0 border-0">
      <div onClick={onSelect} className={cn("flex-shrink-0 w-44 p-4 rounded-xl cursor-pointer transition-all duration-200 border-0", isSelected && "ring-2 ring-offset-2 ring-offset-background")} style={{
      backgroundColor: project.color,
      ['--tw-ring-color' as string]: project.color
    }}>
        <span className={cn("font-medium opacity-70 block mb-2 text-sm", textMutedColor)}>
          {project.category}
        </span>
        
        <h3 className={cn("font-semibold leading-tight mb-4 line-clamp-2 text-xl", textColor)}>
          {project.name}
        </h3>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span className={cn("font-medium text-sm", textMutedColor)}>
              Progreso
            </span>
            <span className={cn("text-sm font-semibold", textColor)}>{progress} %</span>
          </div>
          
          <div className="h-2 rounded-full overflow-hidden" style={{
          backgroundColor: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'
        }}>
            <div className="h-full rounded-full transition-all duration-500" style={{
            width: `${progress}%`,
            backgroundColor: isLight ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)'
          }} />
          </div>
        </div>
      </div>

      {isCreateCard && onCreateNew && <button onClick={onCreateNew} className="flex flex-col items-center justify-center w-16 ml-2 text-muted-foreground hover:text-foreground transition-colors">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-1">
            <Plus size={20} />
          </div>
          <span className="text-[10px] font-medium text-center leading-tight">
            Crear<br />nueva
          </span>
        </button>}
    </div>;
};