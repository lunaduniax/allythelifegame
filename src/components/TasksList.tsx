import { FC } from 'react';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface TasksListProps {
  projectName: string;
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onCreateTask: () => void;
}

export const TasksList: FC<TasksListProps> = ({
  projectName,
  tasks,
  onCompleteTask,
  onCreateTask,
}) => {
  return (
    <section className="px-5 py-6 pb-32">
      <h2 className="text-lg font-medium text-foreground mb-4">
        Tareas en progreso: <span className="text-muted-foreground">{projectName}</span>
      </h2>

      <div>
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={() => onCompleteTask(task.id)}
          />
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay tareas en progreso</p>
          </div>
        )}

        <button
          onClick={onCreateTask}
          className="w-full flex items-center gap-3 p-4 rounded-xl border border-dashed border-border hover:border-muted-foreground transition-colors text-muted-foreground hover:text-foreground"
        >
          <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center">
            <Plus size={14} />
          </div>
          <span className="text-sm font-medium">Crear tarea</span>
        </button>
      </div>
    </section>
  );
};
