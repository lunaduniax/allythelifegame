import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Project } from '@/types';
import { toast } from 'sonner';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; category: string; date: string; description: string }) => Promise<void> | void;
  project: Project;
}

export const CreateTaskModal: FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim() || isSubmitting) return;

    const today = new Date();
    const dateStr = today.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        category: category.trim(),
        date: dateStr.charAt(0).toUpperCase() + dateStr.slice(1),
        description: description.trim() || 'Sin descripción',
      });

      toast.success('Tarea creada ✅');
      resetForm();
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error('No se pudo guardar. Probá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isSubmitting ? undefined : onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50 flex-shrink-0">
              <h2 className="text-xl font-semibold">Nueva tarea</h2>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6 pt-4">
              <p className="text-sm text-muted-foreground mb-6">
                Proyecto: <span className="text-foreground font-medium">{project.name}</span>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Título de la tarea
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ej: Diseñar el nuevo logo"
                    disabled={isSubmitting}
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Ej: UI Design, Research..."
                    disabled={isSubmitting}
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe la tarea con más detalle..."
                    rows={3}
                    disabled={isSubmitting}
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!title.trim() || !category.trim() || isSubmitting}
                  className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    'Crear tarea'
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
