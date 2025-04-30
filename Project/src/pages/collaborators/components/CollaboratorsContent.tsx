
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShareTaskDialog } from "./ShareTaskDialog";
import { CollaboratorsList } from "./CollaboratorsList";
import { SharedTasks } from "./SharedTasks";
import { UserPlus } from "lucide-react";

export function CollaboratorsContent() {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("collaborators");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="w-full max-w-[400px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
              <TabsTrigger value="shared-tasks">Shared Tasks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="collaborators" className="mt-6">
              <CollaboratorsList />
            </TabsContent>
            
            <TabsContent value="shared-tasks" className="mt-6">
              <SharedTasks />
            </TabsContent>
          </Tabs>
        </div>
        <Button onClick={() => setIsShareDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Share Task
        </Button>
      </div>

      <ShareTaskDialog 
        open={isShareDialogOpen} 
        onOpenChange={setIsShareDialogOpen} 
      />
    </div>
  );
}
