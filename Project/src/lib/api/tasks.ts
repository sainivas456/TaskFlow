
import { api } from "./client";

export interface Task {
  task_id: number;
  user_id: number;
  title: string;
  description: string | null;
  due_date: string;
  priority: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  labels?: string[];
  progress?: number;
  subtasks?: any[];
}

export interface CreateTaskData {
  title: string;
  description?: string;
  due_date: string;
  priority: string;
  status: string;
}

export const taskService = {
  // Get all tasks
  getAllTasks: () => {
    return api.get<Task[]>("/tasks");
  },
  
  // Get a single task by ID
  getTaskById: (taskId: number) => {
    return api.get<Task>(`/tasks/${taskId}`);
  },
  
  // Create a new task
  createTask: (taskData: CreateTaskData) => {
    return api.post<Task>("/tasks", taskData);
  },
  
  // Update a task
  updateTask: (taskId: number, taskData: Partial<CreateTaskData>) => {
    return api.put<Task>(`/tasks/${taskId}`, taskData);
  },
  
  // Delete a task
  deleteTask: (taskId: number) => {
    return api.delete(`/tasks/${taskId}`);
  },
  
  // Mark a task as completed
  completeTask: (taskId: number) => {
    return api.put<Task>(`/tasks/${taskId}/complete`, {});
  }
};
