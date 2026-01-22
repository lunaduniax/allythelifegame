import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const GoalCreated = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get project ID from navigation state
  const projectId = location.state?.projectId as string | undefined;

  useEffect(() => {
    // Auto-navigate after 1200ms using replace to prevent back navigation
    const timer = setTimeout(() => {
      navigate('/', { 
        state: { selectedProjectId: projectId },
        replace: true,
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [navigate, projectId]);

  const handleContinue = () => {
    // Use replace to prevent going back to onboarding
    navigate('/', { 
      state: { selectedProjectId: projectId },
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 pt-12 pb-8 safe-area-inset">
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
