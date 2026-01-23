import { FC, useState } from 'react';
import { Project } from '@/types';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProjectCardProps {
  project: Project;
  progress: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: (projectId: string) => void;
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
  onDelete,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isLight = isLightColor(project.color);
  const textColor = isLight ? 'text-gray-900' : 'text-white';
  const textMutedColor = isLight ? 'text-gray-700' : 'text-white/70';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(project.id);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div
        onClick={onSelect}
        className={cn(
          "flex-shrink-0 w-44 p-4 rounded-xl cursor-pointer transition-all duration-200 border-0 snap-start relative group",
          isSelected && "ring-2 ring-offset-2 ring-offset-background"
        )}
        style={{
          backgroundColor: project.color,
          ['--tw-ring-color' as string]: project.color,
        }}
      >
        {/* Overflow Menu */}
        {onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                  isLight ? "bg-black/10 hover:bg-black/20" : "bg-white/10 hover:bg-white/20"
                )}
              >
                <MoreHorizontal size={16} className={isLight ? "text-gray-900" : "text-white"} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 size={16} className="mr-2" />
                Eliminar meta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <span className={cn("font-medium opacity-70 block mb-2 text-sm", textMutedColor)}>
          {project.category}
        </span>

        <h3 className={cn("font-semibold leading-tight mb-4 line-clamp-2 text-xl", textColor)}>
          {project.name}
        </h3>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span className={cn("font-medium text-sm", textMutedColor)}>Progreso</span>
            <span className={cn("text-sm font-semibold", textColor)}>{progress} %</span>
          </div>

          <div
            className="h-[10px] rounded-full mt-2 overflow-hidden"
            style={{
              backgroundColor: isLight ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(0,0,0,0.12)',
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(progress, 0)}%`,
                backgroundColor: isLight ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.9)',
                boxShadow: isLight ? 'none' : 'inset 0 0 0 1px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar meta?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la meta y todas sus tareas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
