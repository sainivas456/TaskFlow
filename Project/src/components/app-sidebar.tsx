
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Home,
  Import,
  Layers,
  Menu,
  Plus,
  Settings,
  Tags,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { NewTaskDialog } from "./task/NewTaskDialog";

const sidebarItems = [
  { name: "Dashboard", icon: Home, path: "/" },
  { name: "Tasks", icon: Layers, path: "/tasks" },
  { name: "Calendar", icon: Calendar, path: "/calendar" },
  { name: "Time Tracking", icon: Clock, path: "/time-tracking" },
  { name: "Labels", icon: Tags, path: "/labels" },
  { name: "Collaborators", icon: Users, path: "/collaborators" },
  { name: "Import/Export", icon: Import, path: "/import-export" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export function AppSidebar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r animate-fade-in border-border/40"
      >
        <SidebarHeader className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {expanded && (
              <div className="text-xl font-semibold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                TaskFlow
              </div>
            )}
          </div>
          <SidebarTrigger
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 p-0 rounded-full bg-secondary"
          >
            {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </SidebarTrigger>
        </SidebarHeader>

        <SidebarContent>
          <ScrollArea className="h-[calc(100vh-14rem)]">
            <div className="px-3 py-2">
              <Button 
                variant="default" 
                className="w-full justify-start mb-6"
                onClick={() => setNewTaskDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>New Task</span>
              </Button>

              <div className="space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "flex items-center py-2 px-3 text-sm rounded-md smooth-transition",
                      location.pathname === item.path
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/70 hover:text-primary hover:bg-accent/50"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {expanded && <span>{item.name}</span>}
                  </Link>
                ))}
              </div>
            </div>
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-border/40">
          <div className="flex items-center justify-between">
            <ThemeSwitcher />
            <Button size="icon" variant="ghost">
              <Settings size={18} />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      {/* New Task Dialog */}
      <NewTaskDialog open={newTaskDialogOpen} onOpenChange={setNewTaskDialogOpen} />
    </>
  );
}
