import { FC } from 'react';
import { CreateProjectModal } from './CreateProjectModal';

interface CreateGoalFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void>;
}

export const CreateGoalFlow: FC<CreateGoalFlowProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  return (
    <CreateProjectModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      currentStep={1}
      totalSteps={1}
    />
  );
};
