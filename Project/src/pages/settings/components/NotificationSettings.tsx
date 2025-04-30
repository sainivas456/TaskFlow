
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [collaboratorUpdates, setCollaboratorUpdates] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [digestFrequency, setDigestFrequency] = useState("daily");
  
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose when and how you want to be notified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important updates
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="task-reminders">Task Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded of upcoming task deadlines
                </p>
              </div>
              <Switch
                id="task-reminders"
                checked={taskReminders}
                onCheckedChange={setTaskReminders}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="comment-notifications">Comment Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Be notified when someone comments on your tasks
                </p>
              </div>
              <Switch
                id="comment-notifications"
                checked={commentNotifications}
                onCheckedChange={setCommentNotifications}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="collaborator-updates">Collaborator Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates when collaborators make changes
                </p>
              </div>
              <Switch
                id="collaborator-updates"
                checked={collaboratorUpdates}
                onCheckedChange={setCollaboratorUpdates}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-notifications">System Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about system maintenance and new features
                </p>
              </div>
              <Switch
                id="system-notifications"
                checked={systemNotifications}
                onCheckedChange={setSystemNotifications}
              />
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-sm font-medium mb-3">Email Digest Frequency</h3>
            <Select value={digestFrequency} onValueChange={setDigestFrequency}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              {digestFrequency === "daily" 
                ? "You'll receive a daily summary of all notifications." 
                : digestFrequency === "weekly"
                ? "You'll receive a weekly summary every Monday." 
                : "You won't receive any email digests."}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave}>Save Preferences</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
