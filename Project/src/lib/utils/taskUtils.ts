
import { Task } from "../api/tasks";

export interface FrontendTask {
  id: number;
  title: string;
  description?: string;
  dueDate: Date;
  priority: "High" | "Medium" | "Low";
  status: "Completed" | "In Progress" | "Not Started";
  labels: string[];
  progress: number;
  subtasks?: { id: number; title: string; completed: boolean }[];
  source?: string;
}

export function adaptTaskFromApi(task: Task): FrontendTask {
  return {
    id: task.task_id,
    title: task.title,
    description: task.description || undefined,
    dueDate: new Date(task.due_date),
    priority: (task.priority as "High" | "Medium" | "Low") || "Medium",
    status: (task.status as "Completed" | "In Progress" | "Not Started") || "Not Started",
    labels: task.labels || [],
    progress: task.progress || 0,
    subtasks: task.subtasks || [],
    source: "local"
  };
}

export function adaptTaskToApi(task: FrontendTask): Partial<Task> {
  return {
    title: task.title,
    description: task.description || null,
    due_date: task.dueDate.toISOString(),
    priority: task.priority,
    status: task.status
  };
}
