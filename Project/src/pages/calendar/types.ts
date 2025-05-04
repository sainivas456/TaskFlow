
export interface TaskType {
  id: number;
  title: string;
  description?: string;
  dueDate: Date;
  priority: "High" | "Medium" | "Low";
  status: "Not Started" | "In Progress" | "Completed" | "Overdue"; // Added "Overdue" to match FrontendTask
  labels: string[];
  progress: number;
  source?: string;
  subtasks?: { id: number; title: string; completed: boolean }[];
}

export interface NewTaskInput {
  title: string;
  description?: string;
  priority: "High" | "Medium" | "Low";
  status: "Not Started" | "In Progress" | "Completed";
  labels: string[];
  progress?: number;
  source?: string;
}

export interface CalendarSyncConfig {
  provider: "google" | "outlook" | "apple";
  enabled: boolean;
  lastSynced?: Date;
  accountName?: string;
}
