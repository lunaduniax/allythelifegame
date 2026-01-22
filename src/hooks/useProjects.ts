import { useState, useCallback } from 'react';
import { Project, Task } from '@/types';
import { initialProjects } from '@/data/mockData';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjects[0].id);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const getProjectProgress = useCallback((project: Project) => {
    const total = project.tasks.length;
    if (total === 0) return 0;
    const completed = project.tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / total) * 100);
  }, []);

  const completeTask = useCallback((taskId: string) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      tasks: project.tasks.map(task =>
        task.id === taskId ? { ...task, status: 'completed' as const } : task
      ),
    })));
  }, []);

  const addTask = useCallback((projectId: string, taskData: Omit<Task, 'id' | 'projectId' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: `t${Date.now()}`,
      projectId,
      status: 'in_progress',
    };

    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? { ...project, tasks: [...project.tasks, newTask] }
        : project
    ));
  }, []);

  const addProject = useCallback((projectData: Omit<Project, 'id' | 'tasks'>) => {
    const newProject: Project = {
      ...projectData,
      id: `p${Date.now()}`,
      tasks: [],
    };

    setProjects(prev => [...prev, newProject]);
  }, []);

  const inProgressTasks = selectedProject.tasks.filter(t => t.status === 'in_progress');

  return {
    projects,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    getProjectProgress,
    completeTask,
    addTask,
    addProject,
    inProgressTasks,
  };
}
