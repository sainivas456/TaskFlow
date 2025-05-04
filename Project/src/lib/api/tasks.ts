
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
    console.log("Fetching all tasks");
    return api.get<Task[]>("/tasks");
  },
  
  // Get a single task by ID
  getTaskById: (taskId: number) => {
    console.log(`Fetching task ${taskId}`);
    return api.get<Task>(`/tasks/${taskId}`);
  },
  
  // Create a new task
  createTask: (taskData: CreateTaskData) => {
    console.log("Creating new task:", taskData.title);
    console.log("Task data:", JSON.stringify(taskData));
    return api.post<Task>("/tasks", taskData);
  },
  
  // Update a task
  updateTask: (taskId: number, taskData: Partial<CreateTaskData>) => {
    console.log(`Updating task ${taskId}:`, taskData);
    return api.put<Task>(`/tasks/${taskId}`, taskData);
  },
  
  // Delete a task
  deleteTask: (taskId: number) => {
    console.log(`Deleting task ${taskId}`);
    return api.delete(`/tasks/${taskId}`);
  },
  
  // Mark a task as completed
  completeTask: (taskId: number) => {
    console.log(`Marking task ${taskId} as completed`);
    return api.put<Task>(`/tasks/${taskId}/complete`, {});
  }
};
