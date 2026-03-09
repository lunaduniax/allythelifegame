import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, Check, Circle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, loading, unreadCount, markAllAsRead, markAsRead } = useNotifications();

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(notificationId);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: false, locale: es });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 pt-12">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h1 className="text-lg font-semibold">Notificaciones</h1>
        
        <button
          onClick={markAllAsRead}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          title="Marcar todas como leídas"
        >
          <Check size={18} />
        </button>
      </header>

      {/* Notifications List */}
      <div className="px-6 pt-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Bell size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No tenés notificaciones todavía</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "border border-border rounded-xl p-4 transition-colors",
                  !notification.read && "bg-primary/5 border-primary/20"
                )}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                      <h3 className={cn(
                        "font-medium truncate",
                        !notification.read && "text-foreground"
                      )}>
                        {notification.title}
                      </h3>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      hace {formatTime(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground w-full">
                    {notification.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
