import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-foreground">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 pt-12">
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h1 className="text-lg font-semibold">Sobre Ally</h1>
        
        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="px-6 pt-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground text-2xl font-bold">A</span>
          </div>
          <h2 className="text-xl font-semibold">Ally</h2>
          <p className="text-muted-foreground text-sm mt-1">Versión 1.0.0</p>
        </div>

        <div className="space-y-4">
          <div className="border border-border rounded-xl p-4">
            <h3 className="font-medium mb-2">Nuestra misión</h3>
            <p className="text-sm text-muted-foreground">
              Ally te ayuda a alcanzar tus metas dividiéndolas en tareas simples y manejables. Creemos que cada pequeño paso cuenta.
            </p>
          </div>

          <div className="border border-border rounded-xl p-4">
            <h3 className="font-medium mb-2">Desarrollado con ❤️</h3>
            <p className="text-sm text-muted-foreground">
              Ally fue creado para ayudar a las personas a ser más productivas y alcanzar sus sueños.
            </p>
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              © 2024 Ally. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
