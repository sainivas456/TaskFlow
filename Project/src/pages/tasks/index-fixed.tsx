
import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasksStateAdapter } from "./hooks/useTasksStateAdapter";
import { CategorySidebar } from "./components/CategorySidebar";
import { TaskFilters } from "./components/TaskFilters";
import { TaskList } from "./components/TaskList";
import { TaskDetail } from "./components/TaskDetail";
import { NewTaskDialog } from "@/components/task/NewTaskDialog";

export default function Tasks() {
  const {
    filteredTasks,
    labels,
    categories,
    selectedCategory,
    selectedTask,
    openTaskDetail,
    searchQuery,
    activeFilters,
    addTaskOpen,
    isLoading,
    error,
    setSelectedCategory,
    setSearchQuery,
    applyFilter,
    resetFilters,
    handleTaskClick,
    toggleSubtaskCompletion,
    addSubtask,
    deleteSubtask,
    handleTaskAdded,
    handleUpdateTaskStatus,
    updateTask,
    deleteTask,
    addLabel,
    removeLabel,
    setOpenTaskDetail,
    setAddTaskOpen
  } = useTasksStateAdapter();
  
  // Loading state
  if (isLoading && filteredTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && filteredTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="bg-destructive/10 p-4 rounded-full mb-4">
            <X className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Failed to load tasks</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and organize your tasks
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddTaskOpen(true)}>
          <Plus size={16} />
          Add Task
        </Button>
      </div>

      <div className="flex gap-6">
        <CategorySidebar 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onCategorySelect={setSelectedCategory}
        />

        <div className="flex-1 space-y-5 animate-slide-in-bottom" style={{ animationDelay: "100ms" }}>
          <TaskFilters 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilters={activeFilters}
            onApplyFilter={applyFilter}
            onResetFilters={resetFilters}
            selectedCategoryId={selectedCategory.id}
            labels={labels}
            onSelectLabelCategory={setSelectedCategory}
          />

          <TaskList 
            tasks={filteredTasks} 
            labels={labels}
            onTaskClick={handleTaskClick}
            isLoading={isLoading}
            onAddTaskClick={() => setAddTaskOpen(true)}
            searchQuery={searchQuery}
          />
        </div>
      </div>

      {/* Task Detail Dialog */}
      <TaskDetail 
        open={openTaskDetail}
        onOpenChange={setOpenTaskDetail}
        selectedTask={selectedTask}
        labels={labels}
        onUpdateTaskStatus={handleUpdateTaskStatus}
        onDeleteTask={deleteTask}
        onToggleSubtaskCompletion={toggleSubtaskCompletion}
        onAddSubtask={addSubtask}
        onDeleteSubtask={deleteSubtask}
        onAddLabel={addLabel}
        onRemoveLabel={removeLabel}
      />

      {/* New Task Dialog */}
      <NewTaskDialog 
        open={addTaskOpen} 
        onOpenChange={setAddTaskOpen} 
        onTaskAdded={handleTaskAdded}
      />
    </div>
  );
}
