import { useState } from 'react';
import { Header } from '@/components/Header';
import { ProjectsCarousel } from '@/components/ProjectsCarousel';
import { TasksList } from '@/components/TasksList';
import { BottomNav } from '@/components/BottomNav';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { useProjects } from '@/hooks/useProjects';

const Index = () => {
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
  } = useProjects();

  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'notifications' | 'profile'>('home');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const handleCreateTask = (data: { title: string; category: string; date: string; description: string }) => {
    addTask(selectedProjectId, data);
  };

  const handleCreateProject = (data: { name: string; category: string; color: 'light' | 'yellow' }) => {
    addProject(data);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        userName="Dani" 
        projectCount={projects.length}
      />

      <ProjectsCarousel
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        getProgress={getProjectProgress}
        onCreateProject={() => setIsProjectModalOpen(true)}
      />

      <TasksList
        projectName={selectedProject.name}
        tasks={inProgressTasks}
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
        project={selectedProject}
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
