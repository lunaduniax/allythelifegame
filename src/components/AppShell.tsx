import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { CreateGoalFlow } from '@/components/CreateGoalFlow';
import { AllyGPTChat } from '@/components/AllyGPTChat';
import ProfileOnboardingModal from '@/components/ProfileOnboardingModal';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { useUserProjects } from '@/hooks/useUserProjects';
import { useNotifications } from '@/hooks/useNotifications';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [isCreateFlowOpen, setIsCreateFlowOpen] = useState(false);
  const [isAllyGPTOpen, setIsAllyGPTOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [profileOnboardingComplete, setProfileOnboardingComplete] = useState(false);
  const [selectedProjectContext, setSelectedProjectContext] = useState<{
    id: string;
    name: string;
    category: string;
  } | null>(null);
  
  const { 
    projects, 
    addProject, 
    addMultipleTasks,
    refetch, 
    hasFetched 
  } = useUserProjects();
  
  const { unreadCount, createNotification } = useNotifications();

  // Auto-open modal when user has 0 goals (only for authenticated users, not demo mode)
  useEffect(() => {
    if (!isDemoMode && hasFetched && projects.length === 0 && !isCreateFlowOpen) {
      setIsCreateFlowOpen(true);
    }
  }, [hasFetched, projects.length, isDemoMode]);

  // Determine active tab based on current route
  const getActiveTab = (): 'home' | 'community' | 'create' | 'notifications' | 'profile' => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path === '/community') return 'community';
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

  const handleCreateSuccess = async () => {
    // React Query will auto-update, but refetch to ensure consistency
    refetch();
    setIsCreateFlowOpen(false);
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
    try {
      const newProject = await addProject({
        name: goal.name,
        category: goal.category,
        color: '#D4FE00',
        reminderFrequency: '3 veces por semana',
      });

      if (newProject && user) {
        if (tasks.length > 0) {
          await addMultipleTasks(newProject.id, tasks);
        }

        await createNotification(
          'Nueva meta creada con AllyGPT',
          `AllyGPT te ayudó a crear la meta "${goal.name}". ¡Vamos a lograrla!`
        );

        toast.success('Meta creada con éxito');
        navigate('/', { state: { selectedProjectId: newProject.id } });
      }
    } catch (error) {
      console.error('Error creating goal from AllyGPT:', error);
      toast.error('Error al crear la meta');
    }
  };

  const handleAddTasksFromAllyGPT = async (projectId: string, tasks: string[]) => {
    if (!user || tasks.length === 0) return;

    try {
      await addMultipleTasks(projectId, tasks);

      await createNotification(
        'Tareas agregadas',
        `AllyGPT agregó ${tasks.length} tareas nuevas a tu meta.`
      );

      toast.success(`${tasks.length} tareas agregadas`);
    } catch (error) {
      console.error('Error adding tasks:', error);
      toast.error('Error al agregar tareas');
    }
  };

  // Demo mode action handler - shows toast instead of performing action
  const handleDemoAction = (actionName: string) => {
    toast.info('Modo demo', {
      description: 'Inicia sesión para ' + actionName,
    });
    return;
  };

  return (
    <div className="min-h-screen bg-background">
      <DemoModeBanner />
      <div className="pb-24">
        <Outlet
          context={{
            createNotification: isDemoMode 
              ? () => handleDemoAction('recibir notificaciones') 
              : createNotification,
            openCreateFlow: isDemoMode 
              ? () => handleDemoAction('crear metas') 
              : () => setIsCreateFlowOpen(true),
            openAllyGPT: isDemoMode 
              ? () => handleDemoAction('usar AllyGPT') 
              : handleOpenAllyGPT,
            isDemoMode,
            isTaskModalOpen,
            setIsTaskModalOpen: isDemoMode
              ? () => handleDemoAction('crear tareas')
              : setIsTaskModalOpen,
          }}
        />
      </div>

      {!isTaskModalOpen && (
        <BottomNav
          activeTab={getActiveTab()}
          onTabChange={handleTabChange}
          onCreateTask={isDemoMode 
            ? () => handleDemoAction('crear tareas') 
            : () => setIsCreateFlowOpen(true)}
          unreadNotifications={unreadCount}
        />
      )}

      {!isDemoMode && (
        <>
          <CreateGoalFlow
            isOpen={isCreateFlowOpen}
            onClose={() => setIsCreateFlowOpen(false)}
            onSuccess={handleCreateSuccess}
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
        </>
      )}
    </div>
  );
};
