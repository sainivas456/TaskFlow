
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TaskType } from "../types";

interface CalendarGridProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  tasks: TaskType[];
}

export default function CalendarGrid({
  selectedDate,
  setSelectedDate,
  currentMonth,
  setCurrentMonth,
  tasks
}: CalendarGridProps) {
  const today = new Date();
  
  // Helper to check if a date has tasks
  const hasTasksOnDate = (date: Date) => {
    return tasks.some((task) => {
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  return (
    <Card className="md:col-span-8 animate-slide-in-bottom" style={{ animationDelay: "0ms" }}>
      <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-medium">
            {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
          </CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              const prevMonth = new Date(currentMonth);
              prevMonth.setMonth(prevMonth.getMonth() - 1);
              setCurrentMonth(prevMonth);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              const nextMonth = new Date(currentMonth);
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              setCurrentMonth(nextMonth);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-7"
            onClick={() => {
              setCurrentMonth(today);
              setSelectedDate(today);
            }}
          >
            Today
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-2">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="rounded-md"
          classNames={{
            day_today: "bg-accent text-accent-foreground",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          }}
          components={{
            Day: (props) => {
              const date = props.date;
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const hasTasks = hasTasksOnDate(date);
              
              const dayClasses = cn(
                "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                isCurrentMonth ? "text-foreground" : "text-muted-foreground/40",
                {
                  "bg-accent text-accent-foreground": 
                    date.toDateString() === new Date().toDateString(),
                  "bg-primary text-primary-foreground": 
                    selectedDate && date.toDateString() === selectedDate.toDateString()
                }
              );
              
              return (
                <div className="relative group hover:scale-105 transition-transform duration-200">
                  <div className={dayClasses}>
                    <button className="h-full w-full flex items-center justify-center">
                      {date.getDate()}
                    </button>
                  </div>
                  {hasTasks && isCurrentMonth && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
              );
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
