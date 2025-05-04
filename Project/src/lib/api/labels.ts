
import { api } from "./client";

export interface Label {
  label_id: number;
  user_id: number;
  name: string;
  color: string;
  description?: string;
  created_at: string;
}

export const labelService = {
  // Get all labels for the current user
  getAllLabels: async () => {
    console.log("Fetching all labels");
    try {
      const response = await api.get<Label[]>("/labels");
      console.log("Labels response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching labels:", error);
      return { error: "Failed to fetch labels", data: null };
    }
  },
  
  // Get a single label by ID
  getLabelById: async (labelId: number) => {
    console.log(`Fetching label ${labelId}`);
    try {
      const response = await api.get<Label>(`/labels/${labelId}`);
      console.log(`Label ${labelId} response:`, response);
      return response;
    } catch (error) {
      console.error(`Error fetching label ${labelId}:`, error);
      return { error: `Failed to fetch label ${labelId}`, data: null };
    }
  },
  
  // Create a new label
  createLabel: async (labelData: { name: string; color: string; description?: string }) => {
    console.log("Creating new label:", labelData.name);
    try {
      const response = await api.post<Label>("/labels", labelData);
      console.log("Create label response:", response);
      return response;
    } catch (error) {
      console.error("Error creating label:", error);
      return { error: "Failed to create label", data: null };
    }
  },
  
  // Update a label
  updateLabel: async (labelId: number, labelData: Partial<{ name: string; color: string; description?: string }>) => {
    console.log(`Updating label ${labelId}:`, labelData);
    try {
      const response = await api.put<Label>(`/labels/${labelId}`, labelData);
      console.log(`Update label ${labelId} response:`, response);
      return response;
    } catch (error) {
      console.error(`Error updating label ${labelId}:`, error);
      return { error: `Failed to update label ${labelId}`, data: null };
    }
  },
  
  // Delete a label
  deleteLabel: async (labelId: number) => {
    console.log(`Deleting label ${labelId}`);
    try {
      const response = await api.delete(`/labels/${labelId}`);
      console.log(`Delete label ${labelId} response:`, response);
      return response;
    } catch (error) {
      console.error(`Error deleting label ${labelId}:`, error);
      return { error: `Failed to delete label ${labelId}`, data: null };
    }
  }
};
