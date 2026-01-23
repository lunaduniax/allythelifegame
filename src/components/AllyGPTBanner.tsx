import { FC, useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'allygpt-banner-dismissed';

interface AllyGPTBannerProps {
  onStartAllyGPT: () => void;
}

export const AllyGPTBanner: FC<AllyGPTBannerProps> = ({ onStartAllyGPT }) => {
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="px-5 py-4"
      >
        <div
          onClick={onStartAllyGPT}
          className="relative bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/50 transition-colors"
        >
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>

          {/* Content */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-primary" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <h3 className="text-base font-semibold text-foreground mb-1">
                ¿Querés ayuda para ordenar tus metas?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                AllyGPT te ayuda a convertir tus ideas en tareas simples.
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartAllyGPT();
                }}
                className="bg-primary text-primary-foreground font-semibold text-sm py-2.5 px-5 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Empezar con AllyGPT
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
