import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { CreateProjectModal } from './CreateProjectModal';

interface AddTasksStepProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onComplete: (tasks: string[]) => void;
  projectName: string;
}

const AddTasksStep: FC<AddTasksStepProps> = ({
  isOpen,
  onClose,
  onBack,
  onComplete,
  projectName,
}) => {
  const [tasks, setTasks] = useState<string[]>(['', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTaskChange = (index: number, value: string) => {
    setTasks(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddTask = () => {
    setTasks(prev => [...prev, '']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validTasks = tasks.filter(t => t.trim());
    if (validTasks.length === 0) {
      // Allow skipping tasks
      onComplete([]);
      return;
    }
    setIsSubmitting(true);
    onComplete(validTasks);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border max-h-[90vh] overflow-y-auto"
          >
            {/* Sticky Step Header */}
            <div className="sticky top-0 z-10 bg-card pt-6 px-6 pb-4 border-b border-border/50">
              <div className="flex items-center justify-between gap-4">
                <div className="w-16 flex items-center">
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft size={20} />
                    <span className="text-sm">Back</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 flex-1 justify-center">
                  <div className="h-1 flex-1 max-w-12 rounded-full bg-foreground" />
                  <div className="h-1 flex-1 max-w-12 rounded-full bg-foreground" />
                </div>

                <div className="w-16 flex justify-end">
                  <span className="text-sm text-muted-foreground">2 of 2</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pb-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Dividí tu meta en tareas simples</h2>
                <p className="text-sm text-primary mt-1">
                  Pequeños pasos hacen grandes cambios. ¿Qué tareas necesitás hacer para lograr "{projectName}"?
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {tasks.map((task, index) => (
                  <input
                    key={index}
                    type="text"
                    value={task}
                    onChange={e => handleTaskChange(index, e.target.value)}
                    placeholder={`Tarea ${index + 1}`}
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ))}

                <button
                  type="button"
                  onClick={handleAddTask}
                  className="w-full py-3 border border-dashed border-border rounded-xl text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                >
                  + Agregar otra tarea
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl disabled:opacity-50 transition-opacity mt-6"
                >
                  {isSubmitting ? 'Guardando...' : 'Listo, crear meta!'}
                </button>

                <button
                  type="button"
                  onClick={() => onComplete([])}
                  className="w-full text-muted-foreground text-sm py-2"
                >
                  Saltar por ahora
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface CreateGoalFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (projectData: {
    name: string;
    category: string;
    color: string;
    importance?: string;
    targetDate?: string;
    reminderFrequency: string;
  }, tasks: string[]) => Promise<void>;
}

export const CreateGoalFlow: FC<CreateGoalFlowProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [projectData, setProjectData] = useState<{
    name: string;
    category: string;
    color: string;
    importance?: string;
    targetDate?: string;
    reminderFrequency: string;
  } | null>(null);

  const handleProjectSubmit = (data: {
    name: string;
    category: string;
    color: string;
    importance?: string;
    targetDate?: string;
    reminderFrequency: string;
  }) => {
    setProjectData(data);
    setStep(2);
  };

  const handleTasksComplete = async (tasks: string[]) => {
    if (projectData) {
      await onComplete(projectData, tasks);
      // Reset state
      setStep(1);
      setProjectData(null);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleClose = () => {
    setStep(1);
    setProjectData(null);
    onClose();
  };

  return (
    <>
      {step === 1 && (
        <CreateProjectModal
          isOpen={isOpen}
          onClose={handleClose}
          onSubmit={handleProjectSubmit}
          currentStep={1}
          totalSteps={2}
        />
      )}
      {step === 2 && projectData && (
        <AddTasksStep
          isOpen={isOpen}
          onClose={handleClose}
          onBack={handleBack}
          onComplete={handleTasksComplete}
          projectName={projectData.name}
        />
      )}
    </>
  );
};
