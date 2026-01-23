import { FC, useState } from 'react';
import { Task } from '@/types';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  projectColor: string;
  onComplete: () => void;
}

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const hexClean = hex.replace('#', '');
  const r = parseInt(hexClean.substring(0, 2), 16);
  const g = parseInt(hexClean.substring(2, 4), 16);
  const b = parseInt(hexClean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const TaskCard: FC<TaskCardProps> = ({ task, projectColor, onComplete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 100], [1, 0.5]);
  const checkOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);
  const checkScale = useTransform(x, [0, 100], [0.5, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setIsCompleting(true);
      setTimeout(() => {
        onComplete();
      }, 300);
    }
  };

  const handleTap = () => {
    if (!isCompleting) {
      setIsExpanded(!isExpanded);
    }
  };

  if (isCompleting) {
    return (
      <motion.div
        initial={{ opacity: 1, height: 'auto' }}
        animate={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      />
    );
  }

  return (
    <div className="relative mb-4">
      {/* Success background indicator */}
      <motion.div 
        className="absolute inset-0 rounded-2xl bg-success flex items-center pl-6"
        style={{ opacity: checkOpacity }}
      >
        <motion.div style={{ scale: checkScale }}>
          <Check className="text-white" size={24} />
        </motion.div>
      </motion.div>

      {/* Draggable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 150 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x, opacity }}
        onClick={handleTap}
        className={cn(
          "bg-card/80 backdrop-blur-sm rounded-2xl p-5 cursor-pointer relative z-10",
          "border border-border/30 shadow-soft transition-all duration-300",
          "hover:border-border/50 hover:shadow-soft-lg"
        )}
        whileTap={{ scale: 0.98 }}
      >
        {/* Color accent bar */}
        <div 
          className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
          style={{ backgroundColor: projectColor }}
        />
        
        <div className="pl-3">
          <span 
            className="text-xs font-medium block mb-2 px-3 py-1.5 rounded-lg w-fit tracking-wide"
            style={{ 
              backgroundColor: hexToRgba(projectColor, 0.12),
              color: projectColor,
            }}
          >
            {task.category}
          </span>
          
          <h4 className="text-base font-medium text-foreground leading-snug mb-2">
            {task.title}
          </h4>
          
          <span className="text-sm text-muted-foreground">
            {task.date}
          </span>

          {/* Expanded description */}
          <motion.div
            initial={false}
            animate={{ 
              height: isExpanded ? 'auto' : 0,
              opacity: isExpanded ? 1 : 0,
              marginTop: isExpanded ? 16 : 0
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div 
              className="pt-4 border-t border-border/30"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {task.description}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
