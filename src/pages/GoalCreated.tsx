import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const GoalCreated = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.state?.projectId as string | undefined;

  useEffect(() => {
    // Auto-navigate after 2 seconds
    const timer = setTimeout(() => {
      navigate('/', { state: { selectedProjectId: projectId } });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, projectId]);

  const handleContinue = () => {
    navigate('/', { state: { selectedProjectId: projectId } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-5 safe-area-inset">
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

      {/* Continue button */}
      <div className="mt-12">
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
