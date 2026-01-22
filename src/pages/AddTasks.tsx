import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import OnboardingStepIndicator from '@/components/OnboardingStepIndicator';

const AddTasks = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<string[]>(['', '', '', '']);

  // Get project ID from navigation state
  const projectId = location.state?.projectId as string | undefined;

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const handleAddTask = () => {
    setTasks([...tasks, '']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !projectId) {
      toast.error('Error al guardar las tareas');
      navigate('/');
      return;
    }

    // Filter out empty tasks
    const validTasks = tasks.filter((t) => t.trim().length > 0);

    if (validTasks.length === 0) {
      // No tasks added, just go to home
      navigate('/');
      return;
    }

    setIsLoading(true);

    try {
      const today = new Date();
      const dateStr = today.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

      const tasksToInsert = validTasks.map((title) => ({
        project_id: projectId,
        user_id: user.id,
        title: title.trim(),
        date: formattedDate,
        status: 'in_progress',
      }));

      const { error } = await supabase.from('tasks').insert(tasksToInsert);

      if (error) {
        console.error(error);
        toast.error('Error al crear las tareas');
        return;
      }

      toast.success('¡Tareas creadas exitosamente!');
      navigate('/frequency', { state: { projectId } });
    } catch (error) {
      toast.error('Ocurrió un error. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 pt-12 pb-8 safe-area-inset">
      {/* Step Indicator */}
      <OnboardingStepIndicator currentStep={2} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold leading-tight text-foreground">
          Dividí tu meta en tareas simples
        </h1>
        <p className="text-primary mt-4 text-base leading-relaxed">
          Esto te va a ayudar a mantener el foco.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        {tasks.map((task, index) => (
          <div key={index} className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Tarea {index + 1}
            </Label>
            <Input
              type="text"
              value={task}
              onChange={(e) => handleTaskChange(index, e.target.value)}
              className="h-14 bg-card border-border rounded-lg text-foreground"
            />
          </div>
        ))}

        {/* Add another task button */}
        <button
          type="button"
          onClick={handleAddTask}
          className="flex items-center gap-3 h-14 px-4 rounded-lg border border-border bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
        >
          <div className="w-6 h-6 rounded-md border border-muted-foreground flex items-center justify-center">
            <Plus size={14} />
          </div>
          <span className="text-sm font-medium">Agregar otra tarea</span>
        </button>

        <div className="mt-auto pt-6">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90"
          >
            {isLoading ? 'Guardando...' : 'Listo, siguiente!'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTasks;
