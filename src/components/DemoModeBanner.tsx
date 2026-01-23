import { useDemoMode } from '@/contexts/DemoModeContext';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoModeBanner = () => {
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-primary">
        <Eye className="w-4 h-4" />
        <span>Modo demo — las acciones están deshabilitadas</span>
      </div>
      <button
        onClick={() => navigate('/auth')}
        className="text-xs font-medium text-primary hover:underline"
      >
        Iniciar sesión
      </button>
    </div>
  );
};
