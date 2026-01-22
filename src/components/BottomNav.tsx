import { FC } from 'react';
import { ListTodo, Plus, Bell, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: 'home' | 'create' | 'notifications' | 'profile';
  onTabChange: (tab: 'home' | 'create' | 'notifications' | 'profile') => void;
  onCreateTask: () => void;
}

export const BottomNav: FC<BottomNavProps> = ({ activeTab, onTabChange, onCreateTask }) => {
  const navItems = [
    { id: 'home' as const, icon: ListTodo, label: 'Home' },
    { id: 'create' as const, icon: Plus, label: 'Create', isAction: true },
    { id: 'notifications' as const, icon: Bell, label: 'Notifications' },
    { id: 'profile' as const, icon: Smile, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-6 left-0 right-0 z-50 px-6 safe-area-pb">
      <div className="flex items-center justify-around py-3 px-3 max-w-sm mx-auto bg-card rounded-[28px] border border-border/50 shadow-xl">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onCreateTask}
                className="w-12 h-12 rounded-xl border-2 border-muted-foreground/40 flex items-center justify-center transition-all hover:border-foreground/60"
              >
                <Icon size={20} className="text-muted-foreground" strokeWidth={2} />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="p-1 transition-all"
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                isActive 
                  ? "bg-primary/20" 
                  : "hover:bg-secondary"
              )}>
                <Icon 
                  size={22} 
                  className={cn(
                    "transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                  strokeWidth={2}
                />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
