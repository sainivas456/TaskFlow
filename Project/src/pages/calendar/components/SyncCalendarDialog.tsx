
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarSyncConfig } from "../types";
import { Check, Info, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface SyncCalendarDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  syncConfigs: CalendarSyncConfig[];
  onSaveConfigs: (configs: CalendarSyncConfig[]) => void;
  onSyncNow: (provider: "google" | "outlook" | "apple") => Promise<void>;
}

export default function SyncCalendarDialog({
  isOpen,
  setIsOpen,
  syncConfigs,
  onSaveConfigs,
  onSyncNow
}: SyncCalendarDialogProps) {
  const [configs, setConfigs] = useState<CalendarSyncConfig[]>(syncConfigs);
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleToggleSync = (provider: "google" | "outlook" | "apple") => {
    const newConfigs = configs.map(config => 
      config.provider === provider 
        ? { ...config, enabled: !config.enabled } 
        : config
    );
    setConfigs(newConfigs);
  };

  const handleSave = () => {
    onSaveConfigs(configs);
    setIsOpen(false);
    toast.success("Calendar sync settings saved");
  };

  const handleSyncNow = async (provider: "google" | "outlook" | "apple") => {
    try {
      setSyncing(provider);
      await onSyncNow(provider);
      
      // Update last synced time in configs
      const newConfigs = configs.map(config => 
        config.provider === provider 
          ? { ...config, lastSynced: new Date() } 
          : config
      );
      setConfigs(newConfigs);
      
      toast.success(`Synced with ${provider} calendar`);
    } catch (error) {
      toast.error(`Failed to sync with ${provider} calendar`);
    } finally {
      setSyncing(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sync Calendars</DialogTitle>
          <DialogDescription>
            Connect and sync your external calendars to view all your tasks in one place.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="google" className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="google">Google</TabsTrigger>
            <TabsTrigger value="outlook">Outlook</TabsTrigger>
            <TabsTrigger value="apple">Apple</TabsTrigger>
          </TabsList>
          
          {["google", "outlook", "apple"].map((provider) => {
            const config = configs.find(c => c.provider === provider) || {
              provider: provider as "google" | "outlook" | "apple",
              enabled: false,
            };
            
            return (
              <TabsContent key={provider} value={provider} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={`${provider}-sync`}>
                      Enable {provider.charAt(0).toUpperCase() + provider.slice(1)} Calendar
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Sync tasks with your {provider} calendar
                    </p>
                  </div>
                  <Switch
                    id={`${provider}-sync`}
                    checked={config.enabled}
                    onCheckedChange={() => handleToggleSync(config.provider)}
                  />
                </div>
                
                {config.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor={`${provider}-account`}>Account Name (Optional)</Label>
                      <Input
                        id={`${provider}-account`}
                        placeholder={`your.email@${provider}.com`}
                        value={config.accountName || ""}
                        onChange={(e) => {
                          const newConfigs = configs.map(c => 
                            c.provider === provider 
                              ? { ...c, accountName: e.target.value } 
                              : c
                          );
                          setConfigs(newConfigs);
                        }}
                      />
                    </div>
                    
                    {config.lastSynced && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Info size={14} className="mr-2" />
                        Last synced: {config.lastSynced.toLocaleString()}
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleSyncNow(config.provider)}
                        disabled={syncing === provider}
                      >
                        {syncing === provider ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={16} />
                            Sync Now
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
                
                {config.enabled && (
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <p className="text-muted-foreground mb-2">
                      <Info size={14} className="inline mr-2" />
                      In a real implementation, this would:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Request authentication with {provider}</li>
                      <li>Import events from your {provider} calendar</li>
                      <li>Sync tasks bidirectionally</li>
                    </ul>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="gap-2"
          >
            <Check size={16} />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
