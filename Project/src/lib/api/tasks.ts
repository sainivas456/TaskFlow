
import { api } from "./client";

export interface Task {
  task_id: number;
  user_id: number;
  title: string;
  description: string | null;
  due_date: string;
  priority: number;  // Changed from string to number (1-5)
  status: string;    // Will use 'Pending', 'In Progress', 'Completed', 'Overdue'
  created_at: string;
  completed_at: string | null;
  labels?: string[];
  progress?: number;
  subtasks?: {
    id: number;
    title: string;
    completed: boolean; // This is now derived from the status field in the backend
  }[];
}

export interface CreateTaskData {
  title: string;
  description?: string;
  due_date: string;
  priority: number;  // Changed from string to number
  status: string;    // Using the correct status values
  labels?: string[];
  progress?: number; // Added progress property
  subtasks?: {
    title: string;
    completed: boolean; // This will be converted to status in the backend
  }[];  
}

export const taskService = {
  // Get all tasks
  getAllTasks: async () => {
    console.log("Fetching all tasks");
    const response = await api.get<Task[]>("/tasks");
    console.log("Tasks response:", response);
    return response;
  },
  
  // Get a single task by ID
  getTaskById: async (taskId: number) => {
    console.log(`Fetching task ${taskId}`);
    const response = await api.get<Task>(`/tasks/${taskId}`);
    console.log(`Task ${taskId} response:`, response);
    return response;
  },
  
  // Create a new task
  createTask: async (taskData: CreateTaskData) => {
    console.log("Creating new task:", taskData.title);
    console.log("Task data:", JSON.stringify(taskData));
    
    // Ensure the date is formatted correctly for the database
    if (taskData.due_date && typeof taskData.due_date === 'string') {
      // Format as YYYY-MM-DD for PostgreSQL DATE type
      const dateObj = new Date(taskData.due_date);
      taskData.due_date = dateObj.toISOString().split('T')[0];
    }
    
    const response = await api.post<Task>("/tasks", taskData);
    console.log("Create task response:", response);
    return response;
  },
  
  // Update a task
  updateTask: async (taskId: number, taskData: Partial<CreateTaskData>) => {
    console.log(`Updating task ${taskId}:`, taskData);
    
    // Ensure the date is formatted correctly if it's included
    if (taskData.due_date && typeof taskData.due_date === 'string') {
      // Format as YYYY-MM-DD for PostgreSQL DATE type
      const dateObj = new Date(taskData.due_date);
      taskData.due_date = dateObj.toISOString().split('T')[0];
    }
    
    const response = await api.put<Task>(`/tasks/${taskId}`, taskData);
    console.log(`Update task ${taskId} response:`, response);
    return response;
  },
  
  // Delete a task
  deleteTask: async (taskId: number) => {
    console.log(`Deleting task ${taskId}`);
    const response = await api.delete(`/tasks/${taskId}`);
    console.log(`Delete task ${taskId} response:`, response);
    return response;
  },
  
  // Mark a task as completed
  completeTask: async (taskId: number) => {
    console.log(`Marking task ${taskId} as completed`);
    const response = await api.put<Task>(`/tasks/${taskId}/complete`, {});
    console.log(`Complete task ${taskId} response:`, response);
    return response;
  }
};
