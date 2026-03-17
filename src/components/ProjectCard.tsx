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

const isLightColor = (hexColor: string): boolean => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
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
  const textColor = isLight ? 'hsl(205 30% 8%)' : 'hsl(var(--foreground))';
  const textMutedColor = isLight ? 'hsl(205 20% 18% / 0.78)' : 'hsl(var(--foreground) / 0.7)';

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
          'flex-shrink-0 w-[15.5rem] p-5 rounded-[30px] cursor-pointer transition-all duration-300 snap-start relative group premium-outline overflow-hidden',
          isSelected ? 'scale-[1.01] ring-1 ring-primary/70 shadow-2xl' : 'hover:-translate-y-1'
        )}
        style={{
          background: `linear-gradient(180deg, ${project.color}, color-mix(in srgb, ${project.color} 68%, black))`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-black/18 pointer-events-none" />

        {onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="absolute top-3 right-3 w-8 h-8 rounded-full glass-chip flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal size={16} style={{ color: textColor }} />
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

        <div className="relative z-10 flex flex-col h-full min-h-[220px]">
          <span className="glass-chip w-fit rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] mb-4" style={{ color: textMutedColor }}>
            {project.category}
          </span>

          <h3 className="font-semibold leading-tight mb-6 text-[1.65rem] max-w-[11ch]" style={{ color: textColor }}>
            {project.name}
          </h3>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: textMutedColor }}>Progreso</span>
              <span className="text-sm font-semibold" style={{ color: textColor }}>{progress}%</span>
            </div>

            <div
              className="h-[12px] rounded-full mt-2 overflow-hidden"
              style={{
                backgroundColor: isLight ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.16)',
                border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(progress, 0)}%`,
                  backgroundColor: isLight ? 'rgba(0,0,0,0.72)' : 'hsl(var(--primary))',
                  boxShadow: isLight ? 'none' : '0 0 24px rgba(245, 240, 154, 0.32)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

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