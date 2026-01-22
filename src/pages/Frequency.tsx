import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import OnboardingStepIndicator from '@/components/OnboardingStepIndicator';

const frequencyOptions = [
  'Todos los días',
  '3 veces por semana',
  'Una vez por semana',
  'Prefiero no recibir recordatorios',
];

const Frequency = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from navigation state
  const projectId = location.state?.projectId as string | undefined;
  const goalData = location.state?.goalData;
  const tasksData = location.state?.tasksData;
  const restoredFrequency = location.state?.frequency as string | null;

  const [selectedFrequency, setSelectedFrequency] = useState<string | null>(restoredFrequency);

  const handleBack = () => {
    // Navigate back to AddTasks with all state preserved
    navigate('/add-tasks', { 
      state: { 
        projectId, 
        goalData,
        tasksData,
      } 
    });
  };

  const handleSubmit = () => {
    if (!selectedFrequency) {
      toast.error('Seleccioná una frecuencia');
      return;
    }

    // Data is already saved in previous steps (CreateGoal saves project, AddTasks saves tasks)
    // Navigate directly to Home with the projectId, using replace to prevent back navigation
    // If projectId is missing, just go to home without selecting a specific project
    const targetUrl = projectId ? `/?project=${projectId}` : '/';
    navigate(targetUrl, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 pt-12 pb-8 safe-area-inset">
      {/* Step Indicator */}
      <OnboardingStepIndicator currentStep={3} onBack={handleBack} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold leading-tight text-foreground">
          ¿Con qué frecuencia querés trabajar en esta meta?
        </h1>
        <p className="text-primary mt-4 text-base leading-relaxed">
          Te vamos a mandar recordatorios motivacionales :D
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 flex-1">
        {frequencyOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSelectedFrequency(option)}
            className={`w-full h-14 px-4 rounded-lg border text-left transition-colors ${
              selectedFrequency === option
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-card text-foreground hover:bg-card/80'
            }`}
          >
            {option}
          </button>
        ))}

        <div className="mt-auto pt-6">
          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full h-14 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90"
          >
            Listo!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Frequency;
