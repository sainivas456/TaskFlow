
import { useState, useEffect } from "react";
import { TaskType, NewTaskInput, CalendarSyncConfig } from "../types";
import { toast } from "sonner";
import { taskService } from "@/lib/api/tasks";
import { adaptTaskFromApi, adaptTaskToApi } from "@/lib/utils/taskUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Initial sync configurations
const initialSyncConfigs: CalendarSyncConfig[] = [
  { provider: "google", enabled: false },
  { provider: "outlook", enabled: false },
  { provider: "apple", enabled: false },
];

// Mock external calendar events - would be replaced with real API calls in production
const mockGoogleEvents: TaskType[] = [
  {
    id: 101,
    title: "Google Cloud Conference",
    description: "Annual cloud conference",
    dueDate: new Date(2024, 2, 18),
    priority: "Medium",
    status: "Not Started",
    labels: ["Conference", "Tech"],
    source: "google"
  },
  {
    id: 102,
    title: "Data Science Workshop",
    description: "Workshop on latest ML techniques",
    dueDate: new Date(2024, 2, 22),
    priority: "Low",
    status: "Not Started",
    labels: ["Workshop", "Learning"],
    source: "google"
  }
];

const mockOutlookEvents: TaskType[] = [
  {
    id: 201,
    title: "Client Meeting",
    description: "Quarterly review with client",
    dueDate: new Date(2024, 2, 14),
    priority: "High",
    status: "Not Started",
    labels: ["Client", "Business"],
    source: "outlook"
  }
];

const mockAppleEvents: TaskType[] = [
  {
    id: 301,
    title: "Doctor's Appointment",
    description: "Annual checkup",
    dueDate: new Date(2024, 2, 25),
    priority: "Medium",
    status: "Not Started",
    labels: ["Health", "Personal"],
    source: "apple"
  }
];

export function useTasks(selectedDate: Date | undefined) {
  const [tasksForDate, setTasksForDate] = useState<TaskType[]>([]);
  const [syncConfigs, setSyncConfigs] = useState<CalendarSyncConfig[]>(initialSyncConfigs);
  
  const queryClient = useQueryClient();
  
  // Fetch tasks from API
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await taskService.getAllTasks();
      if (response.error) {
        throw new Error(response.error);
      }
      // Convert API tasks to frontend format
      return response.data ? response.data.map(adaptTaskFromApi) : [];
    }
  });
  
  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (newTaskData: {task: NewTaskInput, dueDate: Date}) => {
      const { task, dueDate } = newTaskData;
      const apiTask = {
        title: task.title,
        description: task.description || "",
        due_date: dueDate.toISOString(),
        priority: task.priority || "Medium",
        status: task.status || "Not Started",
        labels: task.labels || []
      };
      
      const response = await taskService.createTask(apiTask);
      if (response.error) {
        throw new Error(response.error);
      }
      return adaptTaskFromApi(response.data!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add task: ${error.message}`);
    }
  });
  
  // Edit task mutation
  const editTaskMutation = useMutation({
    mutationFn: async ({taskId, updatedTask}: {taskId: number, updatedTask: Partial<TaskType>}) => {
      const apiTask = adaptTaskToApi(updatedTask as TaskType);
      const response = await taskService.updateTask(taskId, apiTask);
      if (response.error) {
        throw new Error(response.error);
      }
      return adaptTaskFromApi(response.data!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update task: ${error.message}`);
    }
  });
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await taskService.deleteTask(taskId);
      if (response.error) {
        throw new Error(response.error);
      }
      return taskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    }
  });
  
  // Update task status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({taskId, status}: {taskId: number, status: TaskType["status"]}) => {
      const response = await taskService.updateTask(taskId, { status });
      if (response.error) {
        throw new Error(response.error);
      }
      return adaptTaskFromApi(response.data!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update task status: ${error.message}`);
    }
  });
  
  // Update tasks for selected date
  useEffect(() => {
    if (!selectedDate || !tasks.length) {
      setTasksForDate([]);
      return;
    }
    
    const filteredTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === selectedDate.getDate() &&
        taskDate.getMonth() === selectedDate.getMonth() &&
        taskDate.getFullYear() === selectedDate.getFullYear()
      );
    });
    
    setTasksForDate(filteredTasks);
  }, [selectedDate, tasks]);
  
  // Add a new task
  const addTask = (newTask: NewTaskInput, dueDate: Date) => {
    addTaskMutation.mutate({ task: newTask, dueDate });
  };
  
  // Edit an existing task
  const editTask = (taskId: number, updatedTask: Partial<TaskType>) => {
    editTaskMutation.mutate({ taskId, updatedTask });
  };
  
  // Delete a task
  const deleteTask = (taskId: number) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    
    if (taskToDelete?.source && taskToDelete.source !== "local") {
      toast.error(`Cannot delete task from ${taskToDelete.source} calendar. Sync is read-only in this demo.`);
      return;
    }
    
    deleteTaskMutation.mutate(taskId);
  };
  
  // Update task status
  const updateTaskStatus = (taskId: number, status: TaskType["status"]) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    
    if (taskToUpdate?.source && taskToUpdate.source !== "local") {
      toast.error(`Cannot update task from ${taskToUpdate.source} calendar. Sync is read-only in this demo.`);
      return;
    }
    
    updateTaskStatusMutation.mutate({ taskId, status });
  };
  
  // Save sync configurations
  const saveSyncConfigs = (configs: CalendarSyncConfig[]) => {
    setSyncConfigs(configs);
    
    // Check for newly enabled calendars and sync them
    configs.forEach(config => {
      const previousConfig = syncConfigs.find(c => c.provider === config.provider);
      if (config.enabled && (!previousConfig || !previousConfig.enabled)) {
        syncCalendar(config.provider);
      }
    });
  };
  
  // Sync calendar data (mock implementation)
  const syncCalendar = async (provider: "google" | "outlook" | "apple") => {
    return new Promise<void>((resolve, reject) => {
      // Simulate API call with timeout
      setTimeout(() => {
        try {
          let externalTasks: TaskType[] = [];
          
          // Get mock events based on provider
          switch (provider) {
            case "google":
              externalTasks = mockGoogleEvents;
              break;
            case "outlook":
              externalTasks = mockOutlookEvents;
              break;
            case "apple":
              externalTasks = mockAppleEvents;
              break;
          }
          
          // Update sync config's last synced time
          const updatedConfigs = syncConfigs.map(config => 
            config.provider === provider 
              ? { ...config, lastSynced: new Date() } 
              : config
          );
          setSyncConfigs(updatedConfigs);
          
          // In a real implementation, we would send these to the backend
          // For now, we'll just show them in the UI without persisting
          queryClient.setQueryData(['tasks'], [...tasks.filter(task => task.source !== provider), ...externalTasks]);
          
          toast.success(`Synced with ${provider} calendar`);
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 1500); // Simulate network delay
    });
  };
  
  return { 
    tasks, 
    tasksForDate, 
    addTask,
    editTask,
    deleteTask,
    updateTaskStatus,
    syncConfigs,
    saveSyncConfigs,
    syncCalendar,
    isLoading,
    error
  };
}
