
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportContent } from "./components/ExportContent";
import { ImportContent } from "./components/ImportContent";

const ImportExport = () => {
  useEffect(() => {
    console.log("Import/Export page loaded");
  }, []);

  return (
    <>
      <Helmet>
        <title>Import/Export | TaskFlow</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Import / Export Data</h1>
        </div>
        
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid grid-cols-2 max-w-[400px]">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export">
            <ExportContent />
          </TabsContent>
          
          <TabsContent value="import">
            <ImportContent />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ImportExport;
