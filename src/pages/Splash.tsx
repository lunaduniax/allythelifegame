import { motion } from "framer-motion";

const Splash = () => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-end p-8 pb-20 relative overflow-hidden">
      {/* Green gradient background matching the design */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 30%, 
              hsl(75, 100%, 50%) 0%, 
              hsl(75, 100%, 45%) 20%,
              hsl(75, 80%, 35%) 40%,
              hsl(70, 60%, 20%) 60%,
              hsl(220, 30%, 8%) 80%,
              hsl(220, 40%, 5%) 100%
            )
          `
        }}
      />
      
      {/* Content */}
      <motion.div 
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-5xl font-bold text-[#0B0B0F]">Ally</h1>
          <span className="text-4xl text-[#0B0B0F]/70">✨</span>
        </div>
        
        {/* Tagline */}
        <p className="text-3xl font-medium text-[#0B0B0F]/90 leading-tight max-w-[280px]">
          Play the life game, one step at a time.
        </p>
      </motion.div>
    </div>
  );
};

export default Splash;
