import { useOutletContext } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ProjectsCarousel } from '@/components/ProjectsCarousel';
import { TasksList } from '@/components/TasksList';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { AllyGPTBanner } from '@/components/AllyGPTBanner';
import { useUserProjects } from '@/hooks/useUserProjects';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AppShellContext {
  createNotification: (title: string, message: string) => Promise<void>;
  openCreateFlow: () => void;
  openAllyGPT: (projectContext: { id: string; name: string; category: string } | null) => void;
  isDemoMode?: boolean;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
}

interface IndexProps {
  initialProjectId?: string | null;
}

const Index = ({ initialProjectId }: IndexProps) => {
  const { user } = useAuth();
  const context = useOutletContext<AppShellContext>();
  const createNotification = context?.createNotification;
  const openCreateFlow = context?.openCreateFlow;
  const openAllyGPT = context?.openAllyGPT;
  const isDemoMode = context?.isDemoMode || false;
  const isTaskModalOpen = context?.isTaskModalOpen || false;
  const setIsTaskModalOpen = context?.setIsTaskModalOpen || (() => {});

  const {
    projects,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    getProjectProgress,
    completeTask,
    addTask,
    deleteProject,
    inProgressTasks,
    loading,
  } = useUserProjects(initialProjectId);

  const handleCreateTask = async (data: { title: string; category: string; date: string; description: string }) => {
    if (isDemoMode) {
      toast.info('Modo demo', { description: 'Inicia sesión para crear tareas' });
      throw new Error('Demo mode');
    }
    if (selectedProjectId) {
      await addTask(selectedProjectId, data);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (isDemoMode) {
      toast.info('Modo demo', { description: 'Inicia sesión para eliminar metas' });
      return;
    }

    const { success } = await deleteProject(projectId);

    if (success) {
      toast.success('Meta eliminada');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    if (isDemoMode) {
      toast.info('Modo demo', { description: 'Inicia sesión para completar tareas' });
      return;
    }

    const task = inProgressTasks.find(t => t.id === taskId);
    await completeTask(taskId);

    if (task && createNotification) {
      await createNotification(
        'Tarea completada',
        `Has completado "${task.title}". ¡Sigue así!`
      );
    }
  };

  const mappedProjects = projects.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    color: p.color,
    tasks: [],
  }));

  const mappedSelectedProject = selectedProject ? {
    id: selectedProject.id,
    name: selectedProject.name,
    category: selectedProject.category,
    color: selectedProject.color,
    tasks: [],
  } : mappedProjects[0];

  const mappedTasks = inProgressTasks.map(t => ({
    id: t.id,
    projectId: t.project_id,
    title: t.title,
    category: t.category || '',
    date: t.date || '',
    description: t.description || '',
    status: t.status,
  }));

  const userName = isDemoMode
    ? 'Usuario Demo'
    : (user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario');

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-foreground px-5 pt-8 pb-20">
        <Header userName={userName} projectCount={0} />
        <div className="glass-panel premium-outline rounded-[32px] flex flex-col items-center justify-center py-20 px-6 text-center mt-2">
          <p className="text-muted-foreground mb-4">No tenés metas todavía</p>
          <button
            onClick={openCreateFlow}
            className="bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-full"
          >
            Crear mi primera meta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-foreground pb-6">
      <Header userName={userName} projectCount={projects.length} />

      <ProjectsCarousel
        projects={mappedProjects}
        selectedProjectId={selectedProjectId || ''}
        onSelectProject={setSelectedProjectId}
        getProgress={(project) => getProjectProgress(project.id)}
        onCreateProject={openCreateFlow || (() => {})}
        onDeleteProject={handleDeleteProject}
      />

      <div className="px-5 pt-1">
        <AllyGPTBanner
          onStartAllyGPT={() => {
            if (openAllyGPT) {
              openAllyGPT(
                mappedSelectedProject
                  ? {
                      id: mappedSelectedProject.id,
                      name: mappedSelectedProject.name,
                      category: mappedSelectedProject.category,
                    }
                  : null
              );
            }
          }}
        />
      </div>

      {mappedSelectedProject && (
        <TasksList
          projectName={mappedSelectedProject.name}
          projectColor={mappedSelectedProject.color}
          tasks={mappedTasks}
          onCompleteTask={handleCompleteTask}
          onCreateTask={() => {
            if (isDemoMode) {
              toast.info('Modo demo', { description: 'Inicia sesión para crear tareas' });
              return;
            }
            setIsTaskModalOpen(true);
          }}
        />
      )}

      {mappedSelectedProject && (
        <CreateTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSubmit={handleCreateTask}
          project={mappedSelectedProject}
        />
      )}
    </div>
  );
};

export default Index;