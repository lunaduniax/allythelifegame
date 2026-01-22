import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DbProject {
  id: string;
  user_id: string;
  name: string;
  category: string;
  color: string;
  importance: string | null;
  target_date: string | null;
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

export function useUserProjects(initialSelectedId?: string | null) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialSelectedId || null);
  
  // Store the initial ID in a ref to persist across renders
  const initialIdRef = useRef(initialSelectedId);
  
  // Update ref if initialSelectedId changes (e.g., from navigation)
  useEffect(() => {
    if (initialSelectedId) {
      initialIdRef.current = initialSelectedId;
    }
  }, [initialSelectedId]);

  const fetchProjects = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setProjects([]);
      setTasks([]);
      setLoading(false);
      setHasFetched(true);
      return;
    }

    // Only set loading true if we haven't fetched yet or forcing refresh
    if (!hasFetched || forceRefresh) {
      setLoading(true);
    }

    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }); // Most recent first

      if (projectsError) throw projectsError;

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;

      setProjects(projectsData || []);
      setTasks((tasksData as DbTask[]) || []);

      // After fetching, select the right project
      if (projectsData && projectsData.length > 0) {
        const targetId = initialIdRef.current;
        
        // If we have an initial ID and it exists in the fetched projects, use it
        if (targetId && projectsData.some(p => p.id === targetId)) {
          setSelectedProjectId(targetId);
          // Clear the initial ref after successful use
          initialIdRef.current = null;
        } else if (!selectedProjectId || !projectsData.some(p => p.id === selectedProjectId)) {
          // Select the first (most recent) project if no valid selection
          setSelectedProjectId(projectsData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, [user, hasFetched, selectedProjectId]);

  useEffect(() => {
    fetchProjects();
  }, [user]); // Only refetch when user changes, not on every fetchProjects change

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

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

  const completeTask = useCallback(
    async (taskId: string) => {
      if (!user) return;

      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (!error) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' as const } : t))
        );
      }
    },
    [user]
  );

  const addTask = useCallback(
    async (projectId: string, taskData: { title: string; category?: string; date?: string; description?: string }) => {
      if (!user) return;

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

      if (!error && data) {
        setTasks((prev) => [...prev, data as DbTask]);
      }
    },
    [user]
  );

  const addProject = useCallback(
    async (projectData: { name: string; category: string; color: string }) => {
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectData.name,
          category: projectData.category,
          color: projectData.color,
        })
        .select()
        .single();

      if (!error && data) {
        setProjects((prev) => [data, ...prev]); // Add to beginning (most recent)
        setSelectedProjectId(data.id); // Auto-select the new project
      }
    },
    [user]
  );

  const inProgressTasks = selectedProject
    ? tasks.filter((t) => t.project_id === selectedProject.id && t.status === 'in_progress')
    : [];

  return {
    projects,
    tasks,
    loading,
    hasFetched,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    getProjectTasks,
    getProjectProgress,
    completeTask,
    addTask,
    addProject,
    inProgressTasks,
    refetch: () => fetchProjects(true),
  };
}
