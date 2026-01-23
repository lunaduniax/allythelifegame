import { useState } from 'react';
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

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleCreateTask = (data: { title: string; category: string; date: string; description: string }) => {
    if (selectedProjectId) {
      addTask(selectedProjectId, data);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const { success, remainingProjects } = await deleteProject(projectId);
    
    if (success) {
      toast.success('Meta eliminada');
      // AppShell will auto-open the create modal when 0 projects remain
    } else {
      toast.error('Error al eliminar la meta');
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

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario';

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  // Empty state - AppShell will auto-open the create modal
  if (projects.length === 0) {
    return (
      <div className="bg-background text-foreground">
        <Header userName={userName} projectCount={0} />
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <p className="text-muted-foreground mb-4">No tenés metas todavía</p>
          <button
            onClick={openCreateFlow}
            className="bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl"
          >
            Crear mi primera meta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <Header 
        userName={userName} 
        projectCount={projects.length}
      />

      <ProjectsCarousel
        projects={mappedProjects}
        selectedProjectId={selectedProjectId || ''}
        onSelectProject={setSelectedProjectId}
        getProgress={(project) => getProjectProgress(project.id)}
        onCreateProject={openCreateFlow || (() => {})}
        onDeleteProject={handleDeleteProject}
      />

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

      {mappedSelectedProject && (
        <TasksList
          projectName={mappedSelectedProject.name}
          projectColor={mappedSelectedProject.color}
          tasks={mappedTasks}
          onCompleteTask={async (taskId) => {
            const task = mappedTasks.find(t => t.id === taskId);
            await completeTask(taskId);
            if (task && createNotification) {
              await createNotification(
                'Tarea completada',
                `Has completado "${task.title}". ¡Sigue así!`
              );
            }
          }}
          onCreateTask={() => setIsTaskModalOpen(true)}
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
