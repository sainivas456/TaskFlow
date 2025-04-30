
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
} from "@/components/ui/dropdown-menu";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Mock data
const tasks = [
  {
    id: 1,
    title: "Data base project proposal - submission",
    description: "Complete the database schema and submit proposal",
    dueDate: "2024-03-10",
    priority: "High",
    status: "In Progress",
    labels: ["CS-508", "UAlbany", "data base"],
    progress: 60,
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
  },
];

const analytics = {
  tasksByStatus: [
    { name: "Completed", value: 12 },
    { name: "In Progress", value: 8 },
    { name: "Not Started", value: 5 },
  ],
  tasksByPriority: [
    { name: "High", value: 7 },
    { name: "Medium", value: 10 },
    { name: "Low", value: 8 },
  ],
  weeklyProgress: [
    { day: "Mon", completed: 3, added: 4 },
    { day: "Tue", completed: 5, added: 2 },
    { day: "Wed", completed: 2, added: 3 },
    { day: "Thu", completed: 4, added: 1 },
    { day: "Fri", completed: 3, added: 2 },
    { day: "Sat", completed: 1, added: 0 },
    { day: "Sun", completed: 0, added: 1 },
  ],
};

// Chart colors
const COLORS = ["#3B82F6", "#6B7280", "#EF4444"];

export default function Dashboard() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    const timer = setTimeout(() => setProgress(75), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAddTask = () => {
    navigate("/tasks");
    // Delay the toast slightly to show after navigation
    setTimeout(() => {
      toast.info("Redirected to tasks page to add a new task");
    }, 100);
  };

  const handleTaskClick = (taskId: number) => {
    navigate("/tasks");
    setTimeout(() => {
      toast.info(`Viewing task details for task #${taskId}`);
    }, 100);
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="animate-slide-in-bottom" style={{ animationDelay: "0ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Completed tasks</span>
                <span className="font-medium">18/24</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="mt-6 flex justify-between items-center text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground">This week</span>
                <span className="text-2xl font-bold">75%</span>
              </div>
              <div className="text-right flex flex-col">
                <span className="text-muted-foreground">Last week</span>
                <span className="text-2xl font-bold">63%</span>
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
                  <DropdownMenuItem>All Tasks</DropdownMenuItem>
                  <DropdownMenuItem>High Priority</DropdownMenuItem>
                  <DropdownMenuItem>CS-508 Label</DropdownMenuItem>
                  <DropdownMenuItem>Personal Label</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <TabsContent value="today" className="space-y-4">
            <ScrollArea className="h-[550px] pr-4">
              {tasks.slice(0, 3).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onClick={() => handleTaskClick(task.id)}
                />
              ))}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-4">
            <ScrollArea className="h-[550px] pr-4">
              {tasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onClick={() => handleTaskClick(task.id)}
                />
              ))}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            <ScrollArea className="h-[550px] pr-4">
              {tasks.filter(task => task.status === "Completed").map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onClick={() => handleTaskClick(task.id)}
                />
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TaskCard({ task, onClick }: { task: any, onClick: () => void }) {
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
            {task.labels.map((label: string) => (
              <Badge key={label} variant="outline" className="bg-accent/40">
                {label}
              </Badge>
            ))}
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
