import { FC } from 'react';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface TasksListProps {
  projectName: string;
  projectColor: string;
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onCreateTask: () => void;
}

export const TasksList: FC<TasksListProps> = ({
  projectName,
  projectColor,
  tasks,
  onCompleteTask,
  onCreateTask,
}) => {
  return (
    <section className="px-5 py-6 pb-32">
      <div className="flex items-end justify-between gap-3 mb-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Daily focus</div>
          <h2 className="text-[1.4rem] font-semibold text-foreground leading-tight">
            Tareas en progreso
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Proyecto activo: {projectName}</p>
        </div>
        <button
          onClick={onCreateTask}
          className="glass-chip rounded-full px-4 py-2 text-sm text-foreground inline-flex items-center gap-2 shrink-0"
        >
          <Plus size={14} className="text-primary" />
          Crear
        </button>
      </div>

      <div className="glass-panel premium-outline rounded-[30px] p-4">
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              projectColor={projectColor}
              onComplete={() => onCompleteTask(task.id)}
            />
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <p>No hay tareas en progreso</p>
            </div>
          )}

          <button
            onClick={onCreateTask}
            className="w-full flex items-center gap-3 p-4 rounded-[22px] glass-chip transition-colors text-muted-foreground hover:text-foreground"
          >
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
              <Plus size={14} className="text-primary" />
            </div>
            <span className="text-sm font-medium">Crear tarea</span>
          </button>
        </div>
      </div>
    </section>
  );
};