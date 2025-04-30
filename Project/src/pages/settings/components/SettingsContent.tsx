
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "./UserProfile";
import { NotificationSettings } from "./NotificationSettings";
import { ThemeSettings } from "./ThemeSettings";
import { GeneralPreferences } from "./GeneralPreferences";
import { Card } from "@/components/ui/card";

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Tabs 
      defaultValue="profile" 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="space-y-6"
    >
      <TabsList className="grid grid-cols-4 w-full max-w-lg">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <UserProfile />
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <NotificationSettings />
      </TabsContent>

      <TabsContent value="appearance" className="space-y-6">
        <ThemeSettings />
      </TabsContent>

      <TabsContent value="preferences" className="space-y-6">
        <GeneralPreferences />
      </TabsContent>
    </Tabs>
  );
}
