
import { useState, useEffect } from "react";
import { Check, Edit, Plus, Tags, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock data
const initialLabelsData = [
  { id: 1, name: "CS-508", count: 12, color: "#3B82F6" },
  { id: 2, name: "UAlbany", count: 8, color: "#10B981" },
  { id: 3, name: "Personal", count: 5, color: "#6366F1" },
  { id: 4, name: "Meeting", count: 3, color: "#F59E0B" },
  { id: 5, name: "Research", count: 6, color: "#EC4899" },
  { id: 6, name: "Presentation", count: 2, color: "#8B5CF6" },
  { id: 7, name: "Planning", count: 4, color: "#EF4444" },
  { id: 8, name: "data base", count: 7, color: "#14B8A6" },
];

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

export default function Labels() {
  const [labelsData, setLabelsData] = useState(initialLabelsData);
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedLabel, setSelectedLabel] = useState<any>(null);
  const [editingLabel, setEditingLabel] = useState<any>(null);
  const [createLabelOpen, setCreateLabelOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3B82F6");
  const [tasksWithLabel, setTasksWithLabel] = useState<any[]>([]);
  
  // Update tasks with selected label when the label changes
  useEffect(() => {
    if (selectedLabel) {
      const filtered = tasks.filter((task) => 
        task.labels.includes(selectedLabel.name)
      );
      setTasksWithLabel(filtered);
    } else {
      setTasksWithLabel([]);
    }
  }, [selectedLabel, tasks]);

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) {
      toast.error("Label name cannot be empty");
      return;
    }
    
    // Check if label name already exists
    if (labelsData.some(label => label.name.toLowerCase() === newLabelName.toLowerCase())) {
      toast.error("Label name already exists");
      return;
    }
    
    // Create new label
    const newLabel = {
      id: Math.max(...labelsData.map(l => l.id), 0) + 1,
      name: newLabelName.trim(),
      color: newLabelColor,
      count: 0
    };
    
    setLabelsData([...labelsData, newLabel]);
    setCreateLabelOpen(false);
    setNewLabelName("");
    
    toast.success(`Label "${newLabelName}" created successfully`);
    
    // Select the newly created label
    setSelectedLabel(newLabel);
  };

  const handleSaveEdit = () => {
    if (!editingLabel.name.trim()) {
      toast.error("Label name cannot be empty");
      return;
    }
    
    // Check if new name already exists (excluding the current label)
    if (labelsData.some(label => 
      label.id !== editingLabel.id && 
      label.name.toLowerCase() === editingLabel.name.toLowerCase()
    )) {
      toast.error("Label name already exists");
      return;
    }
    
    // Update label
    const updatedLabels = labelsData.map(label => 
      label.id === editingLabel.id ? editingLabel : label
    );
    
    setLabelsData(updatedLabels);
    
    // If this was the selected label, update it too
    if (selectedLabel && selectedLabel.id === editingLabel.id) {
      setSelectedLabel(editingLabel);
    }
    
    setEditingLabel(null);
    toast.success(`Label renamed to "${editingLabel.name}"`);
    
    // Update tasks with this label
    const oldLabelName = labelsData.find(l => l.id === editingLabel.id)?.name;
    if (oldLabelName && oldLabelName !== editingLabel.name) {
      const updatedTasks = tasks.map(task => ({
        ...task,
        labels: task.labels.map((label: string) => 
          label === oldLabelName ? editingLabel.name : label
        )
      }));
      setTasks(updatedTasks);
    }
  };

  const handleDeleteLabel = (labelId: number) => {
    // Find the label to delete
    const labelToDelete = labelsData.find(label => label.id === labelId);
    if (!labelToDelete) return;
    
    // Remove label
    const updatedLabels = labelsData.filter(label => label.id !== labelId);
    setLabelsData(updatedLabels);
    
    // Update tasks by removing this label
    const updatedTasks = tasks.map(task => ({
      ...task,
      labels: task.labels.filter(label => label !== labelToDelete.name)
    }));
    setTasks(updatedTasks);
    
    // If this was the selected label, clear selection
    if (selectedLabel && selectedLabel.id === labelId) {
      setSelectedLabel(null);
    }
    
    toast.success(`Label "${labelToDelete.name}" deleted`);
  };

  const handleAddTask = () => {
    toast.info("Redirecting to Tasks page to add a new task");
    // This would typically navigate to the task creation form
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Labels</h1>
          <p className="text-muted-foreground">
            Organize and categorize your tasks with labels
          </p>
        </div>
        <Dialog open={createLabelOpen} onOpenChange={setCreateLabelOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Create Label
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Label</DialogTitle>
              <DialogDescription>
                Create a new label to categorize your tasks
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Label Name
                </label>
                <Input
                  id="name"
                  placeholder="Enter label name"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Label Color</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "#3B82F6", // Blue
                    "#10B981", // Green
                    "#F59E0B", // Amber
                    "#EF4444", // Red
                    "#EC4899", // Pink
                    "#8B5CF6", // Purple
                    "#6366F1", // Indigo
                    "#14B8A6", // Teal
                  ].map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "h-8 w-8 rounded-full cursor-pointer transition-transform hover:scale-110",
                        "ring-offset-2 ring-offset-background",
                        newLabelColor === color ? "ring-2" : ""
                      )}
                      style={{ 
                        backgroundColor: color,
                        boxShadow: newLabelColor === color ? `0 0 0 2px ${color}` : 'none'
                      }}
                      onClick={() => setNewLabelColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateLabelOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateLabel}>Create Label</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-4 animate-slide-in-bottom" style={{ animationDelay: "0ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">All Labels</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-13rem)] pr-4">
              <div className="space-y-2">
                {labelsData.map((label) => (
                  <div
                    key={label.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors",
                      selectedLabel?.id === label.id
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    )}
                    onClick={() => {
                      setSelectedLabel(label);
                      setEditingLabel(null);
                    }}
                  >
                    {editingLabel?.id === label.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: editingLabel.color }}
                        />
                        <Input
                          value={editingLabel.name}
                          onChange={(e) => 
                            setEditingLabel({ ...editingLabel, name: e.target.value })
                          }
                          className="h-8"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit();
                            } else if (e.key === 'Escape') {
                              setEditingLabel(null);
                            }
                          }}
                        />
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit();
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingLabel(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: label.color }}
                          />
                          <span className="font-medium">{label.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {label.count}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-50 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingLabel({...label});
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-50 hover:opacity-100 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLabel(label.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-8 animate-slide-in-bottom" style={{ animationDelay: "100ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              {selectedLabel ? (
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: selectedLabel.color }}
                  />
                  <span>{selectedLabel.name}</span>
                  <Badge variant="outline" className="ml-1">
                    {tasksWithLabel.length} tasks
                  </Badge>
                </div>
              ) : (
                "Select a label to view tasks"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedLabel ? (
              <ScrollArea className="h-[calc(100vh-13rem)] pr-4">
                {tasksWithLabel.length > 0 ? (
                  <div className="space-y-4">
                    {tasksWithLabel.map((task) => (
                      <Card key={task.id} className="overflow-hidden hover:bg-accent/5 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium mb-1">{task.title}</h3>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {task.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {task.labels
                                  .filter((label: string) => label !== selectedLabel.name)
                                  .map((label: string) => {
                                    const labelData = labelsData.find(l => l.name === label);
                                    return (
                                      <Badge
                                        key={label}
                                        variant="outline"
                                        className="bg-accent/40"
                                      >
                                        {label}
                                      </Badge>
                                    );
                                  })}
                              </div>
                            </div>
                            <Badge
                              variant={
                                task.status === "Completed"
                                  ? "default"
                                  : task.status === "In Progress"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {task.status}
                            </Badge>
                          </div>
                          
                          {task.progress > 0 && task.progress < 100 && (
                            <div className="mt-4">
                              <Progress value={task.progress} className="h-1" />
                              <div className="flex justify-end mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {task.progress}%
                                </span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Tags className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-2">No tasks with this label</p>
                    <Button variant="outline" size="sm" className="mt-2 gap-1" onClick={handleAddTask}>
                      <Plus size={14} />
                      Add Task with this Label
                    </Button>
                  </div>
                )}
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Tags className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium mb-2">No Label Selected</p>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Select a label from the list on the left to view associated tasks,
                  or create a new label to organize your tasks
                </p>
                <Button className="gap-2" onClick={() => setCreateLabelOpen(true)}>
                  <Plus size={16} />
                  Create Label
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
