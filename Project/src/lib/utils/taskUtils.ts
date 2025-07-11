
import { Task } from "../api/tasks";

export interface FrontendTask {
  id: number;
  title: string;
  description?: string;
  dueDate: Date;
  priority: "High" | "Medium" | "Low";
  status: "Completed" | "In Progress" | "Not Started" | "Overdue";
  labels: string[];
  progress: number;
  subtasks?: { id: number; title: string; completed: boolean }[];
  source?: string;
}

// Map database priority (1-5) to text representation
function mapPriorityFromDb(dbPriority: number): "High" | "Medium" | "Low" {
  if (dbPriority >= 4) return "High";
  if (dbPriority >= 2) return "Medium";
  return "Low";
}

// Map text priority to database representation (1-5)
export function mapPriorityToDb(priority: string): number {
  switch (priority) {
    case "High": return 5;
    case "Medium": return 3;
    case "Low": return 1;
    default: return 3; // Default to medium
  }
}

// Map database status to frontend representation
function mapStatusFromDb(dbStatus: string): "Completed" | "In Progress" | "Not Started" | "Overdue" {
  switch (dbStatus) {
    case "Completed": return "Completed";
    case "In Progress": return "In Progress";
    case "Pending": return "Not Started"; // Map Pending from DB to Not Started in UI
    case "Overdue": return "Overdue";
    default: return "Not Started";
  }
}

// Map frontend status to database representation
export function mapStatusToDb(status: string): string {
  switch (status) {
    case "Completed": return "Completed";
    case "In Progress": return "In Progress";
    case "Not Started": return "Pending"; // Map Not Started from UI to Pending in DB
    case "Overdue": return "Overdue";
    default: return "Pending";
  }
}

export function adaptTaskFromApi(task: Task): FrontendTask {
  return {
    id: task.task_id,
    title: task.title,
    description: task.description || undefined,
    dueDate: new Date(task.due_date),
    priority: mapPriorityFromDb(task.priority),
    status: mapStatusFromDb(task.status),
    labels: task.labels || [],
    progress: task.progress || 0,
    subtasks: task.subtasks || [],
    source: "local"
  };
}

export function adaptTaskToApi(task: Partial<FrontendTask>): Partial<Task> {
  const apiTask: Partial<Task> = {};
  
  if (task.title !== undefined) apiTask.title = task.title;
  if (task.description !== undefined) apiTask.description = task.description || null;
  if (task.dueDate !== undefined) apiTask.due_date = task.dueDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  if (task.priority !== undefined) apiTask.priority = mapPriorityToDb(task.priority);
  if (task.status !== undefined) apiTask.status = mapStatusToDb(task.status);
  if (task.labels !== undefined) apiTask.labels = task.labels;
  
  return apiTask;
}
