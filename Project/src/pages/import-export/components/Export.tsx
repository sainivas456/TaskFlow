
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileJson, 
  FileText, 
  Download, 
  DownloadCloud 
} from "lucide-react";
import Image from "@/components/ui/image";

interface ExportProps {
  format: string;
  onExport: () => void;
}

export function Export({ format, onExport }: ExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportClick = () => {
    setIsExporting(true);
    onExport();
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
    }, 1500);
  };

  const getFormatIcon = (format: string) => {
    switch(format) {
      case "json": return <FileJson className="h-12 w-12 mr-4 text-blue-500" />;
      case "csv": return <FileText className="h-12 w-12 mr-4 text-green-500" />;
      case "xml": return <FileText className="h-12 w-12 mr-4 text-orange-500" />;
      case "excel": return <FileText className="h-12 w-12 mr-4 text-emerald-500" />;
      default: return <FileJson className="h-12 w-12 mr-4" />;
    }
  };

  const getFileName = (format: string) => {
    const date = new Date().toISOString().split("T")[0];
    switch(format) {
      case "json": return `taskflow-export-${date}.json`;
      case "csv": return `taskflow-export-${date}.csv`;
      case "xml": return `taskflow-export-${date}.xml`;
      case "excel": return `taskflow-export-${date}.xlsx`;
      default: return `taskflow-export-${date}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start Export</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-6">
          {getFormatIcon(format)}
          <div>
            <h3 className="font-medium">{getFileName(format)}</h3>
            <p className="text-sm text-muted-foreground">
              Your task data will be exported as a {format.toUpperCase()} file
            </p>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <Button
            onClick={handleExportClick}
            disabled={isExporting}
            className="flex-1"
          >
            {isExporting ? (
              <>
                <DownloadCloud className="mr-2 h-4 w-4 animate-bounce" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </div>
        
        <div className="mt-6 text-sm text-muted-foreground">
          <h4 className="font-medium text-foreground mb-2">Export Help</h4>
          <ul className="space-y-1 list-disc pl-5">
            <li>Your export will include all selected data fields</li>
            <li>For large datasets, the export may take a few moments</li>
            <li>Exported files are not stored on our servers</li>
            <li>You can re-export at any time with different options</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
