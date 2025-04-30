
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { SunIcon, MoonIcon, LaptopIcon } from "lucide-react";

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Theme settings updated",
      description: "Your theme preferences have been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how TaskFlow looks on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Theme Mode</h3>
            <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
              <div>
                <RadioGroupItem
                  value="light"
                  id="theme-light"
                  className="sr-only"
                />
                <Label
                  htmlFor="theme-light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
                >
                  <SunIcon className="mb-2 h-6 w-6" />
                  Light
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="dark"
                  id="theme-dark"
                  className="sr-only"
                />
                <Label
                  htmlFor="theme-dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
                >
                  <MoonIcon className="mb-2 h-6 w-6" />
                  Dark
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="system"
                  id="theme-system"
                  className="sr-only"
                />
                <Label
                  htmlFor="theme-system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
                >
                  <LaptopIcon className="mb-2 h-6 w-6" />
                  System
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Color Scheme</h3>
            <div className="grid grid-cols-3 gap-4">
              <div
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                onClick={() => toast({
                  title: "Coming soon",
                  description: "Custom color schemes will be available in a future update.",
                })}
              >
                <div className="mb-2 h-6 w-6 rounded-full bg-primary" />
                Default
              </div>
              <div
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                onClick={() => toast({
                  title: "Coming soon",
                  description: "Custom color schemes will be available in a future update.",
                })}
              >
                <div className="mb-2 h-6 w-6 rounded-full bg-blue-500" />
                Blue
              </div>
              <div
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                onClick={() => toast({
                  title: "Coming soon",
                  description: "Custom color schemes will be available in a future update.",
                })}
              >
                <div className="mb-2 h-6 w-6 rounded-full bg-green-500" />
                Green
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave}>Save Appearance</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
