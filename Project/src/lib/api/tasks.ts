
import { api } from "./client";

export interface Task {
  task_id: number;
  user_id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority: number;
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  created_at: string;
  completed_at?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  due_date?: string;
  priority: number;
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: number;
  status?: "Pending" | "In Progress" | "Completed" | "Overdue";
}

export const taskService = {
  getTasks: () => {
    return api.get<Task[]>("/tasks");
  },
  
  getTask: (taskId: number) => {
    return api.get<Task>(`/tasks/${taskId}`);
  },
  
  createTask: (taskData: CreateTaskInput) => {
    return api.post<Task>("/tasks", taskData);
  },
  
  updateTask: (taskId: number, taskData: UpdateTaskInput) => {
    return api.put<Task>(`/tasks/${taskId}`, taskData);
  },
  
  deleteTask: (taskId: number) => {
    return api.delete(`/tasks/${taskId}`);
  },
  
  completeTask: (taskId: number) => {
    return api.put<Task>(`/tasks/${taskId}/complete`, {
      status: "Completed",
      completed_at: new Date().toISOString(),
    });
  },
  
  getTasksByStatus: (status: string) => {
    return api.get<Task[]>(`/tasks?status=${status}`);
  },
  
  getTasksForDate: (date: string) => {
    return api.get<Task[]>(`/tasks?due_date=${date}`);
  },
};
