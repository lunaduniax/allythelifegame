import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingStepIndicatorProps {
  currentStep: 1 | 2 | 3;
  totalSteps?: number;
  onBack?: () => void;
  showBack?: boolean;
}

const OnboardingStepIndicator = ({ 
  currentStep, 
  totalSteps = 3,
  onBack,
  showBack = true,
}: OnboardingStepIndicatorProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Back button */}
      {showBack && currentStep > 1 && (
        <button
          type="button"
          onClick={handleBack}
          className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Volver"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Step bars */}
      <div className="flex items-center gap-2 flex-1 justify-center">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isFilled = stepNumber <= currentStep;
          
          return (
            <div
              key={stepNumber}
              className={`h-1 w-16 rounded-full transition-colors ${
                isFilled ? 'bg-foreground' : 'bg-muted-foreground/30'
              }`}
            />
          );
        })}
      </div>

      {/* Spacer for symmetry when back button is shown */}
      {showBack && currentStep > 1 && (
        <div className="w-6" />
      )}
    </div>
  );
};

export default OnboardingStepIndicator;
