
import { useState, useEffect } from "react";
import { 
  CalendarDays, CheckCircle2, ChevronDown, CircleDashed, 
  Clock, Edit, Filter, MoreHorizontal, Plus, Search, 
  Trash2, UserPlus, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { taskService } from "@/lib/api/tasks";
import { labelService, Label } from "@/lib/api/labels";
import { NewTaskDialog } from "@/components/task/NewTaskDialog";

// Helper component for empty state
const ClipboardIcon = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

// Define a type for categories to include the color property
interface Category {
  id: string;
  name: string;
  count: number;
  color?: string;
  isLabel?: boolean;
}

// System categories - these will be augmented with user labels
const systemCategories: Category[] = [
  { id: "all", name: "All Tasks", count: 0, color: "#9b87f5" },
  { id: "today", name: "Today", count: 0, color: "#0EA5E9" },
  { id: "upcoming", name: "Upcoming", count: 0, color: "#F97316" },
  { id: "completed", name: "Completed", count: 0, color: "#8B5CF6" },
];

export default function Tasks() {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<Category>(systemCategories[0]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [openTaskDetail, setOpenTaskDetail] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    priority: null as string | null,
    status: null as string | null
  });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    status: "Not Started",
    labels: [] as string[],
    progress: 0,
    subtasks: [] as { id: number; title: string; completed: boolean }[]
  });
  const [newLabel, setNewLabel] = useState("");
  const [categories, setCategories] = useState<Category[]>(systemCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [isLabelsLoading, setIsLabelsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching all tasks in Tasks component");
      const response = await taskService.getAllTasks();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log("Tasks fetched successfully:", response.data);
      setTasks(response.data || []);
    } catch (err: any) {
      console.error("Failed to fetch tasks:", err);
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch labels
  const fetchLabels = async () => {
    try {
      setIsLabelsLoading(true);
      console.log("Fetching all labels in Tasks component");
      const response = await labelService.getAllLabels();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log("Labels fetched successfully:", response.data);
      setLabels(response.data || []);
    } catch (err: any) {
      console.error("Failed to fetch labels:", err);
      toast.error(`Failed to fetch labels: ${err.message}`);
    } finally {
      setIsLabelsLoading(false);
    }
  };

  // Combine system categories with user labels
  useEffect(() => {
    if (!isLabelsLoading && labels.length > 0) {
      // Create new categories from labels
      const labelCategories = labels.map(label => ({
        id: `label-${label.label_id}`,
        name: label.name,
        color: label.color,
        count: 0,
        isLabel: true
      }));
      
      // Combine system categories with label categories
      setCategories([...systemCategories, ...labelCategories]);
    }
  }, [labels, isLabelsLoading]);

  // Fetch tasks and labels on component mount
  useEffect(() => {
    fetchTasks();
    fetchLabels();
  }, []);

  // Add task
  const addTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!newTask.dueDate) {
      toast.error("Due date is required");
      return;
    }

    try {
      setIsLoading(true);
      
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        due_date: newTask.dueDate,
        priority: mapPriorityToDb(newTask.priority), // Convert string priority to number
        status: newTask.status === "Not Started" ? "Pending" : newTask.status,
        labels: newTask.labels
      };
      
      console.log("Creating new task:", taskData);
      const response = await taskService.createTask(taskData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log("Task created successfully:", response.data);
      setTasks(prev => [...prev, response.data]);
      toast.success("Task added successfully");
      
      // Reset form
      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        status: "Not Started",
        labels: [],
        progress: 0,
        subtasks: []
      });
      
      setAddTaskOpen(false);
    } catch (err: any) {
      console.error("Failed to add task:", err);
      toast.error(`Failed to add task: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Update task
  const updateTask = async (taskId: number, updatedData: any) => {
    try {
      setIsLoading(true);
      console.log(`Updating task ${taskId}:`, updatedData);
      const response = await taskService.updateTask(taskId, updatedData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log("Task updated successfully:", response.data);
      setTasks(prev => prev.map(task => task.task_id === taskId ? response.data : task));
      
      // Update selected task if open
      if (selectedTask && selectedTask.task_id === taskId) {
        setSelectedTask(response.data);
      }
      
      toast.success("Task updated successfully");
    } catch (err: any) {
      console.error("Failed to update task:", err);
      toast.error(`Failed to update task: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete task
  const deleteTask = async (taskId: number) => {
    try {
      setIsLoading(true);
      console.log(`Deleting task ${taskId}`);
      const response = await taskService.deleteTask(taskId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log("Task deleted successfully");
      setTasks(prev => prev.filter(task => task.task_id !== taskId));
      setOpenTaskDetail(false);
      toast.success("Task deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete task:", err);
      toast.error(`Failed to delete task: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Complete task
  const completeTask = async (taskId: number) => {
    try {
      setIsLoading(true);
      console.log(`Marking task ${taskId} as completed`);
      const response = await taskService.completeTask(taskId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log("Task completed successfully:", response.data);
      setTasks(prev => prev.map(task => task.task_id === taskId ? response.data : task));
      
      // Update selected task if open
      if (selectedTask && selectedTask.task_id === taskId) {
        setSelectedTask(response.data);
      }
      
      toast.success("Task marked as completed");
    } catch (err: any) {
      console.error("Failed to complete task:", err);
      toast.error(`Failed to complete task: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle task creation success
  const handleTaskAdded = () => {
    console.log("Task added callback triggered");
    // Refresh the task list
    fetchTasks();
    toast.success("Task created successfully");
  };

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
          // Extract label name from the ID
          const labelId = parseInt(category.id.replace("label-", ""));
          const label = labels.find(l => l.label_id === labelId);
          
          if (label) {
            // Filter by label name
            count = tasks.filter(task => 
              task.labels && task.labels.includes(label.name)
            ).length;
          }
        }
        
        return { ...category, count };
      });
      
      setCategories(updatedCats);
    }
  }, [tasks, isLoading, labels]);

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
        const labelId = parseInt(selectedCategory.id.replace("label-", ""));
        const label = labels.find(l => l.label_id === labelId);
        
        if (label) {
          filtered = filtered.filter(task => 
            task.labels && task.labels.includes(label.name)
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

    // Apply priority filter
    if (activeFilters.priority) {
      filtered = filtered.filter(task => task.priority === activeFilters.priority);
    }

    // Apply status filter
    if (activeFilters.status) {
      filtered = filtered.filter(task => task.status === activeFilters.status);
    }

    setFilteredTasks(filtered);
  };

  // Apply a specific filter
  const applyFilter = (filterType: 'priority' | 'status', value: string | null) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setOpenTaskDetail(true);
  };

  const toggleSubtaskCompletion = (subtaskId: number) => {
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
      
      // Update the task with new subtasks and progress
      updateTask(selectedTask.task_id, {
        subtasks: updatedSubtasks,
        progress
      });
      
      // Update local state
      setSelectedTask({
        ...updatedTask,
        subtasks: updatedSubtasks,
        progress
      });
    }
  };

  const addSubtask = () => {
    if (!newSubtask.trim() || !selectedTask) {
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
      title: newSubtask,
      completed: false
    });
    
    // Recalculate progress
    const progress = updatedSubtasks.length > 0
      ? Math.round((updatedSubtasks.filter(st => st.completed).length / updatedSubtasks.length) * 100)
      : 0;
    
    // Update the task
    updateTask(selectedTask.task_id, {
      subtasks: updatedSubtasks
    });
    
    // Update local state
    setSelectedTask({
      ...updatedTask,
      subtasks: updatedSubtasks,
      progress
    });
    setNewSubtask("");
  };

  const deleteSubtask = (subtaskId: number) => {
    if (!selectedTask || !selectedTask.subtasks) return;
    
    // Create a deep copy of the selected task
    const updatedTask = { ...selectedTask };
    
    // Filter out the subtask to delete
    const updatedSubtasks = updatedTask.subtasks.filter(st => st.id !== subtaskId);
    
    // Recalculate progress
    const progress = updatedSubtasks.length > 0
      ? Math.round((updatedSubtasks.filter(st => st.completed).length / updatedSubtasks.length) * 100)
      : 0;
    
    // Update the task
    updateTask(selectedTask.task_id, {
      subtasks: updatedSubtasks
    });
    
    // Update local state
    setSelectedTask({
      ...updatedTask,
      subtasks: updatedSubtasks,
      progress
    });
  };

  // Function to handle adding task
  const handleAddTask = () => {
    addTask();
  };

  // Function to handle deleting task
  const handleDeleteTask = (taskId: number) => {
    deleteTask(taskId);
  };

  // Function to update task status
  const handleUpdateTaskStatus = (taskId: number, status: string) => {
    if (status === "Completed") {
      completeTask(taskId);
    } else {
      updateTask(taskId, { status });
    }
  };

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;
    
    if (selectedTask) {
      // Add label to selected task
      const updatedLabels = selectedTask.labels ? [...selectedTask.labels] : [];
      if (!updatedLabels.includes(newLabel)) {
        updatedLabels.push(newLabel);
        
        // Update the task
        updateTask(selectedTask.task_id, {
          labels: updatedLabels
        });
        
        // Update local state
        setSelectedTask({
          ...selectedTask,
          labels: updatedLabels
        });
      }
    } else if (newTask.title) {
      // Add label to new task being created
      if (!newTask.labels.includes(newLabel)) {
        setNewTask({
          ...newTask,
          labels: [...newTask.labels, newLabel]
        });
      }
    }
    
    setNewLabel("");
  };

  const removeLabel = (taskId: number, labelToRemove: string) => {
    if (!selectedTask) return;
    
    // Filter out the label to remove
    const updatedLabels = selectedTask.labels.filter(label => label !== labelToRemove);
    
    // Update the task
    updateTask(taskId, {
      labels: updatedLabels
    });
    
    // Update local state
    setSelectedTask({
      ...selectedTask,
      labels: updatedLabels
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setActiveFilters({
      priority: null,
      status: null
    });
    setSearchQuery("");
    setSelectedCategory(categories[0]);
  };

  // Helper function to map priority from text to number value
  const mapPriorityToDb = (priority: string): number => {
    switch (priority) {
      case "High": return 5;
      case "Medium": return 3;
      case "Low": return 1;
      default: return 3; // Default to medium
    }
  };
  
  // Loading state
  if ((isLoading && tasks.length === 0) || isLabelsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">{isLabelsLoading ? "Loading labels..." : "Loading tasks..."}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="bg-destructive/10 p-4 rounded-full mb-4">
            <X className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Failed to load tasks</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchTasks}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and organize your tasks
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddTaskOpen(true)}>
          <Plus size={16} />
          Add Task
        </Button>
      </div>

      <div className="flex gap-6">
        <Card className="w-64 shrink-0 animate-slide-in-bottom" style={{ animationDelay: "0ms" }}>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="font-medium">Categories</div>
              <ScrollArea className="h-[calc(100vh-14rem)]">
                <div className="space-y-1 pr-3">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory.id === category.id ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        category.color && "overflow-hidden relative"
                      )}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category.color && (
                        <div 
                          className="w-1 absolute left-0 top-0 bottom-0" 
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {category.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 space-y-5 animate-slide-in-bottom" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-10 w-full bg-muted/50 border-none focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {(activeFilters.priority || activeFilters.status || selectedCategory.id !== "all") && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters} 
                className="gap-1"
              >
                <X size={14} />
                Clear filters
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter size={14} />
                  <span>Filter</span>
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => resetFilters()}>
                  All Tasks
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => applyFilter('priority', 'High')}
                  className={activeFilters.priority === 'High' ? 'bg-accent' : ''}
                >
                  Priority: High
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => applyFilter('priority', 'Medium')}
                  className={activeFilters.priority === 'Medium' ? 'bg-accent' : ''}
                >
                  Priority: Medium
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => applyFilter('priority', 'Low')}
                  className={activeFilters.priority === 'Low' ? 'bg-accent' : ''}
                >
                  Priority: Low
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => applyFilter('status', 'Completed')}
                  className={activeFilters.status === 'Completed' ? 'bg-accent' : ''}
                >
                  Status: Completed
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => applyFilter('status', 'In Progress')}
                  className={activeFilters.status === 'In Progress' ? 'bg-accent' : ''}
                >
                  Status: In Progress
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => applyFilter('status', 'Not Started')}
                  className={activeFilters.status === 'Not Started' ? 'bg-accent' : ''}
                >
                  Status: Not Started
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {labels.map((label) => (
                  <DropdownMenuItem
                    key={`label-filter-${label.label_id}`}
                    onClick={() => {
                      const labelCategory = categories.find(c => c.id === `label-${label.label_id}`);
                      if (labelCategory) setSelectedCategory(labelCategory);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: label.color }}
                      ></div>
                      <span>Label: {label.name}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ScrollArea className="h-[calc(100vh-13rem)] pr-4">
            <div className="space-y-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <Card
                    key={task.task_id}
                    className="cursor-pointer hover:shadow-md transition-shadow smooth-transition"
                    onClick={() => handleTaskClick(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div>
                            {task.status === "Completed" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : task.status === "In Progress" ? (
                              <CircleDashed className="h-5 w-5 text-amber-500" />
                            ) : (
                              <CircleDashed className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium line-clamp-1">{task.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {task.description || "No description"}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {task.labels && task.labels.map((labelName: string) => {
                                // Find matching label to get its color
                                const label = labels.find(l => l.name === labelName);
                                
                                return (
                                  <Badge 
                                    key={labelName} 
                                    variant="outline" 
                                    className="bg-accent/40"
                                    style={label ? {
                                      borderColor: label.color,
                                      borderWidth: '1px'
                                    } : {}}
                                  >
                                    {labelName}
                                  </Badge>
                                );
                              })}
                            </div>
                            {task.progress > 0 && task.progress < 100 && (
                              <div className="mt-3">
                                <Progress value={task.progress} className="h-1" />
                                <div className="flex justify-end mt-1">
                                  <span className="text-xs text-muted-foreground">{task.progress}%</span>
                                </div>
                              </div>
                            )}
                            {/* Display subtasks count if any */}
                            {task.subtasks && task.subtasks.length > 0 && (
                              <div className="mt-2 text-sm text-muted-foreground flex items-center">
                                <CheckCircle2 size={14} className="mr-1" />
                                <span>
                                  {task.subtasks.filter((st: any) => st.completed).length} / {task.subtasks.length} subtasks
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant={
                              task.priority === "High"
                                ? "destructive"
                                : task.priority === "Medium"
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {task.priority}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-auto flex items-center">
                            <CalendarDays size={14} className="mr-1" />
                            <span>{new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-muted-foreground/60 mb-4">
                    <ClipboardIcon size={48} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    {searchQuery || activeFilters.priority || activeFilters.status || selectedCategory.id !== "all" ? 
                      "No tasks match your filter criteria. Try adjusting your filters." : 
                      "No tasks in this category. Add a task to get started."}
                  </p>
                  <Button className="gap-2" onClick={() => setAddTaskOpen(true)}>
                    <Plus size={16} />
                    Add Task
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={openTaskDetail} onOpenChange={setOpenTaskDetail}>
        <DialogContent className="sm:max-w-3xl">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Edit size={16} />
                    </Button>
                    <Button variant="outline" size="icon">
                      <UserPlus size={16} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => deleteTask(selectedTask.task_id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateTaskStatus(selectedTask.task_id, selectedTask.status === 'Completed' ? 'Not Started' : 'Completed')}>
                          {selectedTask.status === 'Completed' ? (
                            <>
                              <CircleDashed className="h-4 w-4 mr-2" />
                              <span>Mark as Not Started</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              <span>Mark as Completed</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {selectedTask.labels && selectedTask.labels.map((labelName: string) => {
                    const label = labels.find(l => l.name === labelName);
                    return (
                      <Badge 
                        key={labelName} 
                        variant="outline" 
                        className="bg-accent/40 flex items-center gap-2 px-3 py-1"
                        style={label ? {
                          borderColor: label.color,
                          borderWidth: '1px'
                        } : {}}
                      >
                        <span>{labelName}</span>
                        <X 
                          size={14} 
                          className="cursor-pointer ml-1" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLabel(selectedTask.task_id, labelName);
                          }}
                        />
                      </Badge>
                    );
                  })}
                  
                  <div className="flex items-center">
                    <Input 
                      className="h-8 w-32"
                      placeholder="Add label..."
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2" 
                      onClick={handleAddLabel}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Description</h4>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    {selectedTask.description || "No description provided."}
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Subtasks</h4>
                    <span className="text-xs text-muted-foreground">
                      {selectedTask.subtasks ? 
                        `${selectedTask.subtasks.filter((st: any) => st.completed).length} of ${selectedTask.subtasks.length} completed` : 
                        '0 of 0 completed'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedTask.subtasks && selectedTask.subtasks.map((subtask: any) => (
                      <div key={subtask.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                        <div className="flex items-center">
                          <Checkbox 
                            checked={subtask.completed}
                            onCheckedChange={() => toggleSubtaskCompletion(subtask.id)}
                            className="mr-2"
                          />
                          <span className={subtask.completed ? "line-through text-muted-foreground" : ""}>
                            {subtask.title}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteSubtask(subtask.id)} 
                          className="opacity-50 hover:opacity-100"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="flex items-center">
                      <Input
                        placeholder="Add a subtask..."
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                        className="mr-2"
                      />
                      <Button onClick={addSubtask}>Add</Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Due Date</h4>
                    <div className="flex items-center text-sm bg-muted/50 p-2 rounded-md">
                      <CalendarDays size={16} className="mr-2 text-muted-foreground" />
                      {new Date(selectedTask.due_date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Priority</h4>
                    <div className="flex items-center">
                      <Badge
                        variant={
                          selectedTask.priority === "High"
                            ? "destructive"
                            : selectedTask.priority === "Medium"
                            ? "outline"
                            : "secondary"
                        }
                        className="flex-1 justify-center py-1"
                      >
                        {selectedTask.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {selectedTask.progress > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Progress</h4>
                    <div className="space-y-1">
                      <Progress value={selectedTask.progress} className="h-2" />
                      <div className="flex justify-end">
                        <span className="text-xs text-muted-foreground">{selectedTask.progress}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock size={14} className="mr-1" />
                  <span>Created on {new Date(selectedTask.created_at).toLocaleDateString()}</span>
                </div>
                <Button onClick={() => setOpenTaskDetail(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <NewTaskDialog 
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
        onTaskAdded={handleTaskAdded}
      />
    </div>
  );
}
