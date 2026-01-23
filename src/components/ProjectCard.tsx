import { FC, useState } from 'react';
import { Project } from '@/types';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const textMutedColor = isLight ? 'text-gray-700/80' : 'text-white/60';

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
      <motion.div
        onClick={onSelect}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "flex-shrink-0 w-48 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-0 snap-start relative group",
          isSelected && "ring-2 ring-offset-4 ring-offset-background shadow-glow"
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
                  "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200",
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

        <span className={cn("font-medium opacity-70 block mb-3 text-sm tracking-wide", textMutedColor)}>
          {project.category}
        </span>

        <h3 className={cn("font-semibold leading-snug mb-5 line-clamp-2 text-xl", textColor)}>
          {project.name}
        </h3>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className={cn("font-medium text-sm", textMutedColor)}>Progreso</span>
            <span className={cn("text-sm font-semibold tabular-nums", textColor)}>{progress}%</span>
          </div>

          {/* Elegant progress bar */}
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{
              backgroundColor: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(progress, 0)}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full"
              style={{
                backgroundColor: isLight ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)',
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">¿Eliminar meta?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Se eliminará la meta y todas sus tareas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
