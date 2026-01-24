import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCallback, useRef, useState, useEffect } from 'react';
import { mockDemoProjects, mockDemoTasks } from '@/data/mockDemoData';
import { toast } from 'sonner';

export interface DbProject {
  id: string;
  user_id: string;
  name: string;
  category: string;
  color: string;
  importance: string | null;
  target_date: string | null;
  reminder_frequency: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbTask {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  category: string | null;
  date: string | null;
  description: string | null;
  status: 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

// Check if we're in a preview/development environment
const isPreviewEnvironment = (): boolean => {
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname.includes('127.0.0.1') ||
    hostname.includes('preview') ||
    hostname.includes('lovable.app') ||
    import.meta.env.DEV
  );
};

const PROJECTS_KEY = ['projects'];
const TASKS_KEY = ['tasks'];

export function useProjectsQuery(initialSelectedId?: string | null) {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const initialIdRef = useRef<string | null>(initialSelectedId || null);
  
  // Check if we're in demo mode (preview environment + no user)
  const isDemoMode = isPreviewEnvironment() && !user && !authLoading;
  
  // Update ref if initialSelectedId changes
  useEffect(() => {
    if (initialSelectedId) {
      initialIdRef.current = initialSelectedId;
    }
  }, [initialSelectedId]);

  // Fetch projects query
  const projectsQuery = useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }
      
