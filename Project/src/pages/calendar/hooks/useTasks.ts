
import { useState, useEffect } from "react";
import { TaskType, NewTaskInput, CalendarSyncConfig } from "../types";
import { toast } from "sonner";

// Mock data - tasks with dates
const mockTasks: TaskType[] = [
  {
    id: 1,
    title: "Data base project proposal - submission",
    description: "Complete the database schema and submit proposal",
    dueDate: new Date(2024, 2, 10),
    priority: "High",
    status: "In Progress",
    labels: ["CS-508", "UAlbany", "data base"],
    source: "local"
  },
  {
    id: 2,
    title: "Research paper literature review",
    description: "Review 5 papers on machine learning algorithms",
    dueDate: new Date(2024, 2, 15),
    priority: "Medium",
    status: "Not Started",
    labels: ["CS-508", "UAlbany", "Research"],
    source: "local"
  },
  {
    id: 3,
    title: "Weekly team meeting notes",
    description: "Prepare notes for the upcoming team meeting",
    dueDate: new Date(2024, 2, 8),
    priority: "Low",
    status: "Completed",
    labels: ["Personal", "Meeting"],
    source: "local"
  },
  {
    id: 4,
    title: "Update project timeline",
    description: "Adjust timeline based on new requirements",
    dueDate: new Date(2024, 2, 9),
    priority: "Medium",
    status: "In Progress",
    labels: ["CS-508", "Planning"],
    source: "local"
  },
  {
    id: 5,
    title: "Prepare presentation slides",
    description: "Create slides for the midterm presentation",
    dueDate: new Date(2024, 2, 20),
    priority: "High",
    status: "Not Started",
    labels: ["CS-508", "Presentation"],
    source: "local"
  },
  {
    id: 6,
    title: "Submit research application",
    dueDate: new Date(2024, 2, 12),
    priority: "High",
    status: "Not Started",
    labels: ["Research", "UAlbany"],
    source: "local"
  },
  {
    id: 7,
    title: "Review project requirements",
    dueDate: new Date(2024, 2, 7),
    priority: "Medium",
    status: "Completed",
    labels: ["CS-508"],
    source: "local"
  },
  {
    id: 8,
    title: "Team retrospective meeting",
    dueDate: new Date(2024, 2, 17),
    priority: "Medium",
    status: "Not Started",
    labels: ["Meeting", "Team"],
    source: "local"
  },
];

// Initial sync configurations
const initialSyncConfigs: CalendarSyncConfig[] = [
  { provider: "google", enabled: false },
  { provider: "outlook", enabled: false },
  { provider: "apple", enabled: false },
];

// Mock external calendar events
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
  const [tasks, setTasks] = useState<TaskType[]>(mockTasks);
  const [tasksForDate, setTasksForDate] = useState<TaskType[]>([]);
  const [syncConfigs, setSyncConfigs] = useState<CalendarSyncConfig[]>(initialSyncConfigs);
  
  // Update tasks for selected date
  useEffect(() => {
    if (!selectedDate) {
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
    const newTaskObject = {
      id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      ...newTask,
      dueDate: dueDate,
      source: newTask.source || "local"
    };
    
    setTasks([...tasks, newTaskObject as TaskType]);
    toast.success("Task added successfully");
  };
  
  // Edit an existing task
  const editTask = (taskId: number, updatedTask: Partial<TaskType>) => {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      toast.error("Task not found");
      return;
    }
    
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...updatedTask };
    
    setTasks(updatedTasks);
    toast.success("Task updated successfully");
  };
  
  // Delete a task
  const deleteTask = (taskId: number) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    
    if (taskToDelete?.source && taskToDelete.source !== "local") {
      toast.error(`Cannot delete task from ${taskToDelete.source} calendar. Sync is read-only in this demo.`);
      return;
    }
    
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    toast.success("Task deleted successfully");
  };
  
  // Update task status
  const updateTaskStatus = (taskId: number, status: TaskType["status"]) => {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      toast.error("Task not found");
      return;
    }
    
    const taskToUpdate = tasks[taskIndex];
    if (taskToUpdate.source && taskToUpdate.source !== "local") {
      toast.error(`Cannot update task from ${taskToUpdate.source} calendar. Sync is read-only in this demo.`);
      return;
    }
    
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status };
    
    setTasks(updatedTasks);
    toast.success(`Task marked as ${status}`);
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
  
  // Sync calendar data
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
          
          // Remove existing tasks from this provider
          const filteredTasks = tasks.filter(task => task.source !== provider);
          
          // Add new tasks from provider
          setTasks([...filteredTasks, ...externalTasks]);
          
          // Update sync config's last synced time
          const updatedConfigs = syncConfigs.map(config => 
            config.provider === provider 
              ? { ...config, lastSynced: new Date() } 
              : config
          );
          setSyncConfigs(updatedConfigs);
          
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
    syncCalendar
  };
}
