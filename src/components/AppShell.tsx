import { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { useUserProjects } from '@/hooks/useUserProjects';

export const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const { addProject } = useUserProjects();

  // Determine active tab based on current route
  const getActiveTab = (): 'home' | 'create' | 'notifications' | 'profile' => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (['/account', '/settings', '/help', '/about'].includes(path)) return 'profile';
    return 'home';
  };

  const handleTabChange = (tab: 'home' | 'create' | 'notifications' | 'profile') => {
    if (tab === 'home') {
      navigate('/');
    } else if (tab === 'profile') {
      navigate('/account');
    }
    // notifications tab - future implementation
  };

  const handleCreateProject = async (data: { 
    name: string; 
    category: string; 
    color: string; 
    importance?: string; 
    targetDate?: string; 
    reminderFrequency: string 
  }) => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Main content with bottom padding for nav */}
      <div className="pb-24">
        <Outlet />
      </div>

      {/* Persistent Bottom Nav */}
      <BottomNav
        activeTab={getActiveTab()}
        onTabChange={handleTabChange}
        onCreateTask={() => setIsProjectModalOpen(true)}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};
