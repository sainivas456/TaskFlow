
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService, PasswordChangeData } from "@/lib/api/auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function UserProfile() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState({
    name: currentUser?.username || "User",
    email: currentUser?.email || "",
    bio: "Task management enthusiast and productivity expert.",
    profileImage: "/placeholder.svg",
  });
  
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSave = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };

  const handlePasswordChange = async (values: PasswordFormValues) => {
    setIsSubmitting(true);
    
    try {
      const passwordData: PasswordChangeData = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      };
      
      await authService.changePassword(passwordData);
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Password change error:", error);
      
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update password. Please check your current password and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            Update your personal information and profile picture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userData.profileImage} alt={userData.name} />
                <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button 
                size="icon"
                variant="secondary" 
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-medium text-lg">{userData.name}</h3>
              <p className="text-sm text-muted-foreground">
                {userData.email}
              </p>
              <Button variant="link" size="sm" className="h-auto p-0">
                Change profile picture
              </Button>
            </div>
          </div>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="md:text-right">
                Full Name
              </Label>
              <Input
                id="name"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="md:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="md:text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="md:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
              <Label htmlFor="bio" className="md:text-right pt-2">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={userData.bio}
                onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                className="md:col-span-3 min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>
            Manage your password and account security options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <FormLabel className="md:text-right">Current Password</FormLabel>
                    <div className="md:col-span-3">
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </div>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <FormLabel className="md:text-right">New Password</FormLabel>
                    <div className="md:col-span-3">
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </div>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <FormLabel className="md:text-right">Confirm Password</FormLabel>
                    <div className="md:col-span-3">
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </div>
                )}
              />
              
              <div className="flex justify-end mt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
