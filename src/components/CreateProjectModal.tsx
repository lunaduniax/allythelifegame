import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; category: string; color: string }) => void;
}

const colorOptions = [
  { name: 'Violet', value: '#DAD2FB' },
  { name: 'Yellow', value: '#D4FE00' },
  { name: 'Teal', value: '#4FD1C5' },
  { name: 'Coral', value: '#F6AD55' },
  { name: 'Mint', value: '#68D391' },
  { name: 'Sky', value: '#63B3ED' },
];

export const CreateProjectModal: FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState(colorOptions[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim()) return;

    onSubmit({
      name: name.trim(),
      category: category.trim(),
      color,
    });

    setName('');
    setCategory('');
    setColor(colorOptions[0].value);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border p-6 pb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Nuevo proyecto</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Nombre del proyecto
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: Nuevo website"
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                  placeholder="Ej: Work, Personal, Side project..."
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Color de la tarjeta
                </label>
                <div className="flex gap-3 flex-wrap">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setColor(option.value)}
                      className={cn(
                        "w-12 h-12 rounded-xl transition-all",
                        color === option.value && "ring-2 ring-primary ring-offset-2 ring-offset-card"
                      )}
                      style={{ backgroundColor: option.value }}
                      title={option.name}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!name.trim() || !category.trim()}
                className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                Crear proyecto
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
