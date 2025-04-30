
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Select as MultiSelect,
  SelectContent as MultiSelectContent,
  SelectItem as MultiSelectItem,
  SelectTrigger as MultiSelectTrigger,
  SelectValue as MultiSelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ShareTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareTaskDialog({ open, onOpenChange }: ShareTaskDialogProps) {
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [permissionLevel, setPermissionLevel] = useState("view");
  const { toast } = useToast();

  // Mock data
  const tasks = [
    { id: "task1", name: "Design new dashboard" },
    { id: "task2", name: "Fix navigation bug" },
    { id: "task3", name: "Update documentation" },
  ];

  const users = [
    { id: "user1", name: "John Doe" },
    { id: "user2", name: "Jane Smith" },
    { id: "user3", name: "Robert Johnson" },
  ];

  const handleShare = () => {
    if (!selectedTask || selectedUsers.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select a task and at least one user to share with.",
        variant: "destructive",
      });
      return;
    }

    // Here would be the API call to share the task
    toast({
      title: "Task shared successfully",
      description: `Task has been shared with ${selectedUsers.length} user(s).`,
    });
    
    onOpenChange(false);
    setSelectedTask("");
    setSelectedUsers([]);
    setPermissionLevel("view");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task" className="text-right">
              Task
            </Label>
            <div className="col-span-3">
              <Select 
                value={selectedTask} 
                onValueChange={setSelectedTask}
              >
                <SelectTrigger id="task">
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="users" className="text-right">
              Share with
            </Label>
            <div className="col-span-3">
              <MultiSelect 
                value={selectedUsers[0] || ""} 
                onValueChange={(value) => setSelectedUsers([value])}
              >
                <MultiSelectTrigger id="users">
                  <MultiSelectValue placeholder="Select users" />
                </MultiSelectTrigger>
                <MultiSelectContent>
                  {users.map((user) => (
                    <MultiSelectItem key={user.id} value={user.id}>
                      {user.name}
                    </MultiSelectItem>
                  ))}
                </MultiSelectContent>
              </MultiSelect>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="permission" className="text-right">
              Permission
            </Label>
            <div className="col-span-3">
              <Select 
                value={permissionLevel} 
                onValueChange={setPermissionLevel}
              >
                <SelectTrigger id="permission">
                  <SelectValue placeholder="Select permission level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View only</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleShare}>Share</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
