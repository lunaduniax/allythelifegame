import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { mockDemoNotifications } from '@/data/mockDemoData';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Check if we're in a preview/development environment
const isPreviewEnvironment = (): boolean => {
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname.includes('127.0.0.1') ||
    hostname.includes('preview') ||
    hostname.includes('lovable.app') ||
    import.meta.env.DEV
  );
};

export const useNotifications = () => {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check if we're in demo mode
  const isDemoMode = isPreviewEnvironment() && !user && !authLoading;

  // Handle demo mode
  useEffect(() => {
    if (isDemoMode) {
      setNotifications(mockDemoNotifications as Notification[]);
      setUnreadCount(mockDemoNotifications.filter(n => !n.read).length);
      setLoading(false);
    }
  }, [isDemoMode]);

  const fetchNotifications = useCallback(async () => {
    if (isDemoMode) return;
    
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notifs = (data || []) as Notification[];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user]);

  const createNotification = useCallback(async (title: string, message: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title,
          message,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setNotifications(prev => [data as Notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, [user]);

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAllAsRead,
    createNotification,
  };
};
