
import { useState } from "react";
import { Plus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalendarGrid from "./components/CalendarGrid";
import TasksList from "./components/TasksList";
import AddTaskDialog from "./components/AddTaskDialog";
import TaskDetailDialog from "./components/TaskDetailDialog";
import SyncCalendarDialog from "./components/SyncCalendarDialog";
import { useTasks } from "./hooks/useTasks";
import { TaskType } from "./types";

export default function CalendarPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [currentMonth, setCurrentMonth] = useState<Date>(today);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isTaskDetailDialogOpen, setIsTaskDetailDialogOpen] = useState(false);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  
  const { 
    tasks, 
    tasksForDate, 
    addTask, 
    editTask, 
    deleteTask, 
    updateTaskStatus,
    syncConfigs,
    saveSyncConfigs,
    syncCalendar
  } = useTasks(selectedDate);
  
  const handleAddTask = (newTask: any) => {
    if (!selectedDate) return;
    addTask(newTask, selectedDate);
    setIsAddTaskDialogOpen(false);
  };

  const handleTaskClick = (task: TaskType) => {
    setSelectedTask(task);
    setIsTaskDetailDialogOpen(true);
  };

  const handleEditTask = (taskId: number, updatedTask: Partial<TaskType>) => {
    editTask(taskId, updatedTask);
    setIsTaskDetailDialogOpen(false);
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTask(taskId);
    setIsTaskDetailDialogOpen(false);
  };

  const handleCloseTaskDetail = () => {
    setIsTaskDetailDialogOpen(false);
    setSelectedTask(null);
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage your tasks in calendar format
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="gap-2"
            onClick={() => setIsSyncDialogOpen(true)}
          >
            <CalendarDays size={16} />
            Sync Calendars
          </Button>
          <Button 
            className="gap-2"
            onClick={() => setIsAddTaskDialogOpen(true)}
          >
            <Plus size={16} />
            Add Task
          </Button>
        </div>
      </div>
      
      <AddTaskDialog 
        isOpen={isAddTaskDialogOpen}
        setIsOpen={setIsAddTaskDialogOpen}
        selectedDate={selectedDate}
        onAddTask={handleAddTask}
      />
      
      <TaskDetailDialog 
        task={selectedTask}
        isOpen={isTaskDetailDialogOpen}
        onClose={handleCloseTaskDetail}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onUpdateStatus={updateTaskStatus}
      />
      
      <SyncCalendarDialog
        isOpen={isSyncDialogOpen}
        setIsOpen={setIsSyncDialogOpen}
        syncConfigs={syncConfigs}
        onSaveConfigs={saveSyncConfigs}
        onSyncNow={syncCalendar}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <CalendarGrid 
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          tasks={tasks}
        />
        
        <TasksList 
          selectedDate={selectedDate}
          tasks={tasksForDate}
          onAddTask={() => setIsAddTaskDialogOpen(true)}
          onTaskClick={handleTaskClick}
          onDeleteTask={deleteTask}
          onUpdateTaskStatus={updateTaskStatus}
        />
      </div>
    </div>
  );
}
