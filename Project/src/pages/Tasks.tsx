
import { useState, useEffect } from "react";
import { 
  CalendarDays, CheckCircle2, ChevronDown, CircleDashed, 
  Clock, Edit, Filter, MoreHorizontal, Plus, Search, 
  Trash2, UserPlus, X 
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

// Updated mock data to include subtasks
const initialTasks = [
  {
    id: 1,
    title: "Data base project proposal - submission",
    description: "Complete the database schema and submit proposal",
    dueDate: "2024-03-10",
    priority: "High",
    status: "In Progress",
    labels: ["CS-508", "UAlbany", "data base"],
    progress: 60,
    subtasks: [
      { id: 101, title: "Define database schema", completed: true },
      { id: 102, title: "Create ERD diagram", completed: true },
      { id: 103, title: "Document table relationships", completed: false },
      { id: 104, title: "Add sample data", completed: false },
      { id: 105, title: "Review proposal with team", completed: false },
    ]
  },
  {
    id: 2,
    title: "Research paper literature review",
    description: "Review 5 papers on machine learning algorithms",
    dueDate: "2024-03-15",
    priority: "Medium",
    status: "Not Started",
    labels: ["CS-508", "UAlbany", "Research"],
    progress: 0,
    subtasks: []
  },
  {
    id: 3,
    title: "Weekly team meeting notes",
    description: "Prepare notes for the upcoming team meeting",
    dueDate: "2024-03-08",
    priority: "Low",
    status: "Completed",
    labels: ["Personal", "Meeting"],
    progress: 100,
    subtasks: [
      { id: 301, title: "Draft agenda", completed: true },
      { id: 302, title: "Share agenda with team", completed: true },
      { id: 303, title: "Take minutes during meeting", completed: true },
    ]
  },
  {
    id: 4,
    title: "Update project timeline",
    description: "Adjust timeline based on new requirements",
    dueDate: "2024-03-09",
    priority: "Medium",
    status: "In Progress",
    labels: ["CS-508", "Planning"],
    progress: 40,
    subtasks: [
      { id: 401, title: "Review current timeline", completed: true },
      { id: 402, title: "Identify affected milestones", completed: false },
      { id: 403, title: "Update Gantt chart", completed: false },
    ]
  },
  {
    id: 5,
    title: "Prepare presentation slides",
    description: "Create slides for the midterm presentation",
    dueDate: "2024-03-20",
    priority: "High",
    status: "Not Started",
    labels: ["CS-508", "Presentation"],
    progress: 0,
    subtasks: []
  },
];

const categories = [
  { id: 1, name: "All Tasks", count: 25 },
  { id: 2, name: "Today", count: 5 },
  { id: 3, name: "Upcoming", count: 10 },
  { id: 4, name: "Completed", count: 8 },
  { id: 5, name: "CS-508", count: 12 },
  { id: 6, name: "UAlbany", count: 8 },
  { id: 7, name: "Personal", count: 5 },
  { id: 8, name: "Shared", count: 3 },
];

export default function Tasks() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [filteredTasks, setFilteredTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [openTaskDetail, setOpenTaskDetail] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addTaskOpen, setAddTaskOpen] = useState(false);
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

  // Filter tasks based on selected category and search query
  useEffect(() => {
    let filtered = [...initialTasks];

    // Apply category filter
    if (selectedCategory.id !== 1) { // Not "All Tasks"
      if (selectedCategory.id === 2) { // Today
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
          return taskDate === today;
        });
      } else if (selectedCategory.id === 3) { // Upcoming
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.dueDate);
          return taskDate > today && taskDate <= nextWeek;
        });
      } else if (selectedCategory.id === 4) { // Completed
        filtered = filtered.filter(task => task.status === "Completed");
      } else { // Filter by category name (label)
        filtered = filtered.filter(task => 
          task.labels.includes(selectedCategory.name)
        );
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query) ||
        task.labels.some(label => label.toLowerCase().includes(query))
      );
    }

    setFilteredTasks(filtered);
  }, [selectedCategory, searchQuery]);

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setOpenTaskDetail(true);
  };

  const toggleSubtaskCompletion = (subtaskId: number) => {
    // Create a deep copy of the selected task to modify
    const updatedTask = JSON.parse(JSON.stringify(selectedTask));
    
    // Find the subtask and toggle its completion status
    const subtask = updatedTask.subtasks.find((st: any) => st.id === subtaskId);
    if (subtask) {
      subtask.completed = !subtask.completed;
      
      // Recalculate progress based on completed subtasks
      if (updatedTask.subtasks.length > 0) {
        const completedCount = updatedTask.subtasks.filter((st: any) => st.completed).length;
        updatedTask.progress = Math.round((completedCount / updatedTask.subtasks.length) * 100);
      }
      
      // Update selectedTask
      setSelectedTask(updatedTask);
      
      // Also update the task in the filteredTasks array
      const updatedTasks = filteredTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      setFilteredTasks(updatedTasks);
      
      // Show success message
      toast.success(`Subtask ${subtask.completed ? 'completed' : 'marked as incomplete'}`);
    }
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) {
      toast.error("Subtask title cannot be empty");
      return;
    }
    
    // Create a deep copy of the selected task
    const updatedTask = JSON.parse(JSON.stringify(selectedTask));
    
    // Generate a unique ID for the new subtask
    const newSubtaskId = Date.now();
    
    // Add the new subtask
    updatedTask.subtasks.push({
      id: newSubtaskId,
      title: newSubtask,
      completed: false
    });
    
    // Recalculate progress
    if (updatedTask.subtasks.length > 0) {
      const completedCount = updatedTask.subtasks.filter((st: any) => st.completed).length;
      updatedTask.progress = Math.round((completedCount / updatedTask.subtasks.length) * 100);
    }
    
    // Update state
    setSelectedTask(updatedTask);
    setNewSubtask("");
    
    // Update the task in the filteredTasks array
    const updatedTasks = filteredTasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    setFilteredTasks(updatedTasks);
    
    // Show success message
    toast.success("Subtask added successfully");
  };

  const deleteSubtask = (subtaskId: number) => {
    // Create a deep copy of the selected task
    const updatedTask = JSON.parse(JSON.stringify(selectedTask));
    
    // Filter out the subtask to delete
    updatedTask.subtasks = updatedTask.subtasks.filter((st: any) => st.id !== subtaskId);
    
    // Recalculate progress
    if (updatedTask.subtasks.length > 0) {
      const completedCount = updatedTask.subtasks.filter((st: any) => st.completed).length;
      updatedTask.progress = Math.round((completedCount / updatedTask.subtasks.length) * 100);
    } else {
      updatedTask.progress = 0;
    }
    
    // Update state
    setSelectedTask(updatedTask);
    
    // Update the task in the filteredTasks array
    const updatedTasks = filteredTasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    setFilteredTasks(updatedTasks);
    
    // Show success message
    toast.success("Subtask deleted");
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!newTask.dueDate) {
      toast.error("Due date is required");
      return;
    }

    // Generate a new task ID
    const newId = Math.max(...filteredTasks.map(task => task.id), 0) + 1;
    
    // Create the new task
    const taskToAdd = {
      ...newTask,
      id: newId,
      progress: 0
    };

    // Add to tasks list
    setFilteredTasks([taskToAdd, ...filteredTasks]);
    
    // Reset form and close dialog
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
    
    toast.success("Task added successfully");
  };

  const handleDeleteTask = (taskId: number) => {
    // Filter out the task to delete
    const updatedTasks = filteredTasks.filter(task => task.id !== taskId);
    setFilteredTasks(updatedTasks);
    
    // Close dialog if open
    setOpenTaskDetail(false);
    
    toast.success("Task deleted successfully");
  };

  const handleUpdateTaskStatus = (taskId: number, status: string) => {
    // Update task status
    const updatedTasks = filteredTasks.map(task => 
      task.id === taskId 
        ? { ...task, status } 
        : task
    );
    setFilteredTasks(updatedTasks);
    
    // If selected task is open, update it too
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, status });
    }
    
    toast.success(`Task marked as ${status}`);
  };

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;
    
    if (selectedTask) {
      // Add label to selected task
      const updatedTask = { ...selectedTask };
      if (!updatedTask.labels.includes(newLabel)) {
        updatedTask.labels.push(newLabel);
        
        // Update state
        setSelectedTask(updatedTask);
        
        // Update in filtered tasks
        const updatedTasks = filteredTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        );
        setFilteredTasks(updatedTasks);
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
    // Remove label from task
    const updatedTasks = filteredTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          labels: task.labels.filter(label => label !== labelToRemove)
        };
      }
      return task;
    });
    
    setFilteredTasks(updatedTasks);
    
    // If selected task is open, update it too
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({
        ...selectedTask,
        labels: selectedTask.labels.filter((label: string) => label !== labelToRemove)
      });
    }
  };

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
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category)}
                    >
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter size={14} />
                  <span>Filter</span>
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setSelectedCategory(categories[0])}>
                  All Tasks
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  const filtered = initialTasks.filter(task => task.priority === "High");
                  setFilteredTasks(filtered);
                }}>
                  Priority: High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const filtered = initialTasks.filter(task => task.priority === "Medium");
                  setFilteredTasks(filtered);
                }}>
                  Priority: Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const filtered = initialTasks.filter(task => task.priority === "Low");
                  setFilteredTasks(filtered);
                }}>
                  Priority: Low
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedCategory(categories[3])}>
                  Status: Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const filtered = initialTasks.filter(task => task.status === "In Progress");
                  setFilteredTasks(filtered);
                }}>
                  Status: In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const filtered = initialTasks.filter(task => task.status === "Not Started");
                  setFilteredTasks(filtered);
                }}>
                  Status: Not Started
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ScrollArea className="h-[calc(100vh-13rem)] pr-4">
            <div className="space-y-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <Card
                    key={task.id}
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
                              {task.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {task.labels.map((label: string) => (
                                <Badge key={label} variant="outline" className="bg-accent/40">
                                  {label}
                                </Badge>
                              ))}
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
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
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
                    {searchQuery ? 
                      "No tasks match your search criteria. Try a different search term." : 
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
                        <DropdownMenuItem onClick={() => {
                          setNewSubtask("");
                          document.getElementById("new-subtask-input")?.focus();
                        }}>
                          Add subtask
                        </DropdownMenuItem>
                        <DropdownMenuItem>Add attachment</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteTask(selectedTask.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete task</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <DialogDescription className="mt-2">
                  <Badge
                    variant={
                      selectedTask.status === "Completed"
                        ? "default"
                        : selectedTask.status === "In Progress"
                        ? "secondary"
                        : "outline"
                    }
                    className="mr-2 cursor-pointer"
                    onClick={() => {
                      // Cycle through statuses
                      let newStatus;
                      if (selectedTask.status === "Not Started") {
                        newStatus = "In Progress";
                      } else if (selectedTask.status === "In Progress") {
                        newStatus = "Completed";
                      } else {
                        newStatus = "Not Started";
                      }
                      handleUpdateTaskStatus(selectedTask.id, newStatus);
                    }}
                  >
                    {selectedTask.status}
                  </Badge>
                  <Badge
                    variant={
                      selectedTask.priority === "High"
                        ? "destructive"
                        : selectedTask.priority === "Medium"
                        ? "outline"
                        : "secondary"
                    }
                  >
                    {selectedTask.priority}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTask.description || "No description provided."}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Due Date</h4>
                  <div className="flex items-center text-sm">
                    <CalendarDays size={16} className="mr-2 text-muted-foreground" />
                    <span>{new Date(selectedTask.dueDate).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Labels</h4>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Add new label"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddLabel();
                          }
                        }}
                      />
                      <Button size="sm" onClick={handleAddLabel}>Add</Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedTask.labels.map((label: string) => (
                      <Badge key={label} variant="outline" className="bg-accent/40 group">
                        {label}
                        <button 
                          className="ml-1 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLabel(selectedTask.id, label);
                          }}
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Subtasks Section */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Subtasks</h4>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <Input
                      id="new-subtask-input"
                      placeholder="Add a subtask"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      className="text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addSubtask();
                        }
                      }}
                    />
                    <Button size="sm" onClick={addSubtask}>Add</Button>
                  </div>
                  
                  {selectedTask.subtasks && selectedTask.subtasks.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {selectedTask.subtasks.map((subtask: any) => (
                        <div key={subtask.id} className="flex items-center justify-between gap-2 group">
                          <div className="flex items-start gap-2 flex-1">
                            <Checkbox 
                              id={`subtask-${subtask.id}`} 
                              checked={subtask.completed}
                              onCheckedChange={() => toggleSubtaskCompletion(subtask.id)}
                              className="mt-0.5"
                            />
                            <label 
                              htmlFor={`subtask-${subtask.id}`}
                              className={cn(
                                "text-sm cursor-pointer", 
                                subtask.completed && "line-through text-muted-foreground"
                              )}
                            >
                              {subtask.title}
                            </label>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSubtask(subtask.id);
                            }}
                          >
                            <Trash2 size={14} className="text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground mb-2">
                      No subtasks yet. Add some subtasks to track your progress.
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setOpenTaskDetail(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task and add it to your list.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input 
                id="title"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea 
                id="description"
                placeholder="Task description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="dueDate" className="text-sm font-medium">Due Date</label>
              <Input 
                id="dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                <select 
                  id="priority"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select 
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newTask.status}
                  onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Labels</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newTask.labels.map((label, index) => (
                  <Badge key={index} variant="outline" className="bg-accent/40 group">
                    {label}
                    <button 
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setNewTask({
                          ...newTask,
                          labels: newTask.labels.filter((_, i) => i !== index)
                        });
                      }}
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Add label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddLabel();
                    }
                  }}
                />
                <Button size="sm" onClick={handleAddLabel}>Add</Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTaskOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ClipboardIcon component for the empty state
function ClipboardIcon({ size = 24 }) {
  return (
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
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    </svg>
  );
}
