
import { api } from "./client";
import { toast } from "sonner";

export interface Label {
  label_id: number;
  user_id: number;
  label_name: string;
  color_code: string;  // Correct property name to match the database schema
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
      
      // Verify the response has the expected structure
      if (!response.data) {
        console.error("Labels response missing data property:", response);
        return { error: "Invalid response format from API", data: null };
      }
      
      // Check if response is array but empty (not an error)
      if (Array.isArray(response.data) && response.data.length === 0) {
        console.log("No labels found");
        return { error: null, data: [] };
      }
      
      // Validate each label has required properties
      const validLabels = Array.isArray(response.data) ? 
        response.data.filter(label => 
          label && 
          typeof label.label_id === 'number' && 
          typeof label.label_name === 'string' &&
          typeof label.color_code === 'string'
        ) : [];
        
      if (Array.isArray(response.data) && validLabels.length < response.data.length) {
        console.warn("Some labels had invalid format", response.data);
      }
      
      return { error: null, data: validLabels };
    } catch (error) {
      console.error("Error fetching labels:", error);
      toast.error("Failed to load labels. Please check your connection.");
      return { error: "Failed to fetch labels", data: null };
    }
  },
  
  // Get a single label by ID
  getLabelById: async (labelId: number) => {
    console.log(`Fetching label ${labelId}`);
    try {
      const response = await api.get<Label>(`/labels/${labelId}`);
      console.log(`Label ${labelId} response:`, response);
      return { error: null, data: response.data };
    } catch (error) {
      console.error(`Error fetching label ${labelId}:`, error);
      toast.error(`Failed to load label details`);
      return { error: `Failed to fetch label ${labelId}`, data: null };
    }
  },
  
  // Create a new label
  createLabel: async (labelData: { label_name: string; color_code: string; description?: string }) => {
    console.log("Creating new label:", labelData.label_name);
    try {
      // Validate data before sending
      if (!labelData.label_name) {
        return { error: "Label name is required", data: null };
      }
      
      if (!labelData.color_code) {
        // Provide a default color if none specified
        labelData.color_code = "#3B82F6";
      }
      
      const response = await api.post<Label>("/labels", labelData);
      console.log("Create label response:", response);
      toast.success(`Label "${labelData.label_name}" created`);
      return { error: null, data: response.data };
    } catch (error) {
      console.error("Error creating label:", error);
      toast.error("Failed to create label");
      return { error: "Failed to create label", data: null };
    }
  },
  
  // Update a label
  updateLabel: async (labelId: number, labelData: Partial<{ label_name: string; color_code: string; description?: string }>) => {
    console.log(`Updating label ${labelId}:`, labelData);
    try {
      const response = await api.put<Label>(`/labels/${labelId}`, labelData);
      console.log(`Update label ${labelId} response:`, response);
      toast.success("Label updated");
      return { error: null, data: response.data };
    } catch (error) {
      console.error(`Error updating label ${labelId}:`, error);
      toast.error("Failed to update label");
      return { error: `Failed to update label ${labelId}`, data: null };
    }
  },
  
  // Delete a label
  deleteLabel: async (labelId: number) => {
    console.log(`Deleting label ${labelId}`);
    try {
      const response = await api.delete(`/labels/${labelId}`);
      console.log(`Delete label ${labelId} response:`, response);
      toast.success("Label deleted");
      return { error: null, data: response.data };
    } catch (error) {
      console.error(`Error deleting label ${labelId}:`, error);
      toast.error("Failed to delete label");
      return { error: `Failed to delete label ${labelId}`, data: null };
    }
  }
};
