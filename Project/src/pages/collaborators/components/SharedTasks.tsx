
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EyeIcon, Edit2, Users } from "lucide-react";

export function SharedTasks() {
  // Mock data for shared tasks
  const sharedTasks = [
    {
      id: "1",
      name: "Redesign homepage",
      sharedWith: [
        { id: "user1", name: "John Doe", avatar: "/placeholder.svg" },
        { id: "user2", name: "Jane Smith", avatar: "/placeholder.svg" },
      ],
      status: "In Progress",
      permission: "Edit",
    },
    {
      id: "2",
      name: "Implement authentication",
      sharedWith: [
        { id: "user3", name: "Robert Johnson", avatar: "/placeholder.svg" },
      ],
      status: "Not Started",
      permission: "View",
    },
    {
      id: "3",
      name: "Documentation update",
      sharedWith: [
        { id: "user1", name: "John Doe", avatar: "/placeholder.svg" },
        { id: "user3", name: "Robert Johnson", avatar: "/placeholder.svg" },
      ],
      status: "Completed",
      permission: "Comment",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "Not Started":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Not Started</Badge>;
      case "Completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPermissionBadge = (permission: string) => {
    switch (permission) {
      case "Edit":
        return <Badge variant="secondary"><Edit2 className="mr-1 h-3 w-3" /> Edit</Badge>;
      case "View":
        return <Badge variant="secondary"><EyeIcon className="mr-1 h-3 w-3" /> View</Badge>;
      case "Comment":
        return <Badge variant="secondary">Comment</Badge>;
      default:
        return <Badge variant="secondary">{permission}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Name</TableHead>
              <TableHead>Shared With</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Permission</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sharedTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell>
                  <div className="flex -space-x-2 overflow-hidden">
                    {task.sharedWith.map((user) => (
                      <Avatar key={user.id} className="border-2 border-background h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {task.sharedWith.length > 3 && (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium">
                        +{task.sharedWith.length - 3}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(task.status)}</TableCell>
                <TableCell>{getPermissionBadge(task.permission)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
