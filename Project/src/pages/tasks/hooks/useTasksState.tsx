
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { taskService } from "@/lib/api/tasks";
import { labelService, Label } from "@/lib/api/labels";

// Define a type for categories to include the color property
interface Category {
  id: string;
  name: string;
  count: number;
  color: string;
  isLabel?: boolean;
}

// System categories - these will be augmented with user labels
const systemCategories: Category[] = [
  { id: "all", name: "All Tasks", count: 0, color: "#9b87f5" },
  { id: "today", name: "Today", count: 0, color: "#0EA5E9" },
  { id: "upcoming", name: "Upcoming", count: 0, color: "#F97316" },
  { id: "completed", name: "Completed", count: 0, color: "#8B5CF6" },
];

export const useTasksState = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(systemCategories[0]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [openTaskDetail, setOpenTaskDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    priority: number | null;
    status: string | null;
  }>({
    priority: null,
    status: null
  });
  const [categories, setCategories] = useState<Category[]>(systemCategories);

  // Query for fetching tasks
  const {
    data: tasks = [],
    isLoading: isTasksLoading,
    error: tasksError,
    refetch: refetchTasks
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      console.log("Fetching tasks in useTasksState");
      const response = await taskService.getAllTasks();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    }
  });

  // Query for fetching labels
  const {
    data: labels = [],
    isLoading: isLabelsLoading,
    error: labelsError
  } = useQuery({
    queryKey: ["labels"],
    queryFn: async () => {
      console.log("Fetching labels in useTasksState");
      const response = await labelService.getAllLabels();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    }
  });

  // Combined loading state
  const isLoading = isTasksLoading || isLabelsLoading;

  // Combined error state
  const error = tasksError
    ? (tasksError as Error).message
    : labelsError
      ? (labelsError as Error).message
      : null;

  // Combine system categories with user labels
  useEffect(() => {
    if (!isLabelsLoading && labels.length > 0) {
      // Create new categories from labels, filtering out any with empty names
      const labelCategories = labels
        .filter(label => label.label_name && label.label_name.trim() !== "")
        .map(label => ({
          id: `label-${label.label_id}`,
          name: label.label_name,
          color: label.color_code,
          count: 0,
          isLabel: true
        }));
      
      // Combine system categories with label categories
      setCategories([...systemCategories, ...labelCategories]);
    } else {
      // If no labels, just use system categories
      setCategories(systemCategories);
    }
  }, [labels, isLabelsLoading]);

  // Update categories count based on tasks
  useEffect(() => {
    if (!isLoading && tasks.length >= 0) {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const updatedCats = categories.map(category => {
        let count = 0;
        
        if (category.id === "all") {
          count = tasks.length;
        } else if (category.id === "today") {
          count = tasks.filter(task => {
            const taskDate = new Date(task.due_date).toISOString().split('T')[0];
            return taskDate === today;
          }).length;
        } else if (category.id === "upcoming") {
          count = tasks.filter(task => {
            const taskDate = new Date(task.due_date);
            return taskDate > new Date() && taskDate <= nextWeek;
          }).length;
        } else if (category.id === "completed") {
          count = tasks.filter(task => task.status === "Completed").length;
        } else if (category.id.startsWith("label-")) {
          // Extract label id from the ID
          const labelId = parseInt(category.id.replace("label-", ""));
          // Fix the type comparison issue - convert both sides to number
          const label = labels.find(l => Number(l.label_id) === Number(labelId));
          
          if (label) {
            // Filter by label name
            count = tasks.filter(task => 
              task.labels && task.labels.includes(label.label_name)
            ).length;
          }
        }
        
        return { ...category, count };
      });
      
      setCategories(updatedCats);
    }
  }, [tasks, isLoading, labels, categories]);

  // Apply all filters whenever filter parameters change
  useEffect(() => {
    applyFilters();
  }, [selectedCategory, searchQuery, activeFilters, tasks, labels]);

  // Apply all filters (category, search, priority, status)
  const applyFilters = () => {
    if (isLoading || !tasks || tasks.length === 0) {
      setFilteredTasks([]);
      return;
    }
    
    let filtered = [...tasks];
    
    // Apply category filter
    if (selectedCategory.id !== "all") { // Not "All Tasks"
      if (selectedCategory.id === "today") { // Today
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.due_date).toISOString().split('T')[0];
          return taskDate === today;
        });
      } else if (selectedCategory.id === "upcoming") { // Upcoming
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.due_date);
          return taskDate > today && taskDate <= nextWeek;
        });
      } else if (selectedCategory.id === "completed") { // Completed
        filtered = filtered.filter(task => task.status === "Completed");
      } else if (selectedCategory.id.startsWith("label-")) { // Filter by label
        // Fix the type comparison issue - convert string to number properly
        const labelId = parseInt(selectedCategory.id.replace("label-", ""));
        // Explicitly convert both sides to number for comparison
        const label = labels.find(l => Number(l.label_id) === Number(labelId));
        
        if (label) {
          filtered = filtered.filter(task => 
            task.labels && task.labels.includes(label.label_name)
          );
        }
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.labels && task.labels.some((label: string) => label.toLowerCase().includes(query)))
      );
    }

    // Apply priority filter - now comparing number with number
    if (activeFilters.priority !== null) {
      filtered = filtered.filter(task => task.priority === activeFilters.priority);
    }

    // Apply status filter
    if (activeFilters.status) {
      filtered = filtered.filter(task => task.status === activeFilters.status);
    }

    setFilteredTasks(filtered);
  };

  // Handler functions
  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setOpenTaskDetail(true);
  };

  // Function to add/update task
  const handleTaskAdded = () => {
    refetchTasks();
    toast.success("Task added successfully");
  };

  // Function to update task status
  const handleUpdateTaskStatus = async (taskId: number, status: string) => {
    try {
      const response = status === "Completed" 
        ? await taskService.completeTask(taskId)
        : await taskService.updateTask(taskId, { status });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      refetchTasks();
      
      if (selectedTask && selectedTask.task_id === taskId) {
        setSelectedTask({
          ...selectedTask,
          status
        });
      }
      
      toast.success(`Task marked as ${status}`);
    } catch (err) {
      toast.error(`Failed to update task status: ${(err as Error).message}`);
    }
  };

  // Function to delete task
  const deleteTask = async (taskId: number) => {
    try {
      const response = await taskService.deleteTask(taskId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      refetchTasks();
      setOpenTaskDetail(false);
      toast.success("Task deleted successfully");
    } catch (err) {
      toast.error(`Failed to delete task: ${(err as Error).message}`);
    }
  };

  // Function to toggle subtask completion
  const toggleSubtaskCompletion = async (subtaskId: number) => {
    if (!selectedTask || !selectedTask.subtasks) return;
    
    // Create a deep copy of the selected task to modify
    const updatedTask = { ...selectedTask };
    const updatedSubtasks = [...updatedTask.subtasks];
    
    // Find the subtask and toggle its completion status
    const subtaskIndex = updatedSubtasks.findIndex(st => st.id === subtaskId);
    if (subtaskIndex !== -1) {
      updatedSubtasks[subtaskIndex] = {
        ...updatedSubtasks[subtaskIndex],
        completed: !updatedSubtasks[subtaskIndex].completed
      };
      
      // Recalculate progress based on completed subtasks
      const completedCount = updatedSubtasks.filter(st => st.completed).length;
      const progress = Math.round((completedCount / updatedSubtasks.length) * 100);
      
      try {
        // Update the task with new subtasks and progress
        const response = await taskService.updateTask(selectedTask.task_id, {
          progress // Now valid because we've updated the type
        });
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        // Update local state
        setSelectedTask({
          ...updatedTask,
          subtasks: updatedSubtasks,
          progress
        });
        
        refetchTasks();
      } catch (err) {
        toast.error(`Failed to update subtask: ${(err as Error).message}`);
      }
    }
  };

  // Function to add subtask
  const addSubtask = async (taskId: number, subtaskTitle: string) => {
    if (!subtaskTitle.trim() || !selectedTask) {
      toast.error("Subtask title cannot be empty");
      return;
    }
    
    // Create a deep copy of the selected task
    const updatedTask = { ...selectedTask };
    const updatedSubtasks = updatedTask.subtasks ? [...updatedTask.subtasks] : [];
    
    // Generate a unique ID for the new subtask
    const newSubtaskId = Date.now();
    
    // Add the new subtask
    updatedSubtasks.push({
      id: newSubtaskId,
      title: subtaskTitle,
      completed: false
    });
    
    // Recalculate progress
    const progress = updatedSubtasks.length > 0
      ? Math.round((updatedSubtasks.filter(st => st.completed).length / updatedSubtasks.length) * 100)
      : 0;
    
    try {
      // Update the task
      const response = await taskService.updateTask(taskId, {
        progress // Now valid because we've updated the type
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update local state
      setSelectedTask({
        ...updatedTask,
        subtasks: updatedSubtasks,
        progress
      });
      
      refetchTasks();
    } catch (err) {
      toast.error(`Failed to add subtask: ${(err as Error).message}`);
    }
  };

  // Function to delete subtask
  const deleteSubtask = async (taskId: number, subtaskId: number) => {
    if (!selectedTask || !selectedTask.subtasks) return;
    
    // Create a deep copy of the selected task
    const updatedTask = { ...selectedTask };
    
    // Filter out the subtask to delete
    const updatedSubtasks = updatedTask.subtasks.filter(st => st.id !== subtaskId);
    
    // Recalculate progress
    const progress = updatedSubtasks.length > 0
      ? Math.round((updatedSubtasks.filter(st => st.completed).length / updatedSubtasks.length) * 100)
      : 0;
    
    try {
      // Update the task
      const response = await taskService.updateTask(taskId, {
        progress // Now valid because we've updated the type
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update local state
      setSelectedTask({
        ...updatedTask,
        subtasks: updatedSubtasks,
        progress
      });
      
      refetchTasks();
    } catch (err) {
      toast.error(`Failed to delete subtask: ${(err as Error).message}`);
    }
  };

  // Function to add label to task
  const addLabel = async (taskId: number, labelName: string) => {
    if (!labelName.trim() || !selectedTask) return;
    
    // Add label to selected task
    const updatedLabels = selectedTask.labels ? [...selectedTask.labels] : [];
    if (!updatedLabels.includes(labelName)) {
      updatedLabels.push(labelName);
      
      try {
        // Update the task
        const response = await taskService.updateTask(taskId, {
          labels: updatedLabels
        });
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        // Update local state
        setSelectedTask({
          ...selectedTask,
          labels: updatedLabels
        });
        
        refetchTasks();
      } catch (err) {
        toast.error(`Failed to add label: ${(err as Error).message}`);
      }
    }
  };

  // Function to remove label from task
  const removeLabel = async (taskId: number, labelToRemove: string) => {
    if (!selectedTask || !selectedTask.labels) return;
    
    // Filter out the label to remove
    const updatedLabels = selectedTask.labels.filter(label => label !== labelToRemove);
    
    try {
      // Update the task
      const response = await taskService.updateTask(taskId, {
        labels: updatedLabels
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update local state
      setSelectedTask({
        ...selectedTask,
        labels: updatedLabels
      });
      
      refetchTasks();
    } catch (err) {
      toast.error(`Failed to remove label: ${(err as Error).message}`);
    }
  };

  // Function to apply a specific filter - Convert priority value to number
  const applyFilter = (filterType: 'priority' | 'status', value: string | null) => {
    setActiveFilters(prev => ({
      ...prev,
      // If it's a priority filter and value is not null, convert to number
      [filterType]: filterType === 'priority' && value !== null ? Number(value) : value
    }));
  };

  // Function to reset filters
  const resetFilters = () => {
    setActiveFilters({
      priority: null,
      status: null
    });
    setSearchQuery("");
    setSelectedCategory(categories[0]);
  };

  return {
    filteredTasks,
    labels,
    categories,
    selectedCategory,
    selectedTask,
    openTaskDetail,
    searchQuery,
    activeFilters,
    addTaskOpen,
    isLoading,
    error,
    setSelectedCategory,
    setSearchQuery,
    applyFilter,
    resetFilters,
    handleTaskClick,
    toggleSubtaskCompletion,
    addSubtask,
    deleteSubtask,
    handleTaskAdded,
    handleUpdateTaskStatus,
    deleteTask,
    addLabel,
    removeLabel,
    setOpenTaskDetail,
    setAddTaskOpen
  };
};
