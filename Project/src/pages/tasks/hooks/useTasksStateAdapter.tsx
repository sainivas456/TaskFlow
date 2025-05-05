
import { useTasksState } from "./useTasksState";

export const useTasksStateAdapter = () => {
  const taskState = useTasksState();
  
  // Create adapter for toggleSubtaskCompletion to match expected signature
  const toggleSubtaskCompletionAdapter = (subtaskId: number) => {
    if (taskState.selectedTask) {
      return taskState.toggleSubtaskCompletion(subtaskId);
    }
  };
  
  // Create adapter for addSubtask to match expected signature
  const addSubtaskAdapter = (title: string) => {
    if (taskState.selectedTask) {
      return taskState.addSubtask(taskState.selectedTask.task_id, title);
    }
  };
  
  // Create adapter for deleteSubtask to match expected signature
  const deleteSubtaskAdapter = (subtaskId: number) => {
    if (taskState.selectedTask) {
      return taskState.deleteSubtask(taskState.selectedTask.task_id, subtaskId);
    }
  };
  
  // Create adapter for addLabel to match expected signature in TaskDetail component
  const addLabelAdapter = (label: string) => {
    if (taskState.selectedTask) {
      return taskState.addLabel(taskState.selectedTask.task_id, label);
    }
  };
  
  // Create adapter for removeLabel to match expected signature in TaskDetail component
  const removeLabelAdapter = (taskId: number, label: string) => {
    return taskState.removeLabel(taskId, label);
  };
  
  return {
    ...taskState,
    toggleSubtaskCompletion: toggleSubtaskCompletionAdapter,
    addSubtask: addSubtaskAdapter,
    deleteSubtask: deleteSubtaskAdapter,
    addLabel: addLabelAdapter,
    removeLabel: removeLabelAdapter
  };
};
