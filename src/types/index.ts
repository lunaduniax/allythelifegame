export interface Task {
  id: string;
  projectId: string;
  title: string;
  category: string;
  date: string;
  description: string;
  status: 'in_progress' | 'completed';
}

export interface Project {
  id: string;
  name: string;
  category: string;
  color: 'light' | 'yellow';
  tasks: Task[];
}

export type TaskStatus = 'in_progress' | 'completed';
