import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [dismiss, setDismiss] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDismiss(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => {
        if (dismiss) onFinish();
      }}
      {...(dismiss ? { animate: { opacity: 0, scale: 1.05 } } : {})}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, hsl(var(--primary) / 0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-4">
        {/* Logo icon */}
        <motion.div
          className="text-6xl font-bold text-primary font-sans"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
        >
          A
        </motion.div>

        {/* App name + sparkle */}
        <motion.h1
          className="text-4xl font-bold text-foreground font-sans tracking-tight"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          Ally{" "}
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 0.7 }}
          >
            ✨
          </motion.span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-sm text-muted-foreground font-sans"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          Play the life game, one step at a time.
        </motion.p>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
