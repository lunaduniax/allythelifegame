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
  return (
    <div className="mt-2 p-3 rounded-lg bg-card/50 border border-border">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Requisitos de contraseña:
      </p>
      <ul className="space-y-1.5">
        {requirements.map((req, index) => {
          const isMet = password.length > 0 && req.check(password);
          return (
            <li
              key={index}
              className={cn(
                'flex items-center gap-2 text-xs transition-colors',
                password.length === 0
                  ? 'text-muted-foreground'
                  : isMet
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {password.length > 0 ? (
                isMet ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : (
                  <X className="h-3 w-3 text-destructive" />
                )
              ) : (
                <span className="h-3 w-3 rounded-full border border-muted-foreground/50" />
              )}
              {req.label}
            </li>
          );
        })}
        {showHIBP && (
          <li className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-3 w-3 rounded-full border border-muted-foreground/50" />
            No debe ser una contraseña filtrada (HIBP)
          </li>
        )}
      </ul>
    </div>
  );
};

export default PasswordRequirements;
