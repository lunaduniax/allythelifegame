import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    
    const { success, remainingProjects } = await deleteProject(projectId);
    
    if (success) {
      toast.success('Meta eliminada');
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

  const userName = isDemoMode 
    ? 'Usuario Demo' 
    : (user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario');

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground text-lg font-light animate-pulse-soft"
        >
          Cargando...
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-background text-foreground"
      >
        <Header userName={userName} projectCount={0} />
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <p className="text-muted-foreground mb-6 text-lg font-light">No tenés metas todavía</p>
          <motion.button
            onClick={openCreateFlow}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-primary text-primary-foreground font-semibold py-4 px-8 rounded-2xl shadow-glow-sm hover:shadow-glow transition-all duration-200"
          >
            Crear mi primera meta
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-background text-foreground min-h-screen"
    >
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
            if (isDemoMode) {
              toast.info('Modo demo', { description: 'Inicia sesión para completar tareas' });
              return;
            }
            const task = mappedTasks.find(t => t.id === taskId);
            await completeTask(taskId);
            if (task && createNotification) {
              await createNotification(
                'Tarea completada',
                `Has completado "${task.title}". ¡Sigue así!`
              );
            }
          }}
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
    </motion.div>
  );
};

export default Index;
