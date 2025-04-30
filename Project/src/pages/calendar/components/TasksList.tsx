
import { CalendarIcon, Clock, MoreHorizontal, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { TaskType } from "../types";

interface TasksListProps {
  selectedDate: Date | undefined;
  tasks: TaskType[];
  onAddTask: () => void;
  onTaskClick: (task: TaskType) => void;
  onDeleteTask: (taskId: number) => void;
  onUpdateTaskStatus: (taskId: number, status: TaskType["status"]) => void;
}

export default function TasksList({ 
  selectedDate, 
  tasks, 
  onAddTask, 
  onTaskClick,
  onDeleteTask,
  onUpdateTaskStatus
}: TasksListProps) {
  return (
    <Card className="md:col-span-4 animate-slide-in-bottom" style={{ animationDelay: "100ms" }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          {selectedDate ? (
            <>
              Tasks for{" "}
              <span className="text-primary">
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </>
          ) : (
            "Select a date to view tasks"
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedDate && (
          <ScrollArea className="h-[calc(100vh-22rem)] pr-4">
            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id} className="overflow-hidden group">
                    <CardContent className="p-0">
                      <div 
                        className="flex items-center justify-between p-3 border-b border-border/40 cursor-pointer hover:bg-accent/30 transition-colors"
                        onClick={() => onTaskClick(task)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-1 self-stretch",
                            task.priority === "High" ? "bg-destructive" : 
                            task.priority === "Medium" ? "bg-amber-500" : "bg-green-500"
                          )} />
                          <div>
                            <h3 className="font-medium text-sm line-clamp-1">{task.title}</h3>
                            {task.source && task.source !== "local" && (
                              <span className="text-xs text-muted-foreground">
                                From {task.source.charAt(0).toUpperCase() + task.source.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge variant={
                            task.status === "Completed" ? "default" : 
                            task.status === "In Progress" ? "secondary" : "outline"
                          } className="text-xs mr-2">
                            {task.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateTaskStatus(task.id, 
                                    task.status === "Completed" ? "Not Started" : "Completed"
                                  );
                                }}
                                disabled={task.source && task.source !== "local"}
                              >
                                {task.status === "Completed" ? "Mark as Not Started" : "Mark as Completed"}
                              </DropdownMenuItem>
                              {task.status !== "In Progress" && (
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateTaskStatus(task.id, "In Progress");
                                  }}
                                  disabled={task.source && task.source !== "local"}
                                >
                                  Mark as In Progress
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteTask(task.id);
                                }} 
                                className="text-destructive"
                                disabled={task.source && task.source !== "local"}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="px-3 py-2">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {task.labels.map((label: string, index) => (
                            <Badge key={index} variant="outline" className="bg-accent/40 text-xs">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-2">No tasks scheduled for this day</p>
                <Button variant="outline" size="sm" className="mt-2 gap-1" onClick={onAddTask}>
                  <Plus size={14} />
                  Add Task
                </Button>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
