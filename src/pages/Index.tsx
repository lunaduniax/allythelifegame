import { useState } from 'react';
import { Header } from '@/components/Header';
import { ProjectsCarousel } from '@/components/ProjectsCarousel';
import { TasksList } from '@/components/TasksList';
import { BottomNav } from '@/components/BottomNav';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { useUserProjects } from '@/hooks/useUserProjects';
import { useAuth } from '@/hooks/useAuth';

interface IndexProps {
  initialProjectId?: string | null;
}

const Index = ({ initialProjectId }: IndexProps) => {
  const { user } = useAuth();
  
  const {
    projects,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    getProjectProgress,
    completeTask,
    addTask,
    addProject,
    inProgressTasks,
    loading,
  } = useUserProjects(initialProjectId);

  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'notifications' | 'profile'>('home');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const handleCreateTask = (data: { title: string; category: string; date: string; description: string }) => {
    if (selectedProjectId) {
      addTask(selectedProjectId, data);
    }
  };

  const handleCreateProject = (data: { name: string; category: string; color: string }) => {
    addProject(data);
  };

  // Map DbProject to component-compatible format
  const mappedProjects = projects.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    color: p.color,
    tasks: [], // Tasks are fetched separately
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

  // Get user's display name from profile or email
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario';

  // Show loading state
  if (loading || !mappedSelectedProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
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
      />

      <TasksList
        projectName={mappedSelectedProject.name}
        projectColor={mappedSelectedProject.color}
        tasks={mappedTasks}
        onCompleteTask={completeTask}
        onCreateTask={() => setIsTaskModalOpen(true)}
      />

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
