
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { ExportOptions } from "./ExportOptions";
import { useToast } from "@/hooks/use-toast";
import { 
  FileJson, 
  FileText
} from "lucide-react";
import { Export } from "./Export";

export function ExportContent() {
  const [activeFormat, setActiveFormat] = useState("json");
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Export started",
      description: `Exporting data in ${activeFormat.toUpperCase()} format.`,
    });
    // Actual export logic would be implemented here
    
    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: `Your ${activeFormat.toUpperCase()} file has been downloaded.`,
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose Export Format</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeFormat} onValueChange={setActiveFormat}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="json" className="flex items-center space-x-2">
                <FileJson className="h-4 w-4" />
                <span>JSON</span>
              </TabsTrigger>
              <TabsTrigger value="csv" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>CSV</span>
              </TabsTrigger>
              <TabsTrigger value="xml" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>XML</span>
              </TabsTrigger>
              <TabsTrigger value="excel" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Excel</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="json">
              <ExportOptions format="JSON" />
            </TabsContent>
            
            <TabsContent value="csv">
              <ExportOptions format="CSV" />
            </TabsContent>
            
            <TabsContent value="xml">
              <ExportOptions format="XML" />
            </TabsContent>
            
            <TabsContent value="excel">
              <ExportOptions format="Excel" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Export onExport={handleExport} format={activeFormat} />
    </div>
  );
}
