import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const GoalCreated = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get all data from navigation state
  const projectId = location.state?.projectId as string | undefined;
  const goalData = location.state?.goalData;
  const tasksData = location.state?.tasksData;
  const frequency = location.state?.frequency;

  useEffect(() => {
    // Auto-navigate after 2 seconds
    const timer = setTimeout(() => {
      navigate('/', { state: { selectedProjectId: projectId } });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, projectId]);

  const handleBack = () => {
    // Navigate back to Frequency with all state preserved
    navigate('/frequency', { 
      state: { 
        projectId,
        goalData,
        tasksData,
        frequency,
      } 
    });
  };

  const handleContinue = () => {
    navigate('/', { state: { selectedProjectId: projectId } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 pt-12 pb-8 safe-area-inset">
      {/* Back button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Volver"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Content centered */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Sparkles emoji */}
        <span className="text-4xl mb-4">✨</span>
        
        {/* Main heading */}
        <h1 className="text-5xl font-bold leading-tight text-foreground">
          ¡Tu meta fue creada!
        </h1>
        
        {/* Subtitle */}
        <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
          ¡Estás un paso más cerca de cumplir tus sueños! ✨
        </p>
      </div>

      {/* Continue button */}
      <div className="mt-auto">
        <Button
          type="button"
          onClick={handleContinue}
          className="w-full h-14 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default GoalCreated;
