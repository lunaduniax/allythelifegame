// Re-export everything from the new React Query based hook
// This maintains backwards compatibility
export { useProjectsQuery as useUserProjects } from './useProjectsQuery';
export type { DbProject, DbTask } from './useProjectsQuery';
