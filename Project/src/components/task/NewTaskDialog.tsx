
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";
import { taskService } from "@/lib/api/tasks";
import { mapPriorityToDb, mapStatusToDb } from "@/lib/utils/taskUtils";

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded?: () => void;
}

export function NewTaskDialog({ open, onOpenChange, onTaskAdded }: NewTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Not Started",
    dueDate: "",
    labels: [] as string[]
  });
  const [newLabel, setNewLabel] = useState("");

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;
    
    if (!taskData.labels.includes(newLabel.trim())) {
      setTaskData({
        ...taskData,
        labels: [...taskData.labels, newLabel.trim()]
      });
    }
    setNewLabel("");
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setTaskData({
      ...taskData,
      labels: taskData.labels.filter(label => label !== labelToRemove)
    });
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!taskData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!taskData.dueDate) {
      toast.error("Due date is required");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Submitting task data:", taskData);
      
      // Convert task data to the format expected by the API
      const apiTaskData = {
        title: taskData.title,
        description: taskData.description || "",
        due_date: taskData.dueDate,
        priority: mapPriorityToDb(taskData.priority),
        status: mapStatusToDb(taskData.status),
        labels: taskData.labels
      };
      
      console.log("Converting to API task data:", apiTaskData);
      const response = await taskService.createTask(apiTaskData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log("Task created successfully:", response.data);
      toast.success("Task created successfully!");
      
      // Reset form and close dialog
      setTaskData({
        title: "",
        description: "",
        priority: "Medium",
        status: "Not Started",
        dueDate: "",
        labels: []
      });
      
      onOpenChange(false);
      
      // Notify parent component to refresh tasks
      if (onTaskAdded) {
        onTaskAdded();
      }
    } catch (error: any) {
      console.error("Failed to create task:", error);
      toast.error(`Failed to create task: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your TaskFlow. Fill out the details below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              rows={3}
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="priority" className="text-sm font-medium">Priority</label>
              <Select 
                value={taskData.priority} 
                onValueChange={(value) => setTaskData({ ...taskData, priority: value })}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <Select 
                value={taskData.status} 
                onValueChange={(value) => setTaskData({ ...taskData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="dueDate" className="text-sm font-medium">Due Date</label>
            <Input
              id="dueDate"
              type="date"
              value={taskData.dueDate}
              onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
            />
          </div>
          
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="labels" className="text-sm font-medium">Labels</label>
              <div className="flex gap-2">
                <Input
                  id="newLabel"
                  placeholder="Add a label"
                  className="h-8 w-40"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLabel();
                    }
                  }}
                />
                <Button size="sm" onClick={handleAddLabel}>Add</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {taskData.labels.map((label) => (
                <Badge key={label} variant="outline" className="bg-accent/40 group">
                  {label}
                  <button 
                    className="ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => handleRemoveLabel(label)}
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
              {taskData.labels.length === 0 && (
                <div className="text-sm text-muted-foreground">No labels added</div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
