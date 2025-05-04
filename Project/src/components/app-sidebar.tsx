
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  Import,
  Layers,
  Plus,
  Settings,
  Tags,
  Users,
  Loader2,
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
import { useLocation as useRouterLocation } from "react-router-dom";
import { labelService } from "@/lib/api/labels";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Base sidebar items (excluding labels which will be loaded dynamically)
const baseSidebarItems = [
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
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);
  const routerLocation = useRouterLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [labels, setLabels] = useState<any[]>([]);

  useEffect(() => {
    // Fetch labels when the component mounts
    const fetchLabels = async () => {
      try {
        setIsLoading(true);
        const response = await labelService.getAllLabels();
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        console.log("Sidebar labels fetched successfully:", response.data);
        setLabels(response.data || []);
      } catch (err: any) {
        console.error("Failed to fetch labels for sidebar:", err);
        // Don't show toast for this as it's a background load and not critical for UX
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabels();
  }, []);

  const handleTaskAdded = () => {
    // If we're on the tasks page, navigate there to refresh the content
    if (routerLocation.pathname !== '/tasks') {
      navigate("/tasks");
    } else {
      // Force a refresh of the current page by navigating to it again
      navigate(0);
    }
  };

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
                {baseSidebarItems.map((item) => (
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

              {expanded && labels.length > 0 && (
                <div className="mt-6">
                  <div className="px-3 py-1.5 text-sm font-medium text-muted-foreground">
                    Labels
                  </div>
                  <div className="space-y-1 mt-1">
                    {labels.map((label) => (
                      <Link
                        key={`label-${label.label_id}`}
                        to={`/tasks?label=${label.label_id}`}
                        className="flex items-center py-2 px-3 text-sm rounded-md text-foreground/70 hover:text-primary hover:bg-accent/50"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/tasks', { state: { selectedLabelId: label.label_id } });
                        }}
                      >
                        <div 
                          className="h-3 w-3 rounded-full mr-3"
                          style={{ backgroundColor: label.color }}
                        ></div>
                        <span>{label.name}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {/* We can add count here in future */}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {expanded && isLoading && (
                <div className="flex justify-center my-4">
                  <Loader2 size={18} className="animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-border/40">
          <div className="flex items-center justify-between">
            <ThemeSwitcher />
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => navigate('/settings')}
            >
              <Settings size={18} />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      {/* New Task Dialog */}
      <NewTaskDialog 
        open={newTaskDialogOpen} 
        onOpenChange={setNewTaskDialogOpen} 
        onTaskAdded={handleTaskAdded}
      />
    </>
  );
}
