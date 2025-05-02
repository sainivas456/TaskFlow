
export interface TaskType {
  id: number;
  title: string;
  description?: string;
  dueDate: Date;
  priority: "High" | "Medium" | "Low";
  status: "Not Started" | "In Progress" | "Completed";
  labels: string[];
  progress: number; // Added this field to match FrontendTask
  source?: string; // Changed to allow any string to match FrontendTask
  subtasks?: { id: number; title: string; completed: boolean }[]; // Added to match FrontendTask
}

export interface NewTaskInput {
  title: string;
  description?: string;
  priority: "High" | "Medium" | "Low";
  status: "Not Started" | "In Progress" | "Completed";
  labels: string[];
  progress?: number; // Added to match FrontendTask
  source?: string; // Changed to match FrontendTask
}

export interface CalendarSyncConfig {
  provider: "google" | "outlook" | "apple";
  enabled: boolean;
  lastSynced?: Date;
  accountName?: string;
}
