import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Timer } from 'lucide-react';

interface HeaderProps {
  userName: string;
  projectCount: number;
}

export const Header: FC<HeaderProps> = ({
  userName,
  projectCount,
}) => {
  const navigate = useNavigate();

  return (
    <header className="px-5 pt-10 pb-6">
      <div className="glass-panel premium-outline rounded-[32px] px-5 py-5 overflow-hidden relative">
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div>
            <div className="glass-chip inline-flex items-center rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Tu espacio de enfoque
            </div>
            <p className="text-muted-foreground text-sm mb-2">
              Buen día {userName} :)
            </p>
            <h1 className="leading-[0.95] tracking-tight font-semibold text-[2.7rem]">
              Tus {projectCount}
              <span className="mx-[10px] text-primary">✦</span>
              <br />
              proyectos
            </h1>
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => navigate('/pomodoro')}
              className="glass-chip w-11 h-11 rounded-full flex items-center justify-center text-foreground transition-transform duration-200 hover:scale-105"
              title="Pomodoro"
            >
              <Timer size={18} className="text-foreground" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="glass-chip w-11 h-11 rounded-full flex items-center justify-center text-foreground transition-transform duration-200 hover:scale-105"
              title="Ver métricas"
            >
              <BarChart3 size={18} className="text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};