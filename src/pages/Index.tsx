import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ProjectsCarousel } from '@/components/ProjectsCarousel';
import { TasksList } from '@/components/TasksList';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { useUserProjects } from '@/hooks/useUserProjects';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AppShellContext {
  createNotification: (title: string, message: string) => Promise<void>;
}

interface IndexProps {
  initialProjectId?: string | null;
}

const Index = ({ initialProjectId }: IndexProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createNotification } = useOutletContext<AppShellContext>();
  
  const {
    projects,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    getProjectProgress,
    completeTask,
    addTask,
    addProject,
    deleteProject,
    inProgressTasks,
    loading,
  } = useUserProjects(initialProjectId);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const handleCreateTask = (data: { title: string; category: string; date: string; description: string }) => {
    if (selectedProjectId) {
      addTask(selectedProjectId, data);
    }
  };

  const handleCreateProject = async (data: { name: string; category: string; color: string; importance?: string; targetDate?: string; reminderFrequency: string }) => {
    const newProject = await addProject({
      name: data.name,
      category: data.category,
      color: data.color,
      importance: data.importance,
      targetDate: data.targetDate,
      reminderFrequency: data.reminderFrequency,
    });
    
    if (newProject) {
      navigate('/add-tasks', { 
        state: { 
          selectedProjectId: newProject.id,
          projectName: newProject.name 
        } 
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const { success, remainingProjects } = await deleteProject(projectId);
    
    if (success) {
      toast.success('Meta eliminada');
      
      if (remainingProjects.length === 0) {
        navigate('/create-goal', { replace: true });
      }
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

  if (loading || !mappedSelectedProject) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
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
        onCreateProject={() => setIsProjectModalOpen(true)}
        onDeleteProject={handleDeleteProject}
      />

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

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        project={mappedSelectedProject}
      />

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default Index;
