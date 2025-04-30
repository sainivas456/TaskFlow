
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ExportOptionsProps {
  format: string;
}

export function ExportOptions({ format }: ExportOptionsProps) {
  const [includeCompletedTasks, setIncludeCompletedTasks] = useState(true);
  const [includeArchivedTasks, setIncludeArchivedTasks] = useState(false);
  const [includeAttachments, setIncludeAttachments] = useState(false);
  const [includeTimeLogs, setIncludeTimeLogs] = useState(true);
  const [includeComments, setIncludeComments] = useState(true);
  const [dateRange, setDateRange] = useState("all");

  return (
    <div className="space-y-6 pt-4">
      <div className="text-sm text-muted-foreground mb-4">
        Configure your {format} export options below. Select the data you want to include and any specific formatting options.
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Content Options</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-completed" className="cursor-pointer">Include completed tasks</Label>
              <Switch 
                id="include-completed" 
                checked={includeCompletedTasks}
                onCheckedChange={setIncludeCompletedTasks}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-archived" className="cursor-pointer">Include archived tasks</Label>
              <Switch 
                id="include-archived" 
                checked={includeArchivedTasks}
                onCheckedChange={setIncludeArchivedTasks}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-attachments" className="cursor-pointer">Include attachments</Label>
              <Switch 
                id="include-attachments" 
                checked={includeAttachments}
                onCheckedChange={setIncludeAttachments}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-time-logs" className="cursor-pointer">Include time logs</Label>
              <Switch 
                id="include-time-logs" 
                checked={includeTimeLogs}
                onCheckedChange={setIncludeTimeLogs}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-comments" className="cursor-pointer">Include comments</Label>
              <Switch 
                id="include-comments" 
                checked={includeComments}
                onCheckedChange={setIncludeComments}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-sm">Filter Options</h3>
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger id="date-range">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This week</SelectItem>
                  <SelectItem value="this-month">This month</SelectItem>
                  <SelectItem value="this-year">This year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {format === "CSV" && (
              <div className="space-y-2">
                <Label htmlFor="delimiter">CSV Delimiter</Label>
                <Select defaultValue=",">
                  <SelectTrigger id="delimiter">
                    <SelectValue placeholder="Select delimiter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=",">Comma (,)</SelectItem>
                    <SelectItem value=";">Semicolon (;)</SelectItem>
                    <SelectItem value="\t">Tab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {format === "Excel" && (
              <div className="space-y-2">
                <Label htmlFor="sheet-name">Sheet Name</Label>
                <Input id="sheet-name" defaultValue="TaskFlow Export" />
              </div>
            )}
          </div>
        </div>

        <Separator />
        
        <div>
          <h3 className="font-medium text-sm mb-3">Data Fields</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="tasks" defaultChecked />
              <Label htmlFor="tasks">Tasks</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="labels" defaultChecked />
              <Label htmlFor="labels">Labels</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="due_dates" defaultChecked />
              <Label htmlFor="due_dates">Due Dates</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="priorities" defaultChecked />
              <Label htmlFor="priorities">Priorities</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="assignees" defaultChecked />
              <Label htmlFor="assignees">Assignees</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="created_dates" defaultChecked />
              <Label htmlFor="created_dates">Created Dates</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
