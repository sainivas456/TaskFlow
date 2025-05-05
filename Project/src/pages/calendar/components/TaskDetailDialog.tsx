
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  Edit, 
  ExternalLink, 
  MoreHorizontal, 
  Save, 
  Trash,
  X,
  CircleDashed
} from "lucide-react";
import { TaskType } from "../types";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface TaskDetailDialogProps {
  task: TaskType | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (taskId: number, updatedTask: Partial<TaskType>) => void;
  onDelete: (taskId: number) => void;
  onUpdateStatus: (taskId: number, status: TaskType["status"]) => void;
}

export default function TaskDetailDialog({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdateStatus
}: TaskDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<TaskType>>({});
  const [newLabel, setNewLabel] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Determine if task is from an external source
  const isExternalTask = task?.source && task.source !== "local";

  // Reset editing state and update editedTask when task changes
  useEffect(() => {
    if (task) {
      setEditedTask({...task});
      setIsEditing(false);
    }
  }, [task]);

  const handleSave = async () => {
    if (task && editedTask.title?.trim()) {
      try {
        setIsUpdating(true);
        
        // Prepare full update data
        const updateData: Partial<TaskType> = {
          title: editedTask.title,
          description: editedTask.description,
          priority: editedTask.priority,
          labels: editedTask.labels
        };
        
        // If due date was changed and is a Date object
        if (editedTask.dueDate && editedTask.dueDate instanceof Date) {
          updateData.dueDate = editedTask.dueDate;
        }
        
        console.log("Updating calendar task with:", updateData);
        
        // Call API to update task
        await onEdit(task.id, updateData);
        
        setIsEditing(false);
        toast.success("Task updated successfully");
      } catch (error) {
        console.error("Failed to update task:", error);
        toast.error("Failed to update task. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    } else {
      toast.error("Task title cannot be empty");
    }
  };

  const handleDelete = () => {
    if (task) {
      onDelete(task.id);
      onClose();
    }
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && task) {
      const updatedLabels = [...(editedTask.labels || []), newLabel.trim()];
      setEditedTask({ ...editedTask, labels: updatedLabels });
      setNewLabel("");
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    if (task) {
      const updatedLabels = (editedTask.labels || []).filter(label => label !== labelToRemove);
      setEditedTask({ ...editedTask, labels: updatedLabels });
    }
  };

  const handleStatusUpdate = (status: TaskType["status"]) => {
    if (task) {
      onUpdateStatus(task.id, status);
    }
  };

  const toggleEditMode = () => {
    if (task) {
      if (isEditing) {
        // Cancel editing - reset to original task
        setEditedTask({...task});
      }
      setIsEditing(!isEditing);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            {isEditing ? (
              <Input
                value={editedTask.title || ""}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="text-xl font-bold"
                placeholder="Task title"
              />
            ) : (
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
            )}
            
            {!isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isExternalTask && (
                    <DropdownMenuItem 
                      onClick={toggleEditMode}
                      disabled={isUpdating}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Task
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleStatusUpdate("Completed")}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusUpdate("In Progress")}>
                    <Clock className="mr-2 h-4 w-4" />
                    Mark as In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusUpdate("Not Started")}>
                    <CircleDashed className="mr-2 h-4 w-4" />
                    Mark as Not Started
                  </DropdownMenuItem>
                  {!isExternalTask && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleDelete}
                        disabled={isUpdating}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Task
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {isEditing && (
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleEditMode}
                  disabled={isUpdating}
                >
                  <X size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  <Save size={18} />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {task.source && task.source !== "local" && (
          <div className="bg-accent/40 rounded-md p-2 flex items-center justify-between mt-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <ExternalLink size={14} className="mr-2" />
              Imported from {task.source.charAt(0).toUpperCase() + task.source.slice(1)} Calendar
            </div>
            <Badge variant="outline">{task.source}</Badge>
          </div>
        )}

        <div className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={task.status === "Completed" ? "default" : task.status === "In Progress" ? "secondary" : "outline"}>
              {task.status}
            </Badge>
            <Badge variant={
              task.priority === "High" ? "destructive" : 
              task.priority === "Medium" ? "outline" : "secondary"
            }>
              {task.priority}
            </Badge>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2">Description</h4>
            {isEditing ? (
              <Textarea
                value={editedTask.description || ""}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="min-h-[100px]"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {task.description || "No description provided."}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2">Due Date</h4>
            {isEditing ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon size={16} className="mr-2 text-muted-foreground" />
                    {editedTask.dueDate ? format(
                      editedTask.dueDate instanceof Date ? editedTask.dueDate : new Date(editedTask.dueDate), 
                      'PPP'
                    ) : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editedTask.dueDate instanceof Date ? 
                      editedTask.dueDate : 
                      editedTask.dueDate ? new Date(editedTask.dueDate) : undefined}
                    onSelect={(date) => setEditedTask({ ...editedTask, dueDate: date })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="flex items-center text-sm">
                <CalendarIcon size={16} className="mr-2 text-muted-foreground" />
                <span>{task.dueDate instanceof Date ? 
                  task.dueDate.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 
                  new Date(task.dueDate).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })
                }</span>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2">Labels</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {(isEditing ? editedTask.labels : task.labels)?.map((label, index) => (
                <Badge key={index} variant="outline" className="bg-accent/40 group">
                  {label}
                  {isEditing && !isExternalTask && (
                    <button 
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      onClick={() => handleRemoveLabel(label)}
                    >
                      &times;
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            
            {isEditing && !isExternalTask && (
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add new label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddLabel();
                    }
                  }}
                />
                <Button size="sm" onClick={handleAddLabel}>Add</Button>
              </div>
            )}
          </div>

          {isEditing && !isExternalTask && (
            <>
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-2">Priority</h4>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editedTask.priority || task.priority}
                  onChange={(e) => setEditedTask({ 
                    ...editedTask, 
                    priority: e.target.value as TaskType["priority"]
                  })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-6">
          {isEditing ? (
            <div className="flex justify-between w-full">
              <Button 
                variant="outline" 
                onClick={toggleEditMode}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={onClose}>Close</Button>
              {!isExternalTask && task.status !== "Completed" && (
                <Button 
                  onClick={() => handleStatusUpdate("Completed")}
                  disabled={isUpdating}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Completed
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
