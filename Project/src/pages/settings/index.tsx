
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { SettingsContent } from "./components/SettingsContent";

const Settings = () => {
  useEffect(() => {
    console.log("Settings page loaded");
  }, []);

  return (
    <>
      <Helmet>
        <title>Settings | TaskFlow</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        <SettingsContent />
      </div>
    </>
  );
};

export default Settings;
