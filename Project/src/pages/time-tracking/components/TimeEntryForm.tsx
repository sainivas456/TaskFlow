
import { useState } from "react";
import { Play, Pause, Plus, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function TimeEntryForm() {
  const [isTracking, setIsTracking] = useState(false);
  const [selectedTask, setSelectedTask] = useState("");
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  const { toast } = useToast();

  const mockTasks = [
    { id: "1", name: "Design new dashboard" },
    { id: "2", name: "Fix navigation bug" },
    { id: "3", name: "Update documentation" },
  ];

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartTimer = () => {
    if (!selectedTask) {
      toast({
        title: "No task selected",
        description: "Please select a task before starting the timer.",
        variant: "destructive",
      });
      return;
    }

    setIsTracking(true);
    const interval = window.setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const handleStopTimer = () => {
    setIsTracking(false);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    if (timer > 0) {
      toast({
        title: "Time entry saved",
        description: `Recorded ${formatTime(timer)} for the selected task.`,
      });
      // Here we would save the time entry to the database
      setTimer(0);
    }
  };

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Manual entry saved",
      description: "Your time entry has been saved successfully.",
    });
    // Here we would save the manual entry to the database
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-4 flex items-center">
            <Timer className="mr-2 h-5 w-5" />
            Timer
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task">Task</Label>
              <Select
                value={selectedTask}
                onValueChange={setSelectedTask}
                disabled={isTracking}
              >
                <SelectTrigger id="task">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {mockTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-background border rounded-md p-3 text-2xl font-mono min-w-[140px] text-center">
                {formatTime(timer)}
              </div>
              {isTracking ? (
                <Button onClick={handleStopTimer} variant="destructive">
                  <Pause className="mr-2 h-4 w-4" /> Stop
                </Button>
              ) : (
                <Button onClick={handleStartTimer}>
                  <Play className="mr-2 h-4 w-4" /> Start
                </Button>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4 flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Manual Entry
          </h3>
          <form onSubmit={handleManualEntry} className="space-y-4">
            <div>
              <Label htmlFor="manualTask">Task</Label>
              <Select>
                <SelectTrigger id="manualTask">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {mockTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hours">Hours</Label>
                <Input id="hours" type="number" min="0" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="minutes">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                />
              </div>
            </div>
            <Button type="submit">Add Time Entry</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
