import { FC } from 'react';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <section className="px-6 py-8 pb-36">
      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-lg font-medium text-foreground mb-6"
      >
        Tareas en progreso: <span className="text-muted-foreground font-normal">{projectName}</span>
      </motion.h2>

      <div className="space-y-1">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <TaskCard
              task={task}
              projectColor={projectColor}
              onComplete={() => onCompleteTask(task.id)}
            />
          </motion.div>
        ))}

        {tasks.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-12 text-muted-foreground"
          >
            <p className="text-lg font-light">No hay tareas en progreso</p>
            <p className="text-sm mt-2 opacity-70">Creá una tarea para empezar</p>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: tasks.length * 0.05 }}
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateTask}
          className="w-full flex items-center gap-4 p-5 rounded-2xl border border-dashed border-border/50 hover:border-primary/30 transition-all duration-300 text-muted-foreground hover:text-foreground group bg-card/30 hover:bg-card/50"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-200">
            <Plus size={18} className="group-hover:text-primary transition-colors duration-200" />
          </div>
          <span className="text-base font-medium">Crear tarea</span>
        </motion.button>
      </div>
    </section>
  );
};
