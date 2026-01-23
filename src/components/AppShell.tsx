import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { CreateGoalFlow } from '@/components/CreateGoalFlow';
import { AllyGPTChat } from '@/components/AllyGPTChat';
import ProfileOnboardingModal from '@/components/ProfileOnboardingModal';
import { useUserProjects } from '@/hooks/useUserProjects';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreateFlowOpen, setIsCreateFlowOpen] = useState(false);
  const [isAllyGPTOpen, setIsAllyGPTOpen] = useState(false);
  const [profileOnboardingComplete, setProfileOnboardingComplete] = useState(false);
  const [selectedProjectContext, setSelectedProjectContext] = useState<{
    id: string;
    name: string;
    category: string;
  } | null>(null);
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
    const newProject = await addProject({
      name: projectData.name,
      category: projectData.category,
      color: projectData.color,
      importance: projectData.importance,
      targetDate: projectData.targetDate,
      reminderFrequency: projectData.reminderFrequency,
    });

    if (newProject && user) {
      if (tasks.length > 0) {
        const taskInserts = tasks.map(title => ({
          user_id: user.id,
          project_id: newProject.id,
          title,
          status: 'in_progress',
        }));
        await supabase.from('tasks').insert(taskInserts);
      }

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

      await refetch();
      setIsCreateFlowOpen(false);
      navigate('/', { state: { selectedProjectId: newProject.id } });
    }
  };

  // AllyGPT handlers
  const handleOpenAllyGPT = (projectContext: { id: string; name: string; category: string } | null) => {
    setSelectedProjectContext(projectContext);
    setIsAllyGPTOpen(true);
  };

  const handleCreateGoalFromAllyGPT = async (
    goal: { name: string; category: string },
    tasks: string[]
  ) => {
    const newProject = await addProject({
      name: goal.name,
      category: goal.category,
      color: '#D4FE00',
      reminderFrequency: '3 veces por semana',
    });

    if (newProject && user) {
      if (tasks.length > 0) {
        const taskInserts = tasks.map(title => ({
          user_id: user.id,
          project_id: newProject.id,
          title,
          status: 'in_progress',
        }));
        await supabase.from('tasks').insert(taskInserts);
      }

      await createNotification(
        'Nueva meta creada con AllyGPT',
        `AllyGPT te ayudó a crear la meta "${goal.name}". ¡Vamos a lograrla!`
      );

      await refetch();
      toast.success('Meta creada con éxito');
      navigate('/', { state: { selectedProjectId: newProject.id } });
    }
  };

  const handleAddTasksFromAllyGPT = async (projectId: string, tasks: string[]) => {
    if (!user || tasks.length === 0) return;

    const taskInserts = tasks.map(title => ({
      user_id: user.id,
      project_id: projectId,
      title,
      status: 'in_progress',
    }));

    const { error } = await supabase.from('tasks').insert(taskInserts);

    if (error) {
      console.error('Error adding tasks:', error);
      toast.error('Error al agregar tareas');
      return;
    }

    await createNotification(
      'Tareas agregadas',
      `AllyGPT agregó ${tasks.length} tareas nuevas a tu meta.`
    );

    await refetch();
    toast.success(`${tasks.length} tareas agregadas`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pb-24">
        <Outlet
          context={{
            createNotification,
            openCreateFlow: () => setIsCreateFlowOpen(true),
            openAllyGPT: handleOpenAllyGPT,
          }}
        />
      </div>

      <BottomNav
        activeTab={getActiveTab()}
        onTabChange={handleTabChange}
        onCreateTask={() => setIsCreateFlowOpen(true)}
        unreadNotifications={unreadCount}
      />

      <CreateGoalFlow
        isOpen={isCreateFlowOpen}
        onClose={() => setIsCreateFlowOpen(false)}
        onComplete={handleCreateComplete}
      />

      <AllyGPTChat
        isOpen={isAllyGPTOpen}
        onClose={() => setIsAllyGPTOpen(false)}
        projectContext={selectedProjectContext}
        onCreateGoal={handleCreateGoalFromAllyGPT}
        onAddTasks={handleAddTasksFromAllyGPT}
      />

      <ProfileOnboardingModal
        user={user}
        onComplete={() => setProfileOnboardingComplete(true)}
      />
    </div>
  );
};
