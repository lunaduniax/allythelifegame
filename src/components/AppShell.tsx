import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { CreateGoalFlow } from '@/components/CreateGoalFlow';
import { useUserProjects } from '@/hooks/useUserProjects';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreateFlowOpen, setIsCreateFlowOpen] = useState(false);
  const { projects, addProject, refetch, hasFetched } = useUserProjects();
  const { unreadCount, createNotification } = useNotifications();

  // Auto-open modal when user has 0 goals
  useEffect(() => {
    if (hasFetched && projects.length === 0 && !isCreateFlowOpen) {
      setIsCreateFlowOpen(true);
    }
  }, [hasFetched, projects.length]);

  // Determine active tab based on current route
  const getActiveTab = (): 'home' | 'create' | 'notifications' | 'profile' => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path === '/notifications') return 'notifications';
    if (['/account', '/settings', '/help', '/about'].includes(path)) return 'profile';
    return 'home';
  };

  const handleTabChange = (tab: 'home' | 'create' | 'notifications' | 'profile') => {
    if (tab === 'home') {
      navigate('/');
    } else if (tab === 'profile') {
      navigate('/account');
    } else if (tab === 'notifications') {
      navigate('/notifications');
    }
  };

  const handleCreateComplete = async (
    projectData: {
      name: string;
      category: string;
      color: string;
      importance?: string;
      targetDate?: string;
      reminderFrequency: string;
    },
    tasks: string[]
  ) => {
    // Create the project
    const newProject = await addProject({
      name: projectData.name,
      category: projectData.category,
      color: projectData.color,
      importance: projectData.importance,
      targetDate: projectData.targetDate,
      reminderFrequency: projectData.reminderFrequency,
    });

    if (newProject && user) {
      // Create tasks for this project
      if (tasks.length > 0) {
        const taskInserts = tasks.map(title => ({
          user_id: user.id,
          project_id: newProject.id,
          title,
          status: 'in_progress',
        }));

        await supabase.from('tasks').insert(taskInserts);
      }

      // Create notifications
      await createNotification(
        'Nueva meta creada',
        `Has creado la meta "${projectData.name}". ¡Vamos a lograrla!`
      );

      if (projectData.reminderFrequency && projectData.reminderFrequency !== 'Prefiero no recibir recordatorios') {
        await createNotification(
          'Recordatorios activados',
          `Recibirás recordatorios ${projectData.reminderFrequency.toLowerCase()} para tu meta "${projectData.name}".`
        );
      }

      // Refresh projects and close modal
      await refetch();
      setIsCreateFlowOpen(false);

      // Navigate to home with new project selected
      navigate('/', { state: { selectedProjectId: newProject.id } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main content with bottom padding for nav */}
      <div className="pb-24">
        <Outlet context={{ createNotification, openCreateFlow: () => setIsCreateFlowOpen(true) }} />
      </div>

      {/* Persistent Bottom Nav */}
      <BottomNav
        activeTab={getActiveTab()}
        onTabChange={handleTabChange}
        onCreateTask={() => setIsCreateFlowOpen(true)}
        unreadNotifications={unreadCount}
      />

      {/* Create Goal Flow Modal */}
      <CreateGoalFlow
        isOpen={isCreateFlowOpen}
        onClose={() => setIsCreateFlowOpen(false)}
        onComplete={handleCreateComplete}
      />
    </div>
  );
};
