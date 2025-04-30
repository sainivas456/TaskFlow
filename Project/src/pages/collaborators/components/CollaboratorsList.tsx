
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Mail, MessageSquare, UserMinus } from "lucide-react";

export function CollaboratorsList() {
  // Mock data for collaborators
  const collaborators = [
    { 
      id: "1", 
      name: "John Doe", 
      email: "john.doe@example.com", 
      role: "Admin",
      avatar: "/placeholder.svg",
      sharedTasks: 5
    },
    { 
      id: "2", 
      name: "Jane Smith", 
      email: "jane.smith@example.com", 
      role: "Editor",
      avatar: "/placeholder.svg",
      sharedTasks: 3
    },
    { 
      id: "3", 
      name: "Robert Johnson", 
      email: "robert.johnson@example.com", 
      role: "Viewer",
      avatar: "/placeholder.svg",
      sharedTasks: 7
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Collaborators</CardTitle>
        <CardDescription>
          People you are sharing tasks with
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {collaborators.map((collaborator) => (
            <div 
              key={collaborator.id} 
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                  <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{collaborator.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {collaborator.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant={collaborator.role === "Admin" ? "default" : 
                              collaborator.role === "Editor" ? "outline" : "secondary"}>
                  {collaborator.role}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {collaborator.sharedTasks} shared tasks
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Email</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Message</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <UserMinus className="mr-2 h-4 w-4" />
                      <span>Remove</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
