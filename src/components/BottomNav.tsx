import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListTodo, GraduationCap, Plus, Bell, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: 'home' | 'community' | 'create' | 'notifications' | 'profile';
  onTabChange: (tab: 'home' | 'community' | 'create' | 'notifications' | 'profile') => void;
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
    { id: 'community' as const, icon: GraduationCap, label: 'Community' },
    { id: 'create' as const, icon: Plus, label: 'Create', isAction: true },
    { id: 'notifications' as const, icon: Bell, label: 'Notifications' },
    { id: 'profile' as const, icon: Smile, label: 'Profile' },
  ];

  const handleTabClick = (id: 'home' | 'community' | 'create' | 'notifications' | 'profile') => {
    if (id === 'profile') {
      navigate('/account');
    } else if (id === 'notifications') {
      navigate('/notifications');
    } else if (id === 'community') {
      navigate('/community');
    } else {
      onTabChange(id);
    }
  };

  return (
    <nav className="fixed bottom-6 left-0 right-0 z-50 px-6 safe-area-pb">
      <div className="flex items-center justify-around py-3 px-3 max-w-sm mx-auto bg-card rounded-[28px] border border-border/50 shadow-xl">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const showBadge = item.id === 'notifications' && unreadNotifications > 0;

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
              onClick={() => handleTabClick(item.id)}
              className="p-1 transition-all relative"
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
              {/* Notification Badge */}
              {showBadge && (
                <div className="absolute top-0 right-0 min-w-[18px] h-[18px] rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary-foreground px-1">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
