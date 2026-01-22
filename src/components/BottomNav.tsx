import { FC } from 'react';
import { Home, Plus, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: 'home' | 'create' | 'notifications' | 'profile';
  onTabChange: (tab: 'home' | 'create' | 'notifications' | 'profile') => void;
  onCreateTask: () => void;
}

export const BottomNav: FC<BottomNavProps> = ({ activeTab, onTabChange, onCreateTask }) => {
  const navItems = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: 'create' as const, icon: Plus, label: 'Create', isAction: true },
    { id: 'notifications' as const, icon: Bell, label: 'Notifications' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 safe-area-pb">
      <div className="flex items-center justify-around py-3 px-4 max-w-md mx-auto">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onCreateTask}
                className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center -mt-2 shadow-lg"
              >
                <Icon size={22} className="text-background" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                isActive && "bg-primary/15"
              )}>
                <Icon 
                  size={20} 
                  fill={isActive ? "currentColor" : "none"}
                  strokeWidth={isActive ? 1.5 : 2}
                />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
