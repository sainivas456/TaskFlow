import { useEffect, useState } from "react";
import { Calendar, ChevronDown, Clock, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { taskService, Task } from "@/lib/api/tasks";
import { labelService, Label } from "@/lib/api/labels";
import { adaptTaskFromApi } from "@/lib/utils/taskUtils";
import { FrontendTask } from "@/lib/utils/taskUtils";
import { NewTaskDialog } from "@/components/task/NewTaskDialog";

// Define a type for categories similar to what we have in useTasksState
interface Category {
  id: string;
  name: string;
  count: number;
  color: string;
  isLabel?: boolean;
}

export default function Dashboard() {
  const [progress, setProgress] = useState(0);
  const [taskFilter, setTaskFilter] = useState<string | null>(null);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  
  // Fetch tasks using React Query
  const { data: tasksData, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-tasks"],
    queryFn: async () => {
      const response = await taskService.getAllTasks();
      console.log("Fetched tasks for dashboard:", response);
      // Access the data property of the ApiResponse
      return (response.data || []).map(adaptTaskFromApi);
    },
  });

  const { data: labelsData, isLoading: isLabelsLoading } = useQuery({
    queryKey: ["dashboard-labels"],
    queryFn: async () => {
      const response = await labelService.getAllLabels();
      console.log("Fetched labels for dashboard:", response);
      return response.data || [];
    },
  });

  // Update labels state when labelsData changes
  useEffect(() => {
    if (labelsData) {
      setLabels(labelsData);
      
      // Create categories from labels
      const systemCategories = [
        { id: "all", name: "All Tasks", count: 0, color: "#9b87f5" },
        { id: "today", name: "Today", count: 0, color: "#0EA5E9" },
        { id: "upcoming", name: "Upcoming", count: 0, color: "#F97316" },
        { id: "completed", name: "Completed", count: 0, color: "#8B5CF6" },
      ];
      
      const labelCategories = labelsData.map(label => ({
        id: `label-${label.label_id}`,
        name: label.label_name,
        color: label.color_code,
        count: 0,
        isLabel: true
      }));
      
      setCategories([...systemCategories, ...labelCategories]);
    }
  }, [labelsData]);

  const tasks = tasksData || [];
  
  // Function to handle setting a selected category for filtering
  const setSelectedCategory = (category: Category) => {
    // Handle setting the selected category
    if (category.id.startsWith('label-')) {
      setTaskFilter(`${category.name} Label`);
    }
  };
  
  useEffect(() => {
    if (tasks.length > 0) {
      // Calculate overall progress based on tasks
      const completedTasks = tasks.filter(task => task.status === "Completed").length;
      const progressPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
      setProgress(progressPercentage);
    } else {
      setProgress(0);
    }
  }, [tasks]);

  // Generate analytics based on actual data
  const generateAnalytics = () => {
    // Count tasks by status
    const tasksByStatus = [
      { name: "Completed", value: tasks.filter(task => task.status === "Completed").length || 0 },
      { name: "In Progress", value: tasks.filter(task => task.status === "In Progress").length || 0 },
      { name: "Not Started", value: tasks.filter(task => task.status === "Not Started").length || 0 },
    ];

    // Count tasks by priority
    const tasksByPriority = [
      { name: "High", value: tasks.filter(task => task.priority === "High").length || 0 },
      { name: "Medium", value: tasks.filter(task => task.priority === "Medium").length || 0 },
      { name: "Low", value: tasks.filter(task => task.priority === "Low").length || 0 },
    ];

    // Create weekly activity data (simplified for now)
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyProgress = daysOfWeek.map(day => ({
      day,
      completed: Math.floor(Math.random() * 5), // Placeholder for actual tracking data
      added: Math.floor(Math.random() * 5),     // Placeholder for actual tracking data
    }));

    return {
      tasksByStatus,
      tasksByPriority,
      weeklyProgress
    };
  };

  const analytics = generateAnalytics();

  // Chart colors
  const COLORS = ["#3B82F6", "#6B7280", "#EF4444"];

  const handleAddTask = () => {
    setAddTaskOpen(true);
  };

  const handleTaskAdded = () => {
    refetch();
    toast.success("New task added successfully");
  };

  const handleTaskClick = (taskId: number) => {
    navigate("/tasks");
    setTimeout(() => {
      toast.info(`Viewing task details for task #${taskId}`);
    }, 100);
  };

  // Filter tasks based on selected filter
  const getFilteredTasks = (tabValue: string) => {
    let filteredTasks = [...tasks];
    
    // First apply tab filter
    if (tabValue === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filteredTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      });
    } else if (tabValue === "completed") {
      filteredTasks = filteredTasks.filter(task => task.status === "Completed");
    } // "upcoming" shows all tasks that aren't completed
    
    // Then apply dropdown filter if selected
    if (taskFilter) {
      if (taskFilter === "High Priority") {
        filteredTasks = filteredTasks.filter(task => task.priority === "High");
      } else if (taskFilter === "Medium Priority") {
        filteredTasks = filteredTasks.filter(task => task.priority === "Medium");
      } else if (taskFilter === "Low Priority") {
        filteredTasks = filteredTasks.filter(task => task.priority === "Low");
      } else if (taskFilter.endsWith("Label")) {
        // Extract label name from filter string (e.g., "CS-508 Label" -> "CS-508")
        const labelToFilter = taskFilter.replace(" Label", "");
        filteredTasks = filteredTasks.filter(task => 
          task.labels && task.labels.some(label => label === labelToFilter)
        );
      }
    }
    
    return filteredTasks;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your tasks, progress, and productivity
          </p>
        </div>
        <Button className="gap-2" onClick={handleAddTask}>
          <Plus size={16} />
          New Task
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-5 w-3/4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-36 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-muted-foreground">Error loading tasks. Please try again.</p>
              <Button onClick={() => refetch()} className="mt-4">Retry</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="animate-slide-in-bottom" style={{ animationDelay: "0ms" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>Completed tasks</span>
                    <span className="font-medium">
                      {tasks.filter(task => task.status === "Completed").length}/
                      {tasks.length}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <div className="mt-6 flex justify-between items-center text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">This week</span>
                    <span className="text-2xl font-bold">{progress}%</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-muted-foreground">Last week</span>
                    <span className="text-2xl font-bold">-</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-in-bottom" style={{ animationDelay: "100ms" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Task Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.tasksByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.tasksByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {analytics.tasksByStatus.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-in-bottom" style={{ animationDelay: "200ms" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Weekly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.weeklyProgress}>
                      <XAxis dataKey="day" tickLine={false} axisLine={false} />
                      <YAxis hide />
                      <Tooltip />
                      <Bar dataKey="completed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="added" fill="#6B7280" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                    <span className="text-sm">Added</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="animate-slide-in-bottom" style={{ animationDelay: "300ms" }}>
            <Tabs defaultValue="today">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => navigate("/calendar")}
                  >
                    <Calendar size={14} />
                    <span>Calendar View</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Filter size={14} />
                        <span>Filter</span>
                        <ChevronDown size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setTaskFilter(null)}>
                        All Tasks
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setTaskFilter("High Priority")}>
                        High Priority
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTaskFilter("Medium Priority")}>
                        Medium Priority
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTaskFilter("Low Priority")}>
                        Low Priority
                      </DropdownMenuItem>
                      
                      {labels.length > 0 && <DropdownMenuSeparator />}
                      {labels.map((label) => (
                        <DropdownMenuItem 
                          key={`label-${label.label_id}`} 
                          onClick={() => {
                            const labelCategory = categories.find(c => c.id === `label-${label.label_id}`);
                            if (labelCategory) setSelectedCategory(labelCategory);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: label.color_code }}
                            ></div>
                            <span>{label.label_name} Label</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <TabsContent value="today" className="space-y-4">
                <ScrollArea className="h-[550px] pr-4">
                  {getFilteredTasks("today").length > 0 ? (
                    getFilteredTasks("today").map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onClick={() => handleTaskClick(task.id)}
                      />
                    ))
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      <p>No tasks scheduled for today</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={handleAddTask}
                      >
                        Create a task
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="upcoming" className="space-y-4">
                <ScrollArea className="h-[550px] pr-4">
                  {getFilteredTasks("upcoming").length > 0 ? (
                    getFilteredTasks("upcoming").map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onClick={() => handleTaskClick(task.id)}
                      />
                    ))
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      <p>No upcoming tasks found</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={handleAddTask}
                      >
                        Create a task
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="completed" className="space-y-4">
                <ScrollArea className="h-[550px] pr-4">
                  {getFilteredTasks("completed").length > 0 ? (
                    getFilteredTasks("completed").map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onClick={() => handleTaskClick(task.id)}
                      />
                    ))
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      <p>No completed tasks yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={handleAddTask}
                      >
                        Create a task
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
      
      {/* New Task Dialog */}
      <NewTaskDialog 
        open={addTaskOpen} 
        onOpenChange={setAddTaskOpen} 
        onTaskAdded={handleTaskAdded}
      />
    </div>
  );
}

function TaskCard({ task, onClick }: { task: FrontendTask, onClick: () => void }) {
  // Query for labels to get their colors
  const { data: labelsData } = useQuery({
    queryKey: ["task-card-labels"],
    queryFn: async () => {
      const response = await labelService.getAllLabels();
      return response.data || [];
    },
  });

  return (
    <Card className="mb-4 overflow-hidden hover:shadow-md transition-shadow smooth-transition cursor-pointer" onClick={onClick}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "w-1 self-stretch",
              task.priority === "High" ? "bg-destructive" : 
              task.priority === "Medium" ? "bg-amber-500" : "bg-green-500"
            )} />
            <div className="flex-1">
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {task.description}
              </p>
            </div>
          </div>
          <Badge variant={
            task.status === "Completed" ? "default" : 
            task.status === "In Progress" ? "secondary" : "outline"
          }>
            {task.status}
          </Badge>
        </div>
        
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {task.labels && task.labels.map((label) => {
              // Find matching label to get its color
              const labelObj = labelsData?.find(l => l.label_name === String(label));
              
              return (
                <Badge 
                  key={String(label)} 
                  variant="outline" 
                  className="bg-accent/40"
                  style={labelObj ? {
                    borderColor: labelObj.color_code,
                    borderWidth: '1px'
                  } : {}}
                >
                  {String(label)}
                </Badge>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-muted-foreground text-sm">
              <Calendar size={14} className="mr-1" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Clock size={16} />
            </Button>
          </div>
        </div>
        
        {task.progress > 0 && task.progress < 100 && (
          <div className="px-4 pb-3">
            <Progress value={task.progress} className="h-1" />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-muted-foreground">{task.progress}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
