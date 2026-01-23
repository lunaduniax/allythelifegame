import { ChevronLeft } from 'lucide-react';

interface OnboardingStepIndicatorProps {
  currentStep: 1 | 2;
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
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      {/* Left: Back button */}
      <div className="w-16 flex items-center">
        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Volver"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">Back</span>
          </button>
        )}
      </div>

      {/* Center: Step bars */}
      <div className="flex items-center gap-1.5 flex-1 justify-center">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isFilled = stepNumber <= currentStep;
          
          return (
            <div
              key={stepNumber}
              className={`h-1 flex-1 max-w-12 rounded-full transition-colors ${
                isFilled ? 'bg-foreground' : 'bg-muted-foreground/30'
              }`}
            />
          );
        })}
      </div>

      {/* Right: Step text */}
      <div className="w-16 flex justify-end">
        <span className="text-sm text-muted-foreground">
          {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  );
};

export default OnboardingStepIndicator;
