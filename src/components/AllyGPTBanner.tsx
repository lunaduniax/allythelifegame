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
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="px-6 py-5"
      >
        <div
          onClick={onStartAllyGPT}
          className="relative bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-6 cursor-pointer hover:border-primary/30 hover:bg-card/80 transition-all duration-300 shadow-soft group"
        >
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>

          {/* Content */}
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors duration-200">
              <Sparkles size={22} className="text-primary" />
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                ¿Querés ayuda para ordenar tus metas?
              </h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                AllyGPT te ayuda a convertir tus ideas en tareas simples.
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onStartAllyGPT();
                }}
                className="bg-primary text-primary-foreground font-semibold text-sm py-3 px-6 rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-glow-sm"
              >
                Empezar con AllyGPT
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