      return (data || []) as DbProject[];
    },
    enabled: !!user && !isDemoMode,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch tasks query
  const tasksQuery = useQuery({
    queryKey: TASKS_KEY,
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      
      return (data || []) as DbTask[];
    },
    enabled: !!user && !isDemoMode,
    staleTime: 1000 * 60 * 5,
  });

  // Get projects (from query or demo data)
  const projects = isDemoMode ? mockDemoProjects : (projectsQuery.data || []);
  const tasks = isDemoMode ? mockDemoTasks : (tasksQuery.data || []);

  // Auto-select project when data loads
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      const targetId = initialIdRef.current;
      if (targetId && projects.some(p => p.id === targetId)) {
        setSelectedProjectId(targetId);
        initialIdRef.current = null;
      } else {
        setSelectedProjectId(projects[0].id);
      }
    }
  }, [projects, selectedProjectId]);

  // Handle initialSelectedId changes (e.g., from navigation)
  useEffect(() => {
    if (initialSelectedId && projects.some(p => p.id === initialSelectedId)) {
      setSelectedProjectId(initialSelectedId);
    }
  }, [initialSelectedId, projects]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // ===== MUTATIONS WITH OPTIMISTIC UPDATES =====

  // Complete task mutation with optimistic update
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!user) throw new Error('No user');
      
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', taskId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return taskId;
    },
    onMutate: async (taskId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      
      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<DbTask[]>(TASKS_KEY);
      
      // Optimistically update
      queryClient.setQueryData<DbTask[]>(TASKS_KEY, (old) =>
        old?.map((t) => (t.id === taskId ? { ...t, status: 'completed' as const } : t)) || []
      );
      
      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      console.error('Error completing task:', err);
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_KEY, context.previousTasks);
      }
      toast.error('Error al completar tarea');
    },
  });

  // Add task mutation with optimistic update
  const addTaskMutation = useMutation({
    mutationFn: async ({ 
      projectId, 
      taskData 
    }: { 
      projectId: string; 
      taskData: { title: string; category?: string; date?: string; description?: string } 
    }) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          user_id: user.id,
          title: taskData.title,
          category: taskData.category || null,
          date: taskData.date || null,
          description: taskData.description || null,
          status: 'in_progress',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as DbTask;
    },
    onMutate: async ({ projectId, taskData }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      
      const previousTasks = queryClient.getQueryData<DbTask[]>(TASKS_KEY);
      
      // Create optimistic task
      const optimisticTask: DbTask = {
        id: `temp-${Date.now()}`,
        project_id: projectId,
        user_id: user!.id,
        title: taskData.title,
        category: taskData.category || null,
        date: taskData.date || null,
        description: taskData.description || null,
        status: 'in_progress',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      queryClient.setQueryData<DbTask[]>(TASKS_KEY, (old) => [...(old || []), optimisticTask]);
      
      return { previousTasks, optimisticTask };
    },
    onSuccess: (newTask, variables, context) => {
      // Replace optimistic task with real one
      queryClient.setQueryData<DbTask[]>(TASKS_KEY, (old) =>
        old?.map((t) => (t.id === context?.optimisticTask.id ? newTask : t)) || []
      );
    },
    onError: (err, variables, context) => {
      console.error('Error adding task:', err);
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_KEY, context.previousTasks);
      }
      toast.error('Error al crear tarea');
    },
  });

  // Add project mutation with optimistic update
  const addProjectMutation = useMutation({
    mutationFn: async (projectData: { 
      name: string; 
      category: string; 
      color: string; 
      importance?: string; 
      targetDate?: string; 
      reminderFrequency?: string 
    }) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectData.name,
          category: projectData.category,
          color: projectData.color,
          importance: projectData.importance || null,
          target_date: projectData.targetDate || null,
          reminder_frequency: projectData.reminderFrequency || '3 veces por semana',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as DbProject;
    },
    onSuccess: (newProject) => {
      // Add to cache and select it
      queryClient.setQueryData<DbProject[]>(PROJECTS_KEY, (old) => [newProject, ...(old || [])]);
      setSelectedProjectId(newProject.id);
    },
    onError: (err) => {
      console.error('Error adding project:', err);
      toast.error('Error al crear meta');
    },
  });

  // Delete project mutation with optimistic update
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      if (!user) throw new Error('No user');
      
      // Delete tasks first
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);
      
      if (tasksError) throw tasksError;
      
      // Delete project
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);
      
      if (projectError) throw projectError;
      
      return projectId;
    },
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: PROJECTS_KEY });
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      
      const previousProjects = queryClient.getQueryData<DbProject[]>(PROJECTS_KEY);
      const previousTasks = queryClient.getQueryData<DbTask[]>(TASKS_KEY);
      
      // Optimistically remove project and its tasks
      const newProjects = previousProjects?.filter((p) => p.id !== projectId) || [];
      const newTasks = previousTasks?.filter((t) => t.project_id !== projectId) || [];
      
      queryClient.setQueryData(PROJECTS_KEY, newProjects);
      queryClient.setQueryData(TASKS_KEY, newTasks);
      
      // Update selection
      if (selectedProjectId === projectId) {
        setSelectedProjectId(newProjects.length > 0 ? newProjects[0].id : null);
      }
      
      return { previousProjects, previousTasks, deletedProjectId: projectId };
    },
    onError: (err, projectId, context) => {
      console.error('Error deleting project:', err);
      if (context?.previousProjects) {
        queryClient.setQueryData(PROJECTS_KEY, context.previousProjects);
      }
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_KEY, context.previousTasks);
      }
      toast.error('Error al eliminar meta');
    },
  });

  // Add multiple tasks at once (for AllyGPT)
  const addMultipleTasksMutation = useMutation({
    mutationFn: async ({ projectId, tasks: taskTitles }: { projectId: string; tasks: string[] }) => {
      if (!user) throw new Error('No user');
      
      const taskInserts = taskTitles.map(title => ({
        user_id: user.id,
        project_id: projectId,
        title,
        status: 'in_progress',
      }));
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskInserts)
        .select();
      
      if (error) throw error;
      return data as DbTask[];
    },
    onSuccess: (newTasks) => {
      queryClient.setQueryData<DbTask[]>(TASKS_KEY, (old) => [...(old || []), ...newTasks]);
    },
    onError: (err) => {
      console.error('Error adding tasks:', err);
      toast.error('Error al agregar tareas');
    },
  });

  // Helper functions
  const getProjectTasks = useCallback(
    (projectId: string) => tasks.filter((t) => t.project_id === projectId),
    [tasks]
  );

  const getProjectProgress = useCallback(
    (projectId: string) => {
      const projectTasks = getProjectTasks(projectId);
      if (projectTasks.length === 0) return 0;
      const completed = projectTasks.filter((t) => t.status === 'completed').length;
      return Math.round((completed / projectTasks.length) * 100);
    },
    [getProjectTasks]
  );

  const inProgressTasks = selectedProject
    ? tasks.filter((t) => t.project_id === selectedProject.id && t.status === 'in_progress')
    : [];

  // Wrapper functions for simpler API
  const completeTask = useCallback(
    async (taskId: string) => {
      return completeTaskMutation.mutateAsync(taskId);
    },
    [completeTaskMutation]
  );

  const addTask = useCallback(
    async (projectId: string, taskData: { title: string; category?: string; date?: string; description?: string }) => {
      return addTaskMutation.mutateAsync({ projectId, taskData });
    },
    [addTaskMutation]
  );

  const addProject = useCallback(
    async (projectData: { name: string; category: string; color: string; importance?: string; targetDate?: string; reminderFrequency?: string }): Promise<DbProject | null> => {
      try {
        return await addProjectMutation.mutateAsync(projectData);
      } catch {
        return null;
      }
    },
    [addProjectMutation]
  );

  const deleteProject = useCallback(
    async (projectId: string): Promise<{ success: boolean; remainingProjects: DbProject[] }> => {
      try {
        await deleteProjectMutation.mutateAsync(projectId);
        const remaining = queryClient.getQueryData<DbProject[]>(PROJECTS_KEY) || [];
        return { success: true, remainingProjects: remaining };
      } catch {
        return { success: false, remainingProjects: projects };
      }
    },
    [deleteProjectMutation, projects, queryClient]
  );

  const addMultipleTasks = useCallback(
    async (projectId: string, taskTitles: string[]) => {
      return addMultipleTasksMutation.mutateAsync({ projectId, tasks: taskTitles });
    },
    [addMultipleTasksMutation]
  );

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    queryClient.invalidateQueries({ queryKey: TASKS_KEY });
  }, [queryClient]);

  const loading = projectsQuery.isLoading || tasksQuery.isLoading || authLoading;
  const hasFetched = projectsQuery.isFetched && tasksQuery.isFetched;

  return {
    projects,
    tasks,
    loading,
    hasFetched: isDemoMode ? true : hasFetched,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    getProjectTasks,
    getProjectProgress,
    completeTask,
    addTask,
    addProject,
    deleteProject,
    addMultipleTasks,
    inProgressTasks,
    refetch,
    // Mutation states for UI feedback
    isCompletingTask: completeTaskMutation.isPending,
    isAddingTask: addTaskMutation.isPending,
    isAddingProject: addProjectMutation.isPending,
    isDeletingProject: deleteProjectMutation.isPending,
  };
}
