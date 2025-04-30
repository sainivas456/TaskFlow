
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeEntryForm } from "./TimeEntryForm";
import { TimeLogList } from "./TimeLogList";
import { TimeVisualization } from "./TimeVisualization";

export function TimeTrackingContent() {
  const [activeTab, setActiveTab] = useState("logs");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Track Your Time</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeEntryForm />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logs">Time Logs</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="mt-6">
          <TimeLogList />
        </TabsContent>
        
        <TabsContent value="stats" className="mt-6">
          <TimeVisualization />
        </TabsContent>
        
        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Generate and download reports based on your time tracking data.
              </p>
              {/* Report generation functionality will go here */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
