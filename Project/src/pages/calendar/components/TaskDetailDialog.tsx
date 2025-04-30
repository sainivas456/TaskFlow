
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, CheckCircle2, Clock, Edit2, ExternalLink, Tags, Trash } from "lucide-react";
import { TaskType } from "../types";

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

  // Determine if task is from an external source
  const isExternalTask = task?.source && task.source !== "local";

  useEffect(() => {
    if (task) {
      setEditedTask(task);
    }
  }, [task]);

  const handleSave = () => {
    if (task && editedTask.title?.trim()) {
      onEdit(task.id, editedTask);
      setIsEditing(false);
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
      setEditedTask({ ...editedTask, status });
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
              />
            ) : (
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
            )}
            <div className="flex gap-2">
              {!isExternalTask && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit2 size={16} />
                </Button>
              )}
              {!isExternalTask && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="text-destructive hover:bg-destructive/10"
                  onClick={handleDelete}
                >
                  <Trash size={16} />
                </Button>
              )}
            </div>
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
            <div className="flex items-center text-sm">
              <Calendar size={16} className="mr-2 text-muted-foreground" />
              <span>{task.dueDate.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}</span>
            </div>
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
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          ) : (
            <div className="flex justify-between w-full">
              {!isExternalTask && (
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => handleStatusUpdate(
                      task.status === "Completed" ? "Not Started" : "Completed"
                    )}
                  >
                    <CheckCircle2 size={16} />
                    {task.status === "Completed" ? "Mark as Not Started" : "Mark as Completed"}
                  </Button>
                  {task.status !== "In Progress" && (
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => handleStatusUpdate("In Progress")}
                    >
                      <Clock size={16} />
                      Mark as In Progress
                    </Button>
                  )}
                </div>
              )}
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
