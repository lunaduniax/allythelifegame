import { FC, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  delayedMessage?: string;
  delayMs?: number;
}

export const LoadingOverlay: FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Cargando...',
  delayedMessage = 'Esto puede tardar unos segundos',
  delayMs = 3000,
}) => {
  const [showDelayedMessage, setShowDelayedMessage] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowDelayedMessage(false);
      const timer = setTimeout(() => {
        setShowDelayedMessage(true);
      }, delayMs);
      return () => clearTimeout(timer);
    } else {
      setShowDelayedMessage(false);
    }
  }, [isVisible, delayMs]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4 text-center px-6">
            {/* Spinner with neon glow */}
            <div className="relative">
              <Loader2 
                size={48} 
                className="animate-spin text-primary" 
                strokeWidth={2.5}
              />
              {/* Glow effect */}
              <div className="absolute inset-0 animate-spin">
                <div className="w-12 h-12 rounded-full bg-primary/20 blur-xl" />
              </div>
            </div>

            {/* Main message */}
            <p className="text-lg font-medium text-foreground">
              {message}
            </p>

            {/* Delayed message */}
            <AnimatePresence>
              {showDelayedMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-muted-foreground"
                >
                  {delayedMessage}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
