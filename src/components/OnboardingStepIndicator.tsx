interface OnboardingStepIndicatorProps {
  currentStep: 1 | 2 | 3;
  totalSteps?: number;
}

const OnboardingStepIndicator = ({ 
  currentStep, 
  totalSteps = 3 
}: OnboardingStepIndicatorProps) => {
  return (
    <p className="text-sm text-muted-foreground/60 mb-4">
      Paso {currentStep}/{totalSteps}
    </p>
  );
};

export default OnboardingStepIndicator;
