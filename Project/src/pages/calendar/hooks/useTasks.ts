import { useState, useEffect } from "react";
import { TaskType, NewTaskInput, CalendarSyncConfig } from "../types";
import { toast } from "sonner";
import { taskService } from "@/lib/api/tasks";
import { adaptTaskFromApi, adaptTaskToApi, mapStatusToDb } from "@/lib/utils/taskUtils";

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
    progress: 0,
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
    progress: 0,
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
    progress: 0,
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
    progress: 0,
    source: "apple"
  }
];

export function useTasks(selectedDate: Date | undefined) {
  const [tasksForDate, setTasksForDate] = useState<TaskType[]>([]);
  const [syncConfigs, setSyncConfigs] = useState<CalendarSyncConfig[]>(initialSyncConfigs);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch tasks
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching tasks in useTasks hook");
      const response = await taskService.getAllTasks();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Use the adapted task data that maps from DB format to frontend format
      const fetchedTasks = response.data ? response.data.map(adaptTaskFromApi) : [];
      console.log("Fetched tasks:", fetchedTasks);
      setTasks(fetchedTasks);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError(err.message || "Failed to fetch tasks");
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);
  
  // Add task function
  const addTask = async (newTask: NewTaskInput, dueDate: Date) => {
    try {
      setIsLoading(true);
      
      // Map frontend task to database format
      const apiTask = {
        title: newTask.title,
        description: newTask.description || "",
        due_date: dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        priority: newTask.priority === "High" ? 5 : newTask.priority === "Medium" ? 3 : 1,
        status: mapStatusToDb(newTask.status), // Use the mapping function
        labels: newTask.labels || []
      };
      
      console.log("Creating new task with DB format:", apiTask);
      const response = await taskService.createTask(apiTask);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const createdTask = adaptTaskFromApi(response.data!);
      setTasks(prev => [...prev, createdTask]);
      toast.success("Task added successfully");
    } catch (err: any) {
      console.error("Failed to add task:", err);
      toast.error(`Failed to add task: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Edit task function
  const editTask = async (taskId: number, updatedTask: Partial<TaskType>) => {
    try {
      setIsLoading(true);
      
      // Map frontend task to database format
      const apiTask = adaptTaskToApi(updatedTask as TaskType);
      console.log("Updating task with DB format:", taskId, apiTask);
      const response = await taskService.updateTask(taskId, apiTask);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const editedTask = adaptTaskFromApi(response.data!);
      setTasks(prev => prev.map(task => task.id === taskId ? editedTask : task));
      toast.success("Task updated successfully");
    } catch (err: any) {
      console.error("Failed to update task:", err);
      toast.error(`Failed to update task: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete task function
  const deleteTask = async (taskId: number) => {
    try {
      const taskToDelete = tasks.find(task => task.id === taskId);
      
      if (taskToDelete?.source && taskToDelete.source !== "local") {
        toast.error(`Cannot delete task from ${taskToDelete.source} calendar. Sync is read-only in this demo.`);
        return;
      }
      
      setIsLoading(true);
      console.log("Deleting task:", taskId);
      const response = await taskService.deleteTask(taskId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete task:", err);
      toast.error(`Failed to delete task: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update task status function
  const updateTaskStatus = async (taskId: number, status: TaskType["status"]) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      
      if (taskToUpdate?.source && taskToUpdate.source !== "local") {
        toast.error(`Cannot update task from ${taskToUpdate.source} calendar. Sync is read-only in this demo.`);
        return;
      }
      
      setIsLoading(true);
      console.log("Updating task status:", taskId, status);
      
      // Map frontend status to database status format
      const dbStatus = mapStatusToDb(status);
      
      const response = await taskService.updateTask(taskId, { status: dbStatus });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const updatedTask = adaptTaskFromApi(response.data!);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      toast.success("Task status updated successfully");
    } catch (err: any) {
      console.error("Failed to update task status:", err);
      toast.error(`Failed to update task status: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
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
          
          // Add external tasks to the current task list
          setTasks(prev => [...prev.filter(task => task.source !== provider), ...externalTasks]);
          
          toast.success(`Synced with ${provider} calendar`);
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 1500); // Simulate network delay
    });
  };
  
  // Refetch tasks when needed
  const refetchTasks = () => {
    fetchTasks();
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
    error,
    refetchTasks
  };
}
