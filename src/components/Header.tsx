import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

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
    <header className="px-5 pt-12 pb-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-base mb-1">
            Buen día {userName} :)
          </p>
          <h1 className="leading-tight tracking-tight font-light text-5xl">
            Tus {projectCount}
            <span className="mx-[10px] text-[#d4ff00]">✦</span>
            <br />
            proyectos
          </h1>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mt-2"
          title="Ver métricas"
        >
          <BarChart3 size={18} className="text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};