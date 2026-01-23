import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListTodo, Plus, Bell, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BottomNavProps {
  activeTab: 'home' | 'create' | 'notifications' | 'profile';
  onTabChange: (tab: 'home' | 'create' | 'notifications' | 'profile') => void;
  onCreateTask: () => void;
  unreadNotifications?: number;
}

export const BottomNav: FC<BottomNavProps> = ({ 
  activeTab, 
  onTabChange, 
  onCreateTask,
  unreadNotifications = 0 
}) => {
  const navigate = useNavigate();
  
  const navItems = [
    { id: 'home' as const, icon: ListTodo, label: 'Home' },
    { id: 'create' as const, icon: Plus, label: 'Create', isAction: true },
    { id: 'notifications' as const, icon: Bell, label: 'Notifications' },
    { id: 'profile' as const, icon: Smile, label: 'Profile' },
  ];

  const handleTabClick = (id: 'home' | 'create' | 'notifications' | 'profile') => {
    if (id === 'profile') {
      navigate('/account');
    } else if (id === 'notifications') {
      navigate('/notifications');
    } else {
      onTabChange(id);
    }
  };

  return (
    <nav className="fixed bottom-8 left-0 right-0 z-50 px-8 safe-area-pb">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-around py-4 px-4 max-w-xs mx-auto bg-card/90 backdrop-blur-xl rounded-[32px] border border-border/30 shadow-soft-lg"
      >
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const showBadge = item.id === 'notifications' && unreadNotifications > 0;

          if (item.isAction) {
            return (
              <motion.button
                key={item.id}
                onClick={onCreateTask}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-2xl border border-muted-foreground/30 flex items-center justify-center transition-all duration-200 hover:border-primary/50 hover:bg-primary/5"
              >
                <Icon size={20} className="text-muted-foreground" strokeWidth={1.5} />
              </motion.button>
            );
          }

          return (
            <motion.button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 transition-all relative"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200",
                isActive 
                  ? "bg-primary/15" 
                  : "hover:bg-secondary/50"
              )}>
                <Icon 
                  size={22} 
                  className={cn(
                    "transition-colors duration-200",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                  strokeWidth={1.5}
                />
              </div>
              {/* Notification Badge */}
              {showBadge && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 min-w-[18px] h-[18px] rounded-full bg-primary flex items-center justify-center"
                >
                  <span className="text-[10px] font-bold text-primary-foreground px-1">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </nav>
  );
};
