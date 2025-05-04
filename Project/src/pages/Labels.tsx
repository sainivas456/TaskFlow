
import { useState, useEffect } from "react";
import { Plus, Tag, Edit, Trash2, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label as HtmlLabel } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { labelService, Label } from "@/lib/api/labels";

// Color options for label creation/editing
const colorOptions = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#d946ef", // fuchsia
  "#6b7280", // gray
];

export default function Labels() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<Label | null>(null);
  const [newLabel, setNewLabel] = useState({
    name: "",
    color: colorOptions[0],
    description: ""
  });
  
  // Query for fetching labels
  const { 
    data: labels = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["labels"],
    queryFn: async () => {
      console.log("Fetching labels in Labels component");
      const response = await labelService.getAllLabels();
      if (response.error) {
        throw new Error(response.error);
      }
      console.log("Labels fetched:", response.data);
      return response.data || [];
    }
  });
  
  // Filtered labels based on search query
  const filteredLabels = labels.filter(label => 
    label.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (label.description && label.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Create a new label
  const handleCreateLabel = async () => {
    if (!newLabel.name.trim()) {
      toast.error("Label name is required");
      return;
    }
    
    try {
      const response = await labelService.createLabel({
        name: newLabel.name,
        color: newLabel.color,
        description: newLabel.description
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast.success("Label created successfully");
      queryClient.invalidateQueries({ queryKey: ["labels"] });
      setIsDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(`Failed to create label: ${err.message}`);
    }
  };
  
  // Update an existing label
  const handleUpdateLabel = async () => {
    if (!currentLabel || !newLabel.name.trim()) {
      toast.error("Label name is required");
      return;
    }
    
    try {
      const response = await labelService.updateLabel(currentLabel.label_id, {
        name: newLabel.name,
        color: newLabel.color,
        description: newLabel.description
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast.success("Label updated successfully");
      queryClient.invalidateQueries({ queryKey: ["labels"] });
      setIsDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(`Failed to update label: ${err.message}`);
    }
  };
  
  // Delete a label
  const handleDeleteLabel = async () => {
    if (!currentLabel) return;
    
    try {
      const response = await labelService.deleteLabel(currentLabel.label_id);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast.success("Label deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["labels"] });
      setIsDeleteDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(`Failed to delete label: ${err.message}`);
    }
  };
  
  // Open the create/edit dialog
  const openLabelDialog = (label?: Label) => {
    if (label) {
      // Edit mode
      setCurrentLabel(label);
      setNewLabel({
        name: label.name,
        color: label.color,
        description: label.description || ""
      });
    } else {
      // Create mode
      setCurrentLabel(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };
  
  // Open the delete confirmation dialog
  const openDeleteDialog = (label: Label) => {
    setCurrentLabel(label);
    setIsDeleteDialogOpen(true);
  };
  
  // Reset the form state
  const resetForm = () => {
    setNewLabel({
      name: "",
      color: colorOptions[0],
      description: ""
    });
    setCurrentLabel(null);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (currentLabel) {
      handleUpdateLabel();
    } else {
      handleCreateLabel();
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Labels</h1>
          <p className="text-muted-foreground">
            Create and manage labels to categorize your tasks
          </p>
        </div>
        <Button className="gap-2" onClick={() => openLabelDialog()}>
          <Plus size={16} />
          New Label
        </Button>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search labels..."
            className="pl-10 w-full bg-muted/50 border-none focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {searchQuery && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSearchQuery("")} 
            className="gap-1"
          >
            <X size={14} />
            Clear
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-[calc(100vh-14rem)]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-destructive mb-2">Failed to load labels</div>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      ) : filteredLabels.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery ? (
            <div className="text-muted-foreground">
              No labels match your search
            </div>
          ) : (
            <div className="max-w-sm mx-auto">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No labels yet</h3>
              <p className="text-muted-foreground mb-6">
                Create labels to help organize and filter your tasks more efficiently.
              </p>
              <Button onClick={() => openLabelDialog()}>Create your first label</Button>
            </div>
          )}
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLabels.map(label => (
              <Card key={label.label_id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    <div 
                      className="h-4 w-4 rounded-full mr-3"
                      style={{ backgroundColor: label.color }}
                    ></div>
                    <div className="flex-1">
                      <h3 className="font-medium">{label.name}</h3>
                      {label.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {label.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" onClick={() => openLabelDialog(label)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(label)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
      
      {/* Create/Edit Label Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentLabel ? "Edit Label" : "Create Label"}</DialogTitle>
            <DialogDescription>
              {currentLabel 
                ? "Update the details of your label" 
                : "Create a new label to categorize your tasks"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <HtmlLabel htmlFor="name">Name</HtmlLabel>
              <Input 
                id="name"
                placeholder="Enter label name" 
                value={newLabel.name}
                onChange={(e) => setNewLabel({...newLabel, name: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <HtmlLabel>Color</HtmlLabel>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full transition-all ${
                      newLabel.color === color 
                        ? 'ring-2 ring-primary ring-offset-2' 
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewLabel({...newLabel, color})}
                  />
                ))}
              </div>
            </div>
            
            <div className="grid gap-2">
              <HtmlLabel htmlFor="description">Description (Optional)</HtmlLabel>
              <Input 
                id="description"
                placeholder="Enter label description" 
                value={newLabel.description}
                onChange={(e) => setNewLabel({...newLabel, description: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {currentLabel ? "Update Label" : "Create Label"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Label</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the label "{currentLabel?.name}"? 
              This will remove the label from all tasks it is currently assigned to.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="sm:justify-start">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteLabel}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
