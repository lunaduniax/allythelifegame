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
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Store the initial ID in a ref to persist across renders and fetches
  const initialIdRef = useRef<string | null>(initialSelectedId || null);

  // Prevent infinite loops when we auto-clean duplicates
  const didCleanupDuplicatesRef = useRef(false);
  
  // Update ref if initialSelectedId changes (e.g., from navigation)
  useEffect(() => {
    if (initialSelectedId) {
      initialIdRef.current = initialSelectedId;
      // If we already have projects loaded, immediately select the new project
      if (projects.length > 0 && projects.some(p => p.id === initialSelectedId)) {
        setSelectedProjectId(initialSelectedId);
      }
    }
  }, [initialSelectedId, projects]);

  const fetchProjects = useCallback(async (forceRefresh = false) => {
    // Don't fetch if auth is still loading - wait for it
    if (authLoading) {
      return;
    }
    
    // If no user after auth loading completes, set empty state
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

      // --- Auto-clean duplicated projects for the current user (by name) ---
      // Keep only the oldest project per normalized name, delete the rest + their tasks.
      // Run at most once per session to avoid loops.
      if (!didCleanupDuplicatesRef.current && projectsData && projectsData.length > 0) {
        const byName = new Map<string, DbProject[]>();
        for (const p of projectsData as DbProject[]) {
          const key = (p.name || '').trim().toLowerCase();
          if (!key) continue;
          const arr = byName.get(key) || [];
          arr.push(p);
          byName.set(key, arr);
        }

        const duplicateIdsToDelete: string[] = [];
        for (const [, arr] of byName) {
          if (arr.length <= 1) continue;
          // Oldest = smallest created_at
          const sorted = [...arr].sort((a, b) => {
            const at = new Date(a.created_at).getTime();
            const bt = new Date(b.created_at).getTime();
            return at - bt;
          });
          const toDelete = sorted.slice(1).map((p) => p.id);
          duplicateIdsToDelete.push(...toDelete);
        }

        if (duplicateIdsToDelete.length > 0) {
          didCleanupDuplicatesRef.current = true;

          // Delete tasks that belong to duplicated projects
          const { error: tasksDeleteError } = await supabase
            .from('tasks')
            .delete()
            .eq('user_id', user.id)
            .in('project_id', duplicateIdsToDelete);

          if (tasksDeleteError) {
            console.error('Error deleting duplicate project tasks:', tasksDeleteError);
          }

          // Delete duplicated projects
          const { error: projectsDeleteError } = await supabase
            .from('projects')
            .delete()
            .eq('user_id', user.id)
            .in('id', duplicateIdsToDelete);

          if (projectsDeleteError) {
            console.error('Error deleting duplicate projects:', projectsDeleteError);
          }

          // Re-fetch clean lists (still within same fetch call)
          const { data: projectsData2, error: projectsError2 } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (projectsError2) throw projectsError2;

          const { data: tasksData2, error: tasksError2 } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });
          if (tasksError2) throw tasksError2;

          setProjects(projectsData2 || []);
          setTasks((tasksData2 as DbTask[]) || []);

          // Continue selection logic using refreshed projects list
          if (projectsData2 && projectsData2.length > 0) {
            const targetId = initialIdRef.current;
            if (targetId && projectsData2.some((p) => p.id === targetId)) {
              setSelectedProjectId(targetId);
              initialIdRef.current = null;
            } else if (!selectedProjectId || forceRefresh) {
              setSelectedProjectId(projectsData2[0].id);
            }
          }

          return; // Done for this fetch
        }
      }

      // If no duplicates (or already cleaned), proceed normally
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
        } else if (!selectedProjectId || forceRefresh) {
          // Select the first (most recent) project if no valid selection or forcing refresh
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
    // Only fetch when auth loading is complete
    if (!authLoading) {
      fetchProjects();
    }
  }, [user, authLoading]); // Refetch when user or authLoading changes

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

  const deleteProject = useCallback(
    async (projectId: string): Promise<{ success: boolean; remainingProjects: DbProject[] }> => {
      if (!user) return { success: false, remainingProjects: projects };

      // First delete all tasks for this project
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (tasksError) {
        console.error('Error deleting project tasks:', tasksError);
        return { success: false, remainingProjects: projects };
      }

      // Then delete the project
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (projectError) {
        console.error('Error deleting project:', projectError);
        return { success: false, remainingProjects: projects };
      }

      // Update local state
      const newProjects = projects.filter((p) => p.id !== projectId);
      const newTasks = tasks.filter((t) => t.project_id !== projectId);
      
      setProjects(newProjects);
      setTasks(newTasks);

      // If the deleted project was selected, select the first remaining one
      if (selectedProjectId === projectId) {
        setSelectedProjectId(newProjects.length > 0 ? newProjects[0].id : null);
      }

      return { success: true, remainingProjects: newProjects };
    },
    [user, projects, tasks, selectedProjectId]
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
    deleteProject,
    inProgressTasks,
    refetch: () => fetchProjects(true),
  };
}
