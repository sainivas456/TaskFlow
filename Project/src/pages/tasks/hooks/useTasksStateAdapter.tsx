
import { useTasksState } from "./useTasksState";

export const useTasksStateAdapter = () => {
  const {
    filteredTasks,
    tasks,
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
  } = useTasksState();

  return {
    filteredTasks,
    tasks,
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
    updateTask, // Add this function to the returned object
    deleteTask,
    addLabel,
    removeLabel,
    setOpenTaskDetail,
    setAddTaskOpen
  };
};
