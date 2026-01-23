import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const Help = () => {
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
        
        <h1 className="text-lg font-semibold">Ayuda</h1>
        
        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="px-6 pt-8">
        <div className="space-y-6">
          <div className="border border-border rounded-xl p-4">
            <h3 className="font-medium mb-2">¿Cómo crear una meta?</h3>
            <p className="text-sm text-muted-foreground">
              Toca el botón "+" en la navegación inferior para crear una nueva meta. Completa el nombre, categoría y otras opciones.
            </p>
          </div>

          <div className="border border-border rounded-xl p-4">
            <h3 className="font-medium mb-2">¿Cómo agregar tareas?</h3>
            <p className="text-sm text-muted-foreground">
              Después de crear una meta, podrás dividirla en tareas más pequeñas para facilitar su seguimiento.
            </p>
          </div>

          <div className="border border-border rounded-xl p-4">
            <h3 className="font-medium mb-2">¿Cómo marcar tareas como completadas?</h3>
            <p className="text-sm text-muted-foreground">
              Toca el círculo a la izquierda de cada tarea para marcarla como completada.
            </p>
          </div>

          <div className="border border-border rounded-xl p-4">
            <h3 className="font-medium mb-2">Contacto</h3>
            <p className="text-sm text-muted-foreground">
              ¿Necesitas más ayuda? Escríbenos a soporte@ally.app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
