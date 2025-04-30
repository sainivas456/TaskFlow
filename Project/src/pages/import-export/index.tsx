
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { ExportContent } from "./components/ExportContent";

const ImportExport = () => {
  useEffect(() => {
    console.log("Export page loaded");
  }, []);

  return (
    <>
      <Helmet>
        <title>Export | TaskFlow</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
        </div>
        <ExportContent />
      </div>
    </>
  );
};

export default ImportExport;
