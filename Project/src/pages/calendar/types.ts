
export interface TaskType {
  id: number;
  title: string;
  description?: string;
  dueDate: Date;
  priority: "High" | "Medium" | "Low";
  status: "Not Started" | "In Progress" | "Completed";
  labels: string[];
  source?: "local" | "google" | "outlook" | "apple"; // Added source field
}

export interface NewTaskInput {
  title: string;
  description?: string;
  priority: "High" | "Medium" | "Low";
  status: "Not Started" | "In Progress" | "Completed";
  labels: string[];
  source?: "local" | "google" | "outlook" | "apple";
}

export interface CalendarSyncConfig {
  provider: "google" | "outlook" | "apple";
  enabled: boolean;
  lastSynced?: Date;
  accountName?: string;
}
