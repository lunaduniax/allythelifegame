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
  color: string; // HSL color string e.g. "68 100% 50%"
  tasks: Task[];
}

export type TaskStatus = 'in_progress' | 'completed';
