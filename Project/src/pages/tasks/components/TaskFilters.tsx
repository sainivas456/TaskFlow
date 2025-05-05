
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/lib/api/labels";
import { Search, X, Filter, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilters: {
    priority: number | null;
    status: string | null;
  };
  onApplyFilter: (filterType: 'priority' | 'status', value: string | number | null) => void;
  onResetFilters: () => void;
  selectedCategoryId: string;
  labels: Label[];
  onSelectLabelCategory: (labelCategory: any) => void;
}

// Priority mapping for UI display
const PRIORITY_MAPPING = {
  HIGH: 5,
  MEDIUM: 3,
  LOW: 1
};

export const TaskFilters = ({
  searchQuery,
  onSearchChange,
  activeFilters,
  onApplyFilter,
  onResetFilters,
  selectedCategoryId,
  labels,
  onSelectLabelCategory
}: TaskFiltersProps) => {
  // Helper function to check active priority
  const isPriorityActive = (value: number): boolean => {
    return activeFilters.priority === value;
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          className="pl-10 w-full bg-muted/50 border-none focus-visible:ring-primary/20"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {(activeFilters.priority || activeFilters.status || selectedCategoryId !== "all") && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onResetFilters} 
          className="gap-1"
        >
          <X size={14} />
          Clear filters
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter size={14} />
            <span>Filter</span>
            <ChevronDown size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={onResetFilters}>
            All Tasks
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onApplyFilter('priority', PRIORITY_MAPPING.HIGH)}
            className={isPriorityActive(PRIORITY_MAPPING.HIGH) ? 'bg-accent' : ''}
          >
            Priority: High
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onApplyFilter('priority', PRIORITY_MAPPING.MEDIUM)}
            className={isPriorityActive(PRIORITY_MAPPING.MEDIUM) ? 'bg-accent' : ''}
          >
            Priority: Medium
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onApplyFilter('priority', PRIORITY_MAPPING.LOW)}
            className={isPriorityActive(PRIORITY_MAPPING.LOW) ? 'bg-accent' : ''}
          >
            Priority: Low
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onApplyFilter('status', 'Completed')}
            className={activeFilters.status === 'Completed' ? 'bg-accent' : ''}
          >
            Status: Completed
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onApplyFilter('status', 'In Progress')}
            className={activeFilters.status === 'In Progress' ? 'bg-accent' : ''}
          >
            Status: In Progress
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onApplyFilter('status', 'Not Started')}
            className={activeFilters.status === 'Not Started' ? 'bg-accent' : ''}
          >
            Status: Not Started
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {labels.map((label) => (
            <DropdownMenuItem
              key={`label-filter-${label.label_id}`}
              onClick={() => {
                const labelCategory = {
                  id: `label-${label.label_id}`,
                  name: label.label_name,
                  color: label.color_code,
                  count: 0,
                  isLabel: true
                };
                onSelectLabelCategory(labelCategory);
              }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: label.color_code }}
                ></div>
                <span>Label: {label.label_name}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
