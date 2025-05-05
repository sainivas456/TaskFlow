
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2, CircleDashed, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/lib/api/labels";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskListProps {
  tasks: any[];
  labels: Label[];
  onTaskClick: (task: any) => void;
  isLoading: boolean;
  onAddTaskClick: () => void;
  searchQuery: string;
}

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

export const TaskList = ({ 
  tasks, 
  labels, 
  onTaskClick, 
  isLoading, 
  onAddTaskClick, 
  searchQuery 
}: TaskListProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-13rem)] pr-4">
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <Card
              key={task.task_id}
              className="cursor-pointer hover:shadow-md transition-shadow smooth-transition"
              onClick={() => onTaskClick(task)}
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
                          const label = labels.find(l => l.label_name === labelName);
                          
                          return (
                            <Badge 
                              key={labelName} 
                              variant="outline" 
                              className="bg-accent/40"
                              style={label ? {
                                borderColor: label.color_code,
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
              {searchQuery ? 
                "No tasks match your filter criteria. Try adjusting your filters." : 
                "No tasks in this category. Add a task to get started."}
            </p>
            <Button className="gap-2" onClick={onAddTaskClick}>
              <Plus size={16} />
              Add Task
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
