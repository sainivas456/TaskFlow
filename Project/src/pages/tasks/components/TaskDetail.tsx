
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label as HtmlLabel } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/lib/api/labels";
import { cn } from "@/lib/utils";
import { CalendarDays, CheckCircle2, CircleDashed, Clock, Edit, MoreHorizontal, Save, Trash2, UserPlus, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface TaskDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTask: any;
  labels: Label[];
  onUpdateTaskStatus: (taskId: number, status: string) => void;
  onDeleteTask: (taskId: number) => void;
  onToggleSubtaskCompletion: (subtaskId: number) => void;
  onAddSubtask: (subtaskTitle: string) => void;
  onDeleteSubtask: (subtaskId: number) => void;
  onAddLabel: (label: string) => void;
  onRemoveLabel: (taskId: number, label: string) => void;
  updateTask: (taskId: number, updatedData: any) => void;
}

export const TaskDetail = ({
  open,
  onOpenChange,
  selectedTask,
  labels,
  onUpdateTaskStatus,
  onDeleteTask,
  onToggleSubtaskCompletion,
  onAddSubtask,
  onDeleteSubtask,
  onAddLabel,
  onRemoveLabel,
  updateTask
}: TaskDetailProps) => {
  const [newSubtask, setNewSubtask] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<any>(null);

  // Reset editing state when selected task changes
  useEffect(() => {
    setIsEditing(false);
    setEditedTask(selectedTask ? {...selectedTask} : null);
  }, [selectedTask]);

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    onAddSubtask(newSubtask);
    setNewSubtask("");
  };

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;
    onAddLabel(newLabel);
    setNewLabel("");
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // If we're exiting edit mode without saving, reset to original
      setEditedTask({...selectedTask});
    }
    setIsEditing(!isEditing);
  };

  // Save edited task
  const saveEditedTask = () => {
    if (!editedTask || !selectedTask) return;
    
    // Update task with edited fields
    const updatedFields = {
      title: editedTask.title,
      description: editedTask.description,
      priority: editedTask.priority,
      // Add other fields as needed
    };
    
    // Call API to update task
    updateTask(selectedTask.task_id, updatedFields);
    setIsEditing(false);
    toast.success("Task updated successfully");
  };

  if (!selectedTask) return null;

  // Map between UI status and database status
  const getToggleStatus = () => {
    if (selectedTask.status === "Completed") {
      return "Pending"; // In DB, this will be shown as "Not Started" in UI
    } else {
      return "Completed";
    }
  };

  const getButtonLabel = () => {
    if (selectedTask.status === "Completed") {
      return "Mark as Working";
    } else {
      return "Mark as Completed";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            {isEditing ? (
              <Input 
                value={editedTask.title} 
                onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
                className="text-xl"
              />
            ) : (
              <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
            )}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={toggleEditMode}
              >
                {isEditing ? <Save size={16} /> : <Edit size={16} />}
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
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onUpdateTaskStatus(selectedTask.task_id, "Completed")}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateTaskStatus(selectedTask.task_id, "In Progress")}>
                    <Clock className="mr-2 h-4 w-4" />
                    Mark as In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateTaskStatus(selectedTask.task_id, "Pending")}>
                    <CircleDashed className="mr-2 h-4 w-4" />
                    Mark as Not Started
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onDeleteTask(selectedTask.task_id)} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          {/* Description section */}
          <div>
            <h4 className="text-sm font-medium mb-2">Description</h4>
            {isEditing ? (
              <Textarea 
                value={editedTask.description || ''} 
                onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                className="min-h-[100px]"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {selectedTask.description || "No description added yet"}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <div>
              <h4 className="text-xs text-muted-foreground mb-1">Status</h4>
              <Badge variant={
                selectedTask.status === "Completed" ? "default" : 
                selectedTask.status === "In Progress" ? "outline" : 
                "secondary"
              }>
                {selectedTask.status === "Pending" ? "Not Started" : selectedTask.status}
              </Badge>
            </div>
            <div>
              <h4 className="text-xs text-muted-foreground mb-1">Priority</h4>
              {isEditing ? (
                <select 
                  className="h-8 text-sm rounded-md border px-2"
                  value={editedTask.priority} 
                  onChange={(e) => setEditedTask({...editedTask, priority: e.target.value})}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              ) : (
                <Badge variant={
                  selectedTask.priority === "High" ? "destructive" : 
                  selectedTask.priority === "Medium" ? "outline" : 
                  "secondary"
                }>
                  {selectedTask.priority}
                </Badge>
              )}
            </div>
            <div>
              <h4 className="text-xs text-muted-foreground mb-1">Due Date</h4>
              <div className="text-sm flex items-center">
                <CalendarDays size={14} className="mr-1" />
                <span>{new Date(selectedTask.due_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Labels section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Labels</h4>
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Add label..." 
                  className="h-8 text-sm" 
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                />
                <Button variant="outline" size="sm" onClick={handleAddLabel}>
                  Add
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTask.labels && selectedTask.labels.map((labelName: string) => {
                // Find matching label to get its color
                const label = labels.find(l => l.label_name === labelName);
                
                return (
                  <Badge 
                    key={labelName} 
                    variant="outline"
                    className="bg-accent/40 flex items-center gap-1 pl-2"
                    style={label ? {
                      borderColor: label.color_code,
                      borderWidth: '1px'
                    } : {}}
                  >
                    {labelName}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => onRemoveLabel(selectedTask.task_id, labelName)}
                    >
                      <X size={12} />
                    </Button>
                  </Badge>
                );
              })}
              {(!selectedTask.labels || selectedTask.labels.length === 0) && (
                <p className="text-sm text-muted-foreground">No labels added yet</p>
              )}
            </div>
          </div>

          {/* Subtasks section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Subtasks</h4>
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Add subtask..." 
                  className="h-8 text-sm" 
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                />
                <Button variant="outline" size="sm" onClick={handleAddSubtask}>
                  Add
                </Button>
              </div>
            </div>
            
            {selectedTask.progress > 0 && (
              <div className="mb-3">
                <Progress value={selectedTask.progress} className="h-2" />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-muted-foreground">{selectedTask.progress}% completed</span>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {selectedTask.subtasks && selectedTask.subtasks.map((subtask: any) => (
                <div key={subtask.id} className="flex items-center justify-between p-2 bg-accent/20 rounded-md">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id={`subtask-${subtask.id}`} 
                      checked={subtask.completed}
                      onCheckedChange={() => onToggleSubtaskCompletion(subtask.id)}
                    />
                    <label
                      htmlFor={`subtask-${subtask.id}`}
                      className={cn(
                        "text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                        subtask.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {subtask.title}
                    </label>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDeleteSubtask(subtask.id)}
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              {(!selectedTask.subtasks || selectedTask.subtasks.length === 0) && (
                <p className="text-sm text-muted-foreground">No subtasks added yet</p>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={toggleEditMode}>
                Cancel
              </Button>
              <Button onClick={saveEditedTask}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button 
                onClick={() => onUpdateTaskStatus(selectedTask.task_id, getToggleStatus())}
              >
                {getButtonLabel()}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
