import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordRequirementsProps {
  password: string;
  showHIBP?: boolean;
}

interface Requirement {
  label: string;
  check: (password: string) => boolean;
}

const requirements: Requirement[] = [
  {
    label: 'Mínimo 8 caracteres',
    check: (password) => password.length >= 8,
  },
  {
    label: 'Incluye mayúscula, minúscula y número',
    check: (password) =>
      /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password),
  },
];

export const validatePassword = (password: string): boolean => {
  return requirements.every((req) => req.check(password));
};

const PasswordRequirements = ({ password, showHIBP = true }: PasswordRequirementsProps) => {
  const allMet = password.length > 0 && requirements.every(req => req.check(password));
  const hasInput = password.length > 0;

  return (
    <p className="text-xs text-muted-foreground mt-1.5">
      <span className={hasInput && allMet ? 'text-primary' : ''}>
        8+ caracteres, mayúscula, minúscula y número
      </span>
    </p>
  );
};

export default PasswordRequirements;
